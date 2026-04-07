package com.streetbite.service;

import com.streetbite.dto.user.UserUpdateRequest;
import com.streetbite.model.User;
import com.streetbite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserByResetPasswordToken(String token) {
        return userRepository.findByResetPasswordToken(token);
    }

    @Transactional
    public User updateProfile(User user, UserUpdateRequest updateRequest) {
        if (updateRequest.getDisplayName() != null) {
            user.setDisplayName(updateRequest.getDisplayName().trim());
        }

        if (updateRequest.getPhoneNumber() != null) {
            user.setPhoneNumber(updateRequest.getPhoneNumber().trim());
        }

        if (updateRequest.getProfilePicture() != null) {
            user.setProfilePicture(updateRequest.getProfilePicture().trim());
        }

        return userRepository.save(user);
    }

    @Transactional
    public User updateActiveStatus(User user, boolean isActive) {
        user.setActive(isActive);
        return userRepository.save(user);
    }
}
