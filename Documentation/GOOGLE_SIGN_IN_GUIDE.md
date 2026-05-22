# StreetBite Google Sign-In Blueprint (OAuth to MySQL Sync)

To keep your application-level user tables, gamification system, and reviews perfectly synchronized, we use the **Lazy Registration Flow**. 

Instead of relying solely on Firebase or solely on MySQL, Firebase handles the secure OAuth handshake with Google, and your Spring Boot backend intercepts this token to register/verify the user directly in your MySQL database before returning your secure local session.

---

## 1. The Sync Architecture

```
[Next.js Client]                   [Firebase Auth]            [Spring Boot Backend]             [Aiven MySQL]
       |                                  |                             |                             |
       | 1. Click "Sign in with Google"   |                             |                             |
       |--------------------------------->|                             |                             |
       | 2. Google OAuth success (JWT)    |                             |                             |
       |<---------------------------------|                             |                             |
       |                                                                |                             |
       | 3. Send Firebase JWT to `/api/auth/firebase-login`             |                             |
       |--------------------------------------------------------------->|                             |
       |                                                                | 4. Verify Firebase ID Token |
       |                                                                |    (Local crypt check)      |
       |                                                                |                             |
       |                                                                | 5. Query user by Email      |
       |                                                                |---------------------------->|
       |                                                                |                             |
       |                                                                | 6. User doesn't exist?      |
       |                                                                |    Create user in MySQL!    |
       |                                                                |<----------------------------|
       |                                                                |                             |
       | 7. Return Spring Boot Session Cookie / Local JWT               |                             |
       |<---------------------------------------------------------------|                             |
```

---

## 2. Step-by-Step Implementation

### Step A: Frontend Next.js Google Sign-In Component
Add the Firebase auth provider initialization in [`frontend/lib/firebase-client.ts`](file:///c:/Users/patil/OneDrive/Desktop/streetbite/StreetBite/frontend/lib/firebase-client.ts):

```typescript
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
```

Implement the Google Login button handler in your Login UI page:

```typescript
import { auth, googleProvider } from '@/lib/firebase-client'
import { signInWithPopup } from 'firebase/auth'
import axios from 'axios'
import { toast } from 'sonner'

const handleGoogleLogin = async () => {
    if (!auth) {
        toast.error("Firebase is not configured or disabled.");
        return;
    }

    try {
        // 1. Perform secure Google Sign-in popup on the client
        const result = await signInWithPopup(auth, googleProvider);
        const firebaseIdToken = await result.user.getIdToken();

        // 2. Exchange Firebase token for local Spring Boot application session
        const response = await axios.post('/api/auth/firebase-login', { 
            token: firebaseIdToken 
        }, { withCredentials: true });

        toast.success("Signed in successfully with Google!");
        // Refresh AuthContext to load the newly synchronized user profile
        window.location.href = '/explore';
    } catch (error: any) {
        console.error("Google Auth failed:", error);
        toast.error(error.response?.data?.error || "Google Authentication failed.");
    }
};
```

---

### Step B: Backend Spring Boot Token Exchange Controller
Add a dedicated DTO and RestController to handle the Firebase ID Token verification on the backend:

Create `FirebaseLoginRequest.java`:
```java
package com.streetbite.dto.auth;

public class FirebaseLoginRequest {
    private String token;
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
```

Create the `FirebaseAuthController.java` to parse, verify, and synchronize the user with MySQL:

```java
package com.streetbite.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.streetbite.dto.auth.FirebaseLoginRequest;
import com.streetbite.model.User;
import com.streetbite.repository.UserRepository;
import com.streetbite.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class FirebaseAuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public FirebaseAuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/firebase-login")
    public ResponseEntity<?> exchangeFirebaseToken(
            @RequestBody FirebaseLoginRequest request, 
            HttpServletResponse response) {
        try {
            // 1. Verify the authenticity of the Firebase token locally
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getToken());
            String email = decodedToken.getEmail();
            String name = decodedToken.getName();
            String avatar = decodedToken.getPicture();

            // 2. Query MySQL using the verified email address
            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;

            if (existingUser.isPresent()) {
                user = existingUser.get();
                // Dynamically update profile picture if missing in local DB
                if ((user.getProfilePicture() == null || user.getProfilePicture().isEmpty()) && avatar != null) {
                    user.setProfilePicture(avatar);
                    userRepository.save(user);
                }
            } else {
                // Lazy Registration: Auto-create user profile in MySQL
                user = new User();
                user.setEmail(email);
                user.setDisplayName(name != null ? name : email.split("@")[0]);
                user.setProfilePicture(avatar != null ? avatar : "/avatars/avatar_1.png");
                user.setRole("USER");
                user.setEmailVerified(true);
                user.setActive(true);
                
                // Save user record to MySQL
                user = userRepository.save(user);
                System.out.println("✓ Lazy-registered new Google user in MySQL: " + email);
            }

            // 3. Issue local Spring Boot secure cookie / JWT session
            String localToken = jwtUtil.generateToken(user.getEmail());
            Cookie cookie = new Cookie("SESSION_TOKEN", localToken);
            cookie.setHttpOnly(true);
            cookie.setSecure(true); // secure cookie for HTTPS production
            cookie.setPath("/");
            cookie.setMaxAge(86400); // 1 Day
            response.addCookie(cookie);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "user", user
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid Google session: " + e.getMessage()));
        }
    }
}
```

---

## 3. Resiliency Features & Fault Tolerance

1. **Self-Healing on Network Errors**: If the backend service experiences a network hiccup verifying Google's certificates, the `verifyIdToken` call fails, throwing a safe HTTP `401 Unauthorized` exception to the client. The MySQL database remains clean and uncorrupted.
2. **Graceful UI Fallback**: If a user's network or browser blocks Firebase libraries (due to overly aggressive adblockers), the client-side code will catch the failure and keep the classic email/password sign-in active, keeping the app 100% accessible.
