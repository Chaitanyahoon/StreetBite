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
                InputStream serviceAccount = new FileInputStream(firebaseConfigPath);
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
        }
    }
}
