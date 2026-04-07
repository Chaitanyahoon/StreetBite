package com.streetbite.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Service
public class EmailService {

    private volatile String lastErrorMessage = "Email delivery is unavailable";
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    @Value("${EMAILJS_FROM_EMAIL:noreply@streetbite.com}")
    private String fromEmail;

    @Value("${EMAILJS_SERVICE_ID:}")
    private String emailJsServiceId;

    @Value("${EMAILJS_PUBLIC_KEY:}")
    private String emailJsPublicKey;

    @Value("${EMAILJS_PRIVATE_KEY:}")
    private String emailJsPrivateKey;

    @Value("${EMAILJS_TEMPLATE_ID_AUTH:}")
    private String emailJsAuthTemplateId;

    @Value("${EMAILJS_TEMPLATE_ID_PASSWORD_RESET:}")
    private String emailJsPasswordResetTemplateId;

    public boolean canSendEmail() {
        return canSendWithEmailJs();
    }

    public String getLastErrorMessage() {
        return lastErrorMessage;
    }

    private void setLastErrorMessage(String message) {
        if (message == null || message.isBlank()) {
            this.lastErrorMessage = "Email delivery is unavailable";
            return;
        }

        String normalized = message.replaceAll("\\s+", " ").trim();
        this.lastErrorMessage = normalized;
    }

    private boolean canSendWithEmailJs() {
        return emailJsServiceId != null
                && !emailJsServiceId.trim().isBlank()
                && emailJsPublicKey != null
                && !emailJsPublicKey.trim().isBlank();
    }

    private boolean sendEmail(String to, String subject, String htmlContent, String label) {
        if (canSendWithEmailJs()) {
            String templateId = label.toLowerCase().contains("password reset")
                    ? emailJsPasswordResetTemplateId
                    : emailJsAuthTemplateId;
            if (templateId != null && !templateId.trim().isBlank()) {
                return sendWithEmailJs(to, subject, htmlContent, templateId, label);
            }
        }
        setLastErrorMessage("EmailJS is not configured correctly");
        return false;
    }

    private boolean sendWithEmailJs(String to, String subject, String htmlContent, String templateId, String label) {
        try {
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("service_id", emailJsServiceId.trim());
            payload.put("template_id", templateId.trim());
            payload.put("user_id", emailJsPublicKey.trim());

            if (emailJsPrivateKey != null && !emailJsPrivateKey.trim().isBlank()) {
                payload.put("accessToken", emailJsPrivateKey.trim());
            }

            payload.put("template_params", Map.of(
                    "to_email", to,
                    "to_name", to,
                    "subject", subject,
                    "message", htmlContent,
                    "html_message", htmlContent,
                    "from_name", "StreetBite",
                    "reply_to", fromEmail
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.emailjs.com/api/v1.0/email/send"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                System.out.println(label + " sent successfully via EmailJS to " + to);
                setLastErrorMessage("OK");
                return true;
            }

            setLastErrorMessage("EmailJS API error " + response.statusCode() + ": " + response.body());
            System.err.println("Failed to send " + label + " via EmailJS to " + to + ": " + response.body());
            return false;
        } catch (Exception e) {
            setLastErrorMessage(e.getClass().getSimpleName() + ": " + e.getMessage());
            System.err.println("Failed to send " + label + " via EmailJS to " + to + ": " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean sendVerificationCodeEmail(String to, String code) {
        System.out.println("==================================================");
        System.out.println("EMAIL VERIFICATION CODE FOR: " + to);
        System.out.println(code);
        System.out.println("==================================================");

        if (!canSendEmail()) {
            System.err.println("EmailJS not configured - verification email not sent.");
            setLastErrorMessage("EmailJS is not configured correctly");
            return false;
        }

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ff6b35;">Verify your StreetBite account</h2>
                    <p>Use this 6-digit code to finish creating your account:</p>
                    <div style="margin: 24px 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111;">
                        %s
                    </div>
                    <p style="color: #666;">This code expires in 10 minutes.</p>
                </div>
                """.formatted(code);

        return sendEmail(to, "StreetBite - Verify Your Email", htmlContent, "Verification email");
    }

    public boolean sendTwoFactorCodeEmail(String to, String code) {
        System.out.println("==================================================");
        System.out.println("TWO-FACTOR LOGIN CODE FOR: " + to);
        System.out.println(code);
        System.out.println("==================================================");

        if (!canSendEmail()) {
            System.err.println("EmailJS not configured - 2FA email not sent.");
            setLastErrorMessage("EmailJS is not configured correctly");
            return false;
        }

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ff6b35;">StreetBite Login Verification</h2>
                    <p>Use this one-time code to complete your sign in:</p>
                    <div style="margin: 24px 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111;">
                        %s
                    </div>
                    <p style="color: #666;">This code expires in 10 minutes.</p>
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        If you did not try to sign in, you can ignore this email.
                    </p>
                </div>
                """.formatted(code);

        return sendEmail(to, "StreetBite - Your Login Verification Code", htmlContent, "2FA email");
    }

    public boolean sendPasswordResetEmail(String to, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        // ALWAYS log the link so it can be retrieved from Render logs
        System.out.println("==================================================");
        System.out.println("PASSWORD RESET LINK FOR: " + to);
        System.out.println(resetLink);
        System.out.println("==================================================");

        if (!canSendEmail()) {
            System.err.println("EmailJS not configured - password reset email not sent.");
            setLastErrorMessage("EmailJS is not configured correctly");
            return false;
        }

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ff6b35;">StreetBite Password Reset</h2>
                    <p>You requested to reset your password. Click the button below to proceed:</p>
                    <p style="margin: 30px 0;">
                        <a href="%s" style="background-color: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </p>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; color: #666;">%s</p>
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        This link expires in 15 minutes. If you didn't request this, please ignore this email.
                    </p>
                </div>
                """.formatted(resetLink, resetLink);

        return sendEmail(to, "StreetBite - Password Reset Request", htmlContent, "Password reset email");
    }
}
