package com.streetbite.controller;

import com.streetbite.dto.gamification.GamificationActionResponse;
import com.streetbite.dto.gamification.LeaderboardUserResponse;
import com.streetbite.dto.gamification.UserStatsResponse;
import com.streetbite.model.User;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.GamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

    private final GamificationService gamificationService;
    private final AuthenticatedUserService authenticatedUserService;

    public GamificationController(
            GamificationService gamificationService,
            AuthenticatedUserService authenticatedUserService) {
        this.gamificationService = gamificationService;
        this.authenticatedUserService = authenticatedUserService;
    }

    /**
     * Get top 10 users leaderboard (PUBLIC - No authentication required)
     * This allows visitors to see the leaderboard and get excited about
     * participating
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardUserResponse>> getLeaderboard() {
        List<LeaderboardUserResponse> leaderboard = gamificationService.getLeaderboard();
        return ResponseEntity.ok(leaderboard);
    }

    /**
     * Get current user's stats (AUTHENTICATED - Login required)
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats(Authentication authentication) {
        User user = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        UserStatsResponse stats = gamificationService.getUserStats(user.getId());
        return ResponseEntity.ok(stats);
    }

    /**
     * Award XP for a specific action (AUTHENTICATED - Login required to earn XP)
     */
    @PostMapping("/action/{actionType}")
    public ResponseEntity<?> performAction(
            @PathVariable String actionType,
            Authentication authentication) {

        User user = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        User updatedUser = gamificationService.awardXp(user.getId(), actionType);
        GamificationActionResponse response = gamificationService.buildActionResponse(updatedUser, actionType);
        return ResponseEntity.ok(response);
    }
}
