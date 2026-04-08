package com.streetbite.service;

import com.streetbite.model.User;
import com.streetbite.repository.UserRepository;
import com.streetbite.security.AuthenticatedUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticatedUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthenticatedUserService authenticatedUserService;

    @Test
    void findsActiveAuthenticatedUserFromPrincipalEmail() {
        User user = new User();
        user.setEmail("user@streetbite.com");
        user.setActive(true);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "user@streetbite.com",
                null,
                Collections.emptyList());
        when(userRepository.findByEmail("user@streetbite.com")).thenReturn(Optional.of(user));

        assertThat(authenticatedUserService.findAuthenticatedUser(authentication)).contains(user);
    }

    @Test
    void rejectsInactiveAuthenticatedUser() {
        User user = new User();
        user.setEmail("banned@streetbite.com");
        user.setActive(false);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "banned@streetbite.com",
                null,
                Collections.emptyList());
        when(userRepository.findByEmail("banned@streetbite.com")).thenReturn(Optional.of(user));

        assertThat(authenticatedUserService.findAuthenticatedUser(authentication)).isEmpty();
    }
}
