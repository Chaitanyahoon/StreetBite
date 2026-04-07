package com.streetbite.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    private String normalizeHost(String host, String username) {
        String normalizedHost = host != null ? host.trim() : "";
        String normalizedUsername = username != null ? username.trim() : "";

        if (normalizedHost.isBlank() || normalizedHost.contains("@")) {
            if (normalizedUsername.endsWith("@gmail.com")) {
                return "smtp.gmail.com";
            }
        }

        return normalizedHost;
    }

    private String normalizePassword(String password, String username) {
        String normalizedPassword = password != null ? password.trim() : "";
        String normalizedUsername = username != null ? username.trim() : "";

        if (normalizedUsername.endsWith("@gmail.com")) {
            return normalizedPassword.replace(" ", "");
        }

        return normalizedPassword;
    }

    @Bean
    @ConditionalOnMissingBean(JavaMailSender.class)
    public JavaMailSender javaMailSender(
            @Value("${spring.mail.host:smtp.gmail.com}") String host,
            @Value("${spring.mail.port:587}") int port,
            @Value("${spring.mail.username:}") String username,
            @Value("${spring.mail.password:}") String password,
            @Value("${spring.mail.properties.mail.smtp.auth:true}") boolean smtpAuth,
            @Value("${spring.mail.properties.mail.smtp.starttls.enable:true}") boolean startTlsEnable,
            @Value("${spring.mail.properties.mail.smtp.starttls.required:true}") boolean startTlsRequired,
            @Value("${spring.mail.properties.mail.smtp.connectiontimeout:10000}") int connectionTimeout,
            @Value("${spring.mail.properties.mail.smtp.timeout:10000}") int timeout,
            @Value("${spring.mail.properties.mail.smtp.writetimeout:10000}") int writeTimeout,
            @Value("${spring.mail.properties.mail.smtp.ssl.trust:smtp.gmail.com}") String sslTrust) {

        String normalizedUsername = username != null ? username.trim() : "";
        String normalizedHost = normalizeHost(host, normalizedUsername);
        String normalizedPassword = normalizePassword(password, normalizedUsername);
        String normalizedSslTrust = sslTrust != null && !sslTrust.isBlank() ? sslTrust.trim() : normalizedHost;

        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(normalizedHost);
        mailSender.setPort(port);
        mailSender.setUsername(normalizedUsername);
        mailSender.setPassword(normalizedPassword);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", smtpAuth);
        props.put("mail.smtp.starttls.enable", startTlsEnable);
        props.put("mail.smtp.starttls.required", startTlsRequired);
        props.put("mail.smtp.connectiontimeout", connectionTimeout);
        props.put("mail.smtp.timeout", timeout);
        props.put("mail.smtp.writetimeout", writeTimeout);
        if (normalizedSslTrust != null && !normalizedSslTrust.isBlank()) {
            props.put("mail.smtp.ssl.trust", normalizedSslTrust);
        }

        System.out.println("MailConfig initialized with host=" + normalizedHost
                + ", port=" + port
                + ", username=" + (normalizedUsername.isBlank() ? "<blank>" : normalizedUsername));

        return mailSender;
    }
}
