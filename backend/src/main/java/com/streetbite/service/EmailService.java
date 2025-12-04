package com.streetbite.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private org.springframework.mail.javamail.JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String to, String token) {
        try {
            org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("StreetBite - Password Reset Request");
            String resetLink = "http://localhost:3000/reset-password?token=" + token;
            message.setText("To reset your password, please click the link below:\n\n" + resetLink
                    + "\n\nThis link expires in 15 minutes.");

            mailSender.send(message);
            System.out.println("Password reset email sent to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
