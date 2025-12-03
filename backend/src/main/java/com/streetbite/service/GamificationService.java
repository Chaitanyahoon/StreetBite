package com.streetbite.service;

import com.streetbite.model.User;
import com.streetbite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GamificationService {

    @Autowired
    private UserRepository userRepository;

    // XP rewards for different actions
    private static final int XP_DAILY_LOGIN = 50;
    private static final int XP_COMPLETE_CHALLENGE = 50;
    private static final int XP_WIN_GAME = 100;
    private static final int XP_PER_LEVEL = 1000;

    /**
     * Award XP to a user for a specific action
     */
    public User awardXp(Long userId, String actionType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int xpToAward = getXpForAction(actionType);
        int currentXp = user.getXp() != null ? user.getXp() : 0;
        user.setXp(currentXp + xpToAward);

        // Update Level
        int newLevel = calculateLevel(user.getXp());
        user.setLevel(newLevel);

        // Handle Daily Login Streak
        if ("daily_login".equalsIgnoreCase(actionType)) {
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate lastCheckIn = user.getLastCheckIn();

            if (lastCheckIn != null) {
                if (lastCheckIn.plusDays(1).equals(today)) {
                    // Consecutive day
                    user.setStreak((user.getStreak() != null ? user.getStreak() : 0) + 1);
                } else if (!lastCheckIn.equals(today)) {
                    // Broken streak (unless it's same day)
                    user.setStreak(1);
                }
            } else {
                // First check-in
                user.setStreak(1);
            }
            user.setLastCheckIn(today);
        }

        return userRepository.save(user);
    }

    /**
     * Get XP amount for a specific action type
     */
    private int getXpForAction(String actionType) {
        return switch (actionType.toLowerCase()) {
            case "daily_login" -> XP_DAILY_LOGIN;
            case "complete_challenge" -> XP_COMPLETE_CHALLENGE;
            case "win_game" -> XP_WIN_GAME;
            default -> 0;
        };
    }

    /**
     * Calculate user level from XP
     */
    public int calculateLevel(int xp) {
        return (xp / XP_PER_LEVEL) + 1;
    }

    /**
     * Get leaderboard (top 10 users by XP)
     */
    public List<User> getLeaderboard() {
        return userRepository.findTop10ByRoleOrderByXpDesc(User.Role.USER);
    }

    /**
     * Get user stats including rank
     */
    public Map<String, Object> getUserStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int xp = user.getXp() != null ? user.getXp() : 0;
        int level = calculateLevel(xp);
        int rank = calculateUserRank(userId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("xp", xp);
        stats.put("level", user.getLevel() != null ? user.getLevel() : level);
        stats.put("streak", user.getStreak() != null ? user.getStreak() : 0);
        stats.put("rank", rank);
        stats.put("displayName", user.getDisplayName());
        stats.put("email", user.getEmail());
        stats.put("lastCheckIn", user.getLastCheckIn());

        return stats;
    }

    /**
     * Calculate user's rank based on XP
     */
    private int calculateUserRank(Long userId) {
        List<User> allUsers = userRepository.findAllByOrderByXpDesc();
        for (int i = 0; i < allUsers.size(); i++) {
            if (allUsers.get(i).getId().equals(userId)) {
                return i + 1;
            }
        }
        return allUsers.size();
    }

    /**
     * Get user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
}
