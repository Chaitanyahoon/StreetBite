package com.streetbite.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private volatile String lastErrorMessage = "Email delivery is unavailable";

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@streetbite.com}")
    private String fromEmail;

    @Value("${spring.mail.host:}")
    private String mailHost;

    public boolean canSendEmail() {
        return mailSender != null && mailHost != null && !mailHost.isBlank();
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

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("StreetBite - Verify Your Email");

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

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("Verification email sent successfully to " + to);
            setLastErrorMessage("OK");
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send verification email to " + to + ": " + e.getMessage());
            e.printStackTrace();
            setLastErrorMessage(e.getClass().getSimpleName() + ": " + e.getMessage());
            return false;
        }
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

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("StreetBite - Your Login Verification Code");

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
                    """
                    .formatted(code);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("2FA email sent successfully to " + to);
            setLastErrorMessage("OK");
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send 2FA email to " + to + ": " + e.getMessage());
            e.printStackTrace();
            setLastErrorMessage(e.getClass().getSimpleName() + ": " + e.getMessage());
            return false;
        }
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

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("StreetBite - Password Reset Request");

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
                    """
                    .formatted(resetLink, resetLink);

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("Password reset email sent successfully to " + to);
            setLastErrorMessage("OK");
            return true;
        } catch (Exception e) {
            // Catch ALL exceptions - don't let email failure crash the request
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
            setLastErrorMessage(e.getClass().getSimpleName() + ": " + e.getMessage());
            return false;
        }
    }
}
