package com.streetbite.security;

import com.streetbite.model.User;
import com.streetbite.repository.UserRepository;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthenticatedUserService {

    private final UserRepository userRepository;

    public AuthenticatedUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> findAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        String email = authentication.getName();
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }

        return userRepository.findByEmail(email)
                .filter(User::getActive);
    }

    public boolean isAdmin(User user) {
        return user != null && user.getRole() == User.Role.ADMIN;
    }
}
