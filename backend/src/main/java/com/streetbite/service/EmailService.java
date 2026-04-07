package com.streetbite.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
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

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@streetbite.com}")
    private String fromEmail;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    @Value("${RESEND_FROM_EMAIL:StreetBite <onboarding@resend.dev>}")
    private String resendFromEmail;

    public boolean canSendEmail() {
        return canSendWithResend() || (mailSender != null && mailHost != null && !mailHost.isBlank());
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

    private boolean canSendWithResend() {
        return resendApiKey != null && !resendApiKey.trim().isBlank();
    }

    private boolean sendEmail(String to, String subject, String htmlContent, String label) {
        if (canSendWithResend()) {
            return sendWithResend(to, subject, htmlContent, label);
        }
        return sendWithSmtp(to, subject, htmlContent, label);
    }

    private boolean sendWithResend(String to, String subject, String htmlContent, String label) {
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "from", resendFromEmail,
                    "to", new String[]{to},
                    "subject", subject,
                    "html", htmlContent));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey.trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                System.out.println(label + " sent successfully via Resend to " + to);
                setLastErrorMessage("OK");
                return true;
            }

            setLastErrorMessage("Resend API error " + response.statusCode() + ": " + response.body());
            System.err.println("Failed to send " + label + " via Resend to " + to + ": " + response.body());
            return false;
        } catch (Exception e) {
            setLastErrorMessage(e.getClass().getSimpleName() + ": " + e.getMessage());
            System.err.println("Failed to send " + label + " via Resend to " + to + ": " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private boolean sendWithSmtp(String to, String subject, String htmlContent, String label) {
        if (mailSender == null || mailHost == null || mailHost.isBlank()) {
            System.err.println("JavaMailSender not configured - email not sent. Check mail properties.");
            setLastErrorMessage("Mail sender is not configured correctly");
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println(label + " sent successfully via SMTP to " + to);
            setLastErrorMessage("OK");
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send " + label + " via SMTP to " + to + ": " + e.getMessage());
            e.printStackTrace();
            if (shouldRetryWithGmailSsl(e)) {
                System.out.println("Retrying " + label + " via Gmail SSL on port 465");
                boolean retrySuccess = sendWithGmailSslFallback(to, subject, htmlContent, label);
                if (retrySuccess) {
                    return true;
                }
            }
            setLastErrorMessage(e.getClass().getSimpleName() + ": " + e.getMessage());
            return false;
        }
    }

    private boolean shouldRetryWithGmailSsl(Exception exception) {
        String normalizedHost = mailHost != null ? mailHost.trim().toLowerCase() : "";
        String message = exception.getMessage() != null ? exception.getMessage().toLowerCase() : "";
        return normalizedHost.contains("gmail")
                && (message.contains("timeout") || message.contains("couldn't connect to host"));
    }

    private boolean sendWithGmailSslFallback(String to, String subject, String htmlContent, String label) {
        if (!(mailSender instanceof JavaMailSenderImpl primarySender)) {
            setLastErrorMessage("Gmail SSL fallback unavailable");
            return false;
        }

        try {
            JavaMailSenderImpl fallbackSender = new JavaMailSenderImpl();
            fallbackSender.setHost("smtp.gmail.com");
            fallbackSender.setPort(465);
            fallbackSender.setUsername(primarySender.getUsername());
            fallbackSender.setPassword(primarySender.getPassword());

            java.util.Properties primaryProps = primarySender.getJavaMailProperties();
            java.util.Properties fallbackProps = fallbackSender.getJavaMailProperties();
            fallbackProps.put("mail.transport.protocol", "smtp");
            fallbackProps.put("mail.smtp.auth", primaryProps.getProperty("mail.smtp.auth", "true"));
            fallbackProps.put("mail.smtp.ssl.enable", "true");
            fallbackProps.put("mail.smtp.starttls.enable", "false");
            fallbackProps.put("mail.smtp.starttls.required", "false");
            fallbackProps.put("mail.smtp.connectiontimeout", primaryProps.getProperty("mail.smtp.connectiontimeout", "10000"));
            fallbackProps.put("mail.smtp.timeout", primaryProps.getProperty("mail.smtp.timeout", "10000"));
            fallbackProps.put("mail.smtp.writetimeout", primaryProps.getProperty("mail.smtp.writetimeout", "10000"));
            fallbackProps.put("mail.smtp.ssl.trust", "smtp.gmail.com");

            MimeMessage message = fallbackSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            fallbackSender.send(message);

            System.out.println(label + " sent successfully via Gmail SSL fallback to " + to);
            setLastErrorMessage("OK");
            return true;
        } catch (Exception fallbackException) {
            System.err.println("Failed Gmail SSL fallback for " + label + " to " + to + ": " + fallbackException.getMessage());
            fallbackException.printStackTrace();
            setLastErrorMessage(fallbackException.getClass().getSimpleName() + ": " + fallbackException.getMessage());
            return false;
        }
    }

    public boolean sendVerificationCodeEmail(String to, String code) {
        System.out.println("==================================================");
        System.out.println("EMAIL VERIFICATION CODE FOR: " + to);
        System.out.println(code);
        System.out.println("==================================================");

        if (!canSendEmail()) {
            System.err.println("JavaMailSender not configured - verification email not sent. Check mail properties.");
            setLastErrorMessage("Mail sender is not configured correctly");
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
            System.err.println("JavaMailSender not configured - 2FA email not sent. Check mail properties.");
            setLastErrorMessage("Mail sender is not configured correctly");
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

        // If mail sender is not configured, just log and return
        if (!canSendEmail()) {
            System.err.println("JavaMailSender not configured - email not sent. Check mail properties.");
            setLastErrorMessage("Mail sender is not configured correctly");
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
