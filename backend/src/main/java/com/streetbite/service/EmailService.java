package com.streetbite.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

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

    @PostConstruct
    void logEmailJsConfig() {
        logger.info("EmailJS config: service={}, authTemplate={}, resetTemplate={}, publicKeyPresent={}, privateKeyPresent={}",
                sanitize(emailJsServiceId), sanitize(emailJsAuthTemplateId), sanitize(emailJsPasswordResetTemplateId),
                !sanitize(emailJsPublicKey).isBlank(), !sanitize(emailJsPrivateKey).isBlank());
    }

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
        return !sanitize(emailJsServiceId).isBlank() && !sanitize(emailJsPublicKey).isBlank();
    }

    private String sanitize(String value) {
        if (value == null) {
            return "";
        }

        String normalized = value.trim();
        if ((normalized.startsWith("\"") && normalized.endsWith("\""))
                || (normalized.startsWith("'") && normalized.endsWith("'"))) {
            normalized = normalized.substring(1, normalized.length() - 1).trim();
        }
        return normalized;
    }

    private boolean sendEmail(String to, String subject, Map<String, Object> templateParams, String label) {
        if (canSendWithEmailJs()) {
            String templateId = label.toLowerCase().contains("password reset")
                    ? sanitize(emailJsPasswordResetTemplateId)
                    : sanitize(emailJsAuthTemplateId);
            if (!templateId.isBlank()) {
                return sendWithEmailJs(to, templateId, templateParams, label);
            }
        }
        setLastErrorMessage("EmailJS is not configured correctly");
        return false;
    }

    private boolean sendWithEmailJs(String to, String templateId, Map<String, Object> templateParams, String label) {
        try {
            HttpResponse<String> response = sendWithEmailJsAttempt(to, templateId, templateParams, true);
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                logger.info("{} sent successfully via EmailJS to {}", label, to);
                setLastErrorMessage("OK");
                return true;
            }

            if (shouldRetryWithoutPrivateKey(response)) {
                logger.info("Retrying {} via EmailJS without private key", label);
                response = sendWithEmailJsAttempt(to, templateId, templateParams, false);
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    logger.info("{} sent successfully via EmailJS retry to {}", label, to);
                    setLastErrorMessage("OK");
                    return true;
                }
            }

            setLastErrorMessage("EmailJS API error " + response.statusCode() + ": " + response.body());
            logger.error("Failed to send {} via EmailJS to {}: {}", label, to, response.body());
            return false;
        } catch (Exception e) {
            setLastErrorMessage(e.getClass().getSimpleName() + ": " + e.getMessage());
            logger.error("Failed to send {} via EmailJS to {}: {}", label, to, e.getMessage(), e);
            return false;
        }
    }

    private HttpResponse<String> sendWithEmailJsAttempt(
            String to,
            String templateId,
            Map<String, Object> templateParams,
            boolean includePrivateKey) throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("service_id", sanitize(emailJsServiceId));
        payload.put("template_id", sanitize(templateId));
        payload.put("user_id", sanitize(emailJsPublicKey));

        String privateKey = sanitize(emailJsPrivateKey);
        if (includePrivateKey && !privateKey.isBlank()) {
            payload.put("accessToken", privateKey);
        }

        Map<String, Object> resolvedTemplateParams = new HashMap<>(templateParams);
        resolvedTemplateParams.putIfAbsent("to_email", to);
        resolvedTemplateParams.putIfAbsent("to_name", to);
        resolvedTemplateParams.putIfAbsent("from_name", "StreetBite");
        resolvedTemplateParams.putIfAbsent("reply_to", sanitize(fromEmail));
        payload.put("template_params", resolvedTemplateParams);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.emailjs.com/api/v1.0/email/send"))
                .header("Content-Type", "application/json")
                .header("Accept", "text/plain, application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private boolean shouldRetryWithoutPrivateKey(HttpResponse<String> response) {
        String privateKey = sanitize(emailJsPrivateKey);
        if (privateKey.isBlank()) {
            return false;
        }

        int status = response.statusCode();
        String body = response.body() != null ? response.body().toLowerCase() : "";
        return status == 401 || status == 403 || status == 404 || body.contains("account not found");
    }

    public boolean sendVerificationCodeEmail(String to, String code) {
        logger.debug("==================================================");
        logger.debug("EMAIL VERIFICATION CODE FOR: {}", to);
        logger.debug("{}", code);
        logger.debug("==================================================");

        if (!canSendEmail()) {
            logger.warn("EmailJS not configured - verification email not sent.");
            setLastErrorMessage("EmailJS is not configured correctly");
            return false;
        }

        Map<String, Object> templateParams = new HashMap<>();
        templateParams.put("subject", "StreetBite - Verify Your Email");
        templateParams.put("message", code);
        templateParams.put("verification_code", code);
        templateParams.put("intro_text", "Use this 6-digit code to finish creating your account.");
        templateParams.put("expiry_text", "This code expires in 10 minutes.");
        templateParams.put("html_message", "Use this 6-digit code to finish creating your account.");

        return sendEmail(to, "StreetBite - Verify Your Email", templateParams, "Verification email");
    }

    public boolean sendPasswordResetEmail(String to, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        // ALWAYS log the link so it can be retrieved from Render logs
        logger.debug("==================================================");
        logger.debug("PASSWORD RESET LINK FOR: {}", to);
        logger.debug("{}", resetLink);
        logger.debug("==================================================");

        if (!canSendEmail()) {
            logger.warn("EmailJS not configured - password reset email not sent.");
            setLastErrorMessage("EmailJS is not configured correctly");
            return false;
        }

        Map<String, Object> templateParams = new HashMap<>();
        templateParams.put("subject", "StreetBite - Password Reset Request");
        templateParams.put("message", resetLink);
        templateParams.put("reset_link", resetLink);
        templateParams.put("intro_text", "We received a request to reset your password.");
        templateParams.put("expiry_text", "This reset link expires in 15 minutes.");
        templateParams.put("html_message", "Use the reset button or the link below.");

        return sendEmail(to, "StreetBite - Password Reset Request", templateParams, "Password reset email");
    }
}
