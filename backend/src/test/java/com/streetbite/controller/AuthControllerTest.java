package com.streetbite.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.streetbite.config.CookieSettings;
import com.streetbite.config.JwtRequestFilter;
import com.streetbite.config.OriginValidationFilter;
import com.streetbite.dto.auth.AuthUserResponse;
import com.streetbite.model.User;
import com.streetbite.service.AuthRateLimitService;
import com.streetbite.service.AuthService;
import com.streetbite.service.UserService;
import com.streetbite.util.JwtUtil;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private AuthService authService;

    @MockBean
    private AuthRateLimitService authRateLimitService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private CookieSettings cookieSettings;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtRequestFilter jwtRequestFilter;

    @MockBean
    private OriginValidationFilter originValidationFilter;

    @Test
    void loginSetsSecureCrossSiteCookieAndOmitsTokenFromBody() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setEmail("admin@streetbite.com");
        user.setPasswordHash("hashed");
        user.setDisplayName("Admin User");
        user.setRole(User.Role.ADMIN);
        user.setActive(true);
        user.setEmailVerified(true);

        AuthUserResponse authUserResponse = AuthUserResponse.from(user);

        when(authService.normalizeEmail("admin@streetbite.com")).thenReturn("admin@streetbite.com");
        when(authRateLimitService.check(eq("login"), anyString())).thenReturn(Optional.empty());
        when(authService.getUserByEmail("admin@streetbite.com")).thenReturn(Optional.of(user));
        when(authService.passwordMatches(user, "password123")).thenReturn(true);
        when(authService.buildUserData(user)).thenReturn(authUserResponse);
        when(jwtUtil.generateToken("admin@streetbite.com", 1L, "ADMIN")).thenReturn("jwt-token");
        when(cookieSettings.isSecure()).thenReturn(true);
        when(cookieSettings.getSameSite()).thenReturn("None");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "admin@streetbite.com",
                                "password", "password123"))))
                .andExpect(status().isOk())
                .andExpect(header().string("Set-Cookie", Matchers.containsString("sb_token=jwt-token")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("HttpOnly")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("SameSite=None")))
                .andExpect(header().string("Set-Cookie", Matchers.containsString("Secure")))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andExpect(jsonPath("$.user.email").value("admin@streetbite.com"));
    }

    @Test
    void meRejectsRequestsWithoutCookie() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Authentication cookie is missing"));
    }
}
