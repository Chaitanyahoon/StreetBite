package com.streetbite.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @org.springframework.beans.factory.annotation.Value("${resend.api.key}")
    private String resendApiKey;

    @org.springframework.beans.factory.annotation.Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String to, String token) {
        try {
            com.resend.Resend resend = new com.resend.Resend(resendApiKey);

            String resetLink = frontendUrl + "/reset-password?token=" + token;
            String htmlContent = "<p>To reset your password, please click the link below:</p>" +
                    "<p><a href=\"" + resetLink + "\">" + resetLink + "</a></p>" +
                    "<p>This link expires in 15 minutes.</p>";

            com.resend.services.emails.model.SendEmailRequest sendEmailRequest = com.resend.services.emails.model.SendEmailRequest
                    .builder()
                    .from("StreetBite <onboarding@resend.dev>") // Default Resend sender
                    .to(to)
                    .subject("StreetBite - Password Reset Request")
                    .html(htmlContent)
                    .build();

            com.resend.services.emails.model.SendEmailResponse response = resend.emails().send(sendEmailRequest);

            System.out.println("Password reset email sent to " + to + ". ID: " + response.getId());
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
