package com.streetbite.controller;

import com.streetbite.dto.zodiac.ZodiacNotSetResponse;
import com.streetbite.dto.zodiac.ZodiacSignRequest;
import com.streetbite.model.User;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.ZodiacService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/zodiac")
public class ZodiacController {

    private final ZodiacService zodiacService;
    private final AuthenticatedUserService authenticatedUserService;

    public ZodiacController(ZodiacService zodiacService, AuthenticatedUserService authenticatedUserService) {
        this.zodiacService = zodiacService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @GetMapping("/sign/{signName}")
    public ResponseEntity<?> getHoroscopeBySign(@PathVariable String signName) {
        var horoscope = zodiacService.getDailyHoroscope(signName);
        if (horoscope == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid zodiac sign"));
        }
        return ResponseEntity.ok(horoscope);
    }

    @GetMapping("/today")
    public ResponseEntity<?> getDailyHoroscope(Authentication authentication) {
        User user = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        if (user.getZodiacSign() == null) {
            return ResponseEntity.ok(new ZodiacNotSetResponse("NOT_SET"));
        }

        return ResponseEntity.ok(zodiacService.getDailyHoroscope(user.getZodiacSign()));
    }

    @PostMapping("/sign")
    public ResponseEntity<?> setZodiacSign(@RequestBody ZodiacSignRequest payload, Authentication authentication) {
        User user = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        String sign = payload.getSign();
        if (sign == null || sign.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Sign is required"));
        }

        return ResponseEntity.ok(zodiacService.updateUserZodiac(user.getId(), sign));
    }

    @PostMapping("/challenge/complete")
    public ResponseEntity<?> completeChallenge(Authentication authentication) {
        User user = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        return ResponseEntity.ok(zodiacService.completeChallenge(user.getId()));
    }
}
