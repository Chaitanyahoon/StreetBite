package com.streetbite.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.credentials.path:./firebase-key.json}")
    private String firebaseConfigPath;

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount = null;
                String base64Credentials = System.getenv("FIREBASE_CREDENTIALS_BASE64");

                if (base64Credentials != null && !base64Credentials.trim().isEmpty()) {
                    System.out.println("Loading Firebase credentials from FIREBASE_CREDENTIALS_BASE64 environment variable...");
                    byte[] decoded = java.util.Base64.getDecoder().decode(base64Credentials.trim());
                    serviceAccount = new java.io.ByteArrayInputStream(decoded);
                } else {
                    System.out.println("Loading Firebase credentials from path: " + firebaseConfigPath);
                    serviceAccount = new FileInputStream(firebaseConfigPath);
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase Application Initialized Successfully");
            }
        } catch (IOException e) {
            System.err.println("WARNING: Could not initialize Firebase. Real-time features will be disabled. Error: "
                    + e.getMessage());
            // We intentionally do not throw an exception here to ensure the main
            // application (MySQL/Spring Boot) continues to function even if Firebase is
            // misconfigured.
        } catch (IllegalArgumentException e) {
            System.err.println("WARNING: Failed to decode Base64 credentials for Firebase. Error: "
                    + e.getMessage());
        }
    }
}
