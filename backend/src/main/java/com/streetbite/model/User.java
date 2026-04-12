package com.streetbite.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String passwordHash;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "profile_picture")
    private String profilePicture;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expiry")
    private LocalDateTime resetPasswordTokenExpiry;

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Column(name = "email_verification_code_hash")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String emailVerificationCodeHash;

    @Column(name = "email_verification_code_expiry")
    private LocalDateTime emailVerificationCodeExpiry;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "zodiac_sign")
    private String zodiacSign;

    @Column(name = "xp")
    private Integer xp = 0;

    @Column(name = "spice_xp")
    private Integer spiceXp = 0;

    @Column(name = "sugar_xp")
    private Integer sugarXp = 0;

    @Column(name = "night_owl_xp")
    private Integer nightOwlXp = 0;

    @Column(name = "level")
    private Integer level = 1;

    @Column(name = "streak")
    private Integer streak = 0;

    @Column(name = "last_check_in")
    private java.time.LocalDate lastCheckIn;

    @Column(name = "is_active")
    private Boolean isActive = true;

    public enum Role {
        USER, VENDOR, ADMIN
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    public String getResetPasswordToken() { return resetPasswordToken; }
    public void setResetPasswordToken(String resetPasswordToken) { this.resetPasswordToken = resetPasswordToken; }
    public LocalDateTime getResetPasswordTokenExpiry() { return resetPasswordTokenExpiry; }
    public void setResetPasswordTokenExpiry(LocalDateTime resetPasswordTokenExpiry) { this.resetPasswordTokenExpiry = resetPasswordTokenExpiry; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public Boolean getEmailVerified() { return emailVerified != null ? emailVerified : false; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }
    public String getEmailVerificationCodeHash() { return emailVerificationCodeHash; }
    public void setEmailVerificationCodeHash(String emailVerificationCodeHash) { this.emailVerificationCodeHash = emailVerificationCodeHash; }
    public LocalDateTime getEmailVerificationCodeExpiry() { return emailVerificationCodeExpiry; }
    public void setEmailVerificationCodeExpiry(LocalDateTime emailVerificationCodeExpiry) { this.emailVerificationCodeExpiry = emailVerificationCodeExpiry; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getZodiacSign() { return zodiacSign; }
    public void setZodiacSign(String zodiacSign) { this.zodiacSign = zodiacSign; }
    public Integer getXp() { return xp != null ? xp : 0; }
    public void setXp(Integer xp) { this.xp = xp; }
    public Integer getSpiceXp() { return spiceXp != null ? spiceXp : 0; }
    public void setSpiceXp(Integer spiceXp) { this.spiceXp = spiceXp; }
    public Integer getSugarXp() { return sugarXp != null ? sugarXp : 0; }
    public void setSugarXp(Integer sugarXp) { this.sugarXp = sugarXp; }
    public Integer getNightOwlXp() { return nightOwlXp != null ? nightOwlXp : 0; }
    public void setNightOwlXp(Integer nightOwlXp) { this.nightOwlXp = nightOwlXp; }
    public Integer getLevel() { return level != null ? level : 1; }
    public void setLevel(Integer level) { this.level = level; }
    public Integer getStreak() { return streak != null ? streak : 0; }
    public void setStreak(Integer streak) { this.streak = streak; }
    public java.time.LocalDate getLastCheckIn() { return lastCheckIn; }
    public void setLastCheckIn(java.time.LocalDate lastCheckIn) { this.lastCheckIn = lastCheckIn; }
    public Boolean getActive() { return isActive != null ? isActive : true; }
    public void setActive(Boolean active) { isActive = active; }
}
