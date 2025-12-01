package com.streetbite.controller;

import com.streetbite.model.User;
import com.streetbite.service.GamificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
@CrossOrigin(origins = "*")
public class GamificationController {

    @Autowired
    private GamificationService gamificationService;

    /**
     * Get top 10 users leaderboard (PUBLIC - No authentication required)
     * This allows visitors to see the leaderboard and get excited about
     * participating
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<User>> getLeaderboard() {
        List<User> leaderboard = gamificationService.getLeaderboard();
        return ResponseEntity.ok(leaderboard);
    }

    /**
     * Get current user's stats (AUTHENTICATED - Login required)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        String email = authentication.getName();
        User user = getUserByEmail(email);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        Map<String, Object> stats = gamificationService.getUserStats(user.getId());
        return ResponseEntity.ok(stats);
    }

    /**
     * Award XP for a specific action (AUTHENTICATED - Login required to earn XP)
     */
    @PostMapping("/action/{actionType}")
    public ResponseEntity<Map<String, Object>> performAction(
            @PathVariable String actionType,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        String email = authentication.getName();
        User user = getUserByEmail(email);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User updatedUser = gamificationService.awardXp(user.getId(), actionType);
        int newLevel = gamificationService.calculateLevel(updatedUser.getXp());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("actionType", actionType);
        response.put("newXp", updatedUser.getXp());
        response.put("level", newLevel);

        return ResponseEntity.ok(response);
    }

    /**
     * Helper method to get user by email
     */
    private User getUserByEmail(String email) {
        return gamificationService.getUserByEmail(email);
    }
}
