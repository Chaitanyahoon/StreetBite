package com.streetbite.service;

import com.streetbite.dto.auth.AuthUserResponse;
import com.streetbite.dto.auth.RegisterRequest;
import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    private static final int VERIFICATION_EXPIRY_MINUTES = 10;
    private static final int RESET_PASSWORD_EXPIRY_MINUTES = 15;

    private final UserService userService;
    private final VendorService vendorService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(
            UserService userService,
            VendorService vendorService,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.userService = userService;
        this.vendorService = vendorService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        String normalized = email.trim().toLowerCase();
        return normalized.isBlank() ? null : normalized;
    }

    public AuthUserResponse buildUserData(User user) {
        AuthUserResponse userData = AuthUserResponse.from(user);
        if (user.getRole() == User.Role.VENDOR) {
            List<Vendor> vendors = vendorService.getVendorsByOwner(user.getId());
            if (!vendors.isEmpty()) {
                userData.setVendorId(vendors.get(0).getId());
            }
        }
        return userData;
    }

    public Optional<User> getUserByEmail(String email) {
        return userService.getUserByEmail(email);
    }

    public Optional<User> getUserById(Long id) {
        return userService.getUserById(id);
    }

    public Optional<User> getUserByResetPasswordToken(String token) {
        return userService.getUserByResetPasswordToken(token);
    }

    public boolean passwordMatches(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }

    @Transactional
    public User registerOrRefreshPendingUser(RegisterRequest payload) {
        String email = normalizeEmail(payload.getEmail());
        String password = payload.getPassword();
        String displayName = payload.getDisplayName();
        String phoneNumber = payload.getPhoneNumber();
        String roleValue = payload.getRole() != null ? payload.getRole() : "USER";
        User.Role role = User.Role.valueOf(roleValue.toUpperCase());

        Optional<User> existingUserOpt = userService.getUserByEmail(email);
        User savedUser;

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.getEmailVerified()) {
                throw new IllegalStateException("USER_ALREADY_EXISTS");
            }

            existingUser.setPasswordHash(passwordEncoder.encode(password));
            existingUser.setDisplayName(displayName);
            existingUser.setPhoneNumber(phoneNumber);
            existingUser.setRole(role);
            existingUser.setActive(true);
            existingUser.setEmailVerified(false);
            clearEmailVerification(existingUser);
            savedUser = userService.saveUser(existingUser);
        } else {
            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setDisplayName(displayName);
            user.setPhoneNumber(phoneNumber);
            user.setRole(role);
            user.setEmailVerified(false);
            savedUser = userService.saveUser(user);
        }

        upsertPendingVendorProfile(savedUser, payload, displayName, phoneNumber);
        return savedUser;
    }

    @Transactional
    public boolean prepareAndSendEmailVerification(User user) {
        String code = generateSixDigitCode();
        user.setEmailVerificationCodeHash(passwordEncoder.encode(code));
        user.setEmailVerificationCodeExpiry(LocalDateTime.now().plusMinutes(VERIFICATION_EXPIRY_MINUTES));
        userService.saveUser(user);
        boolean emailSent = emailService.sendVerificationCodeEmail(user.getEmail(), code);
        if (!emailSent) {
            clearEmailVerification(user);
            userService.saveUser(user);
        }
        return emailSent;
    }

    @Transactional
    public void clearEmailVerification(User user) {
        user.setEmailVerificationCodeHash(null);
        user.setEmailVerificationCodeExpiry(null);
    }

    public boolean isVerificationExpired(User user) {
        return user.getEmailVerificationCodeExpiry() == null
                || user.getEmailVerificationCodeExpiry().isBefore(LocalDateTime.now());
    }

    public boolean matchesVerificationCode(User user, String code) {
        return user.getEmailVerificationCodeHash() != null
                && passwordEncoder.matches(code, user.getEmailVerificationCodeHash());
    }

    @Transactional
    public User markEmailVerified(User user) {
        user.setEmailVerified(true);
        clearEmailVerification(user);
        return userService.saveUser(user);
    }

    @Transactional
    public String issuePasswordResetToken(User user) {
        String token = java.util.UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(RESET_PASSWORD_EXPIRY_MINUTES));
        userService.saveUser(user);
        return token;
    }

    public boolean isResetTokenExpired(User user) {
        return user.getResetPasswordTokenExpiry() == null
                || user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now());
    }

    @Transactional
    public void clearExpiredResetToken(User user) {
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userService.saveUser(user);
    }

    @Transactional
    public User resetPassword(User user, String newPassword) {
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        return userService.saveUser(user);
    }

    public boolean sendPasswordResetEmail(String email, String token) {
        return emailService.sendPasswordResetEmail(email, token);
    }

    public String getLastEmailErrorMessage() {
        return emailService.getLastErrorMessage();
    }

    private void upsertPendingVendorProfile(User user, RegisterRequest payload, String displayName, String phoneNumber) {
        if (user.getRole() != User.Role.VENDOR) {
            return;
        }

        List<Vendor> existingVendors = vendorService.getVendorsByOwner(user.getId());
        Vendor vendor = existingVendors.isEmpty() ? new Vendor() : existingVendors.get(0);
        vendor.setOwner(user);
        vendor.setName(payload.getBusinessName() != null ? payload.getBusinessName() : displayName + "'s Stall");
        vendor.setPhone(phoneNumber);
        vendor.setDescription(vendor.getDescription() != null ? vendor.getDescription() : "New vendor");
        vendor.setCuisine(vendor.getCuisine() != null ? vendor.getCuisine() : "Street Food");

        RegisterRequest.LocationRequest location = payload.getLocation();
        if (location != null) {
            if (location.getLatitude() != null) {
                vendor.setLatitude(location.getLatitude());
            }
            if (location.getLongitude() != null) {
                vendor.setLongitude(location.getLongitude());
            }
        }

        vendorService.saveVendor(vendor);
    }

    private String generateSixDigitCode() {
        return String.format("%06d", new java.security.SecureRandom().nextInt(1_000_000));
    }
}
