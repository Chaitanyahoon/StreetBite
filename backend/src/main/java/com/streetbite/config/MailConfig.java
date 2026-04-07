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

        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", smtpAuth);
        props.put("mail.smtp.starttls.enable", startTlsEnable);
        props.put("mail.smtp.starttls.required", startTlsRequired);
        props.put("mail.smtp.connectiontimeout", connectionTimeout);
        props.put("mail.smtp.timeout", timeout);
        props.put("mail.smtp.writetimeout", writeTimeout);
        if (sslTrust != null && !sslTrust.isBlank()) {
            props.put("mail.smtp.ssl.trust", sslTrust);
        }

        return mailSender;
    }
}
