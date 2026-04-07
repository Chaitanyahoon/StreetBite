package com.streetbite.service;

import com.streetbite.dto.gamification.GamificationActionResponse;
import com.streetbite.dto.gamification.LeaderboardUserResponse;
import com.streetbite.dto.gamification.UserStatsResponse;
import com.streetbite.model.User;
import com.streetbite.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GamificationService {

    private final UserRepository userRepository;

    public GamificationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // XP rewards for different actions
    private static final int XP_DAILY_LOGIN = 50;
    private static final int XP_COMPLETE_CHALLENGE = 50;
    private static final int XP_WIN_GAME = 100;
    private static final int XP_COMMUNITY_POST = 10;

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
            case "community_post" -> XP_COMMUNITY_POST;
            default -> 0;
        };
    }

    /**
     * Calculate user level from XP
     * Formula matches frontend: XP = level * (level - 1) * 50
     * Inverse: Level = (1 + sqrt(1 + 0.08 * XP)) / 2
     */
    public int calculateLevel(int xp) {
        if (xp < 0)
            return 1;
        // Using the quadratic formula solution for L^2 - L - (xp/50) = 0
        // L = (1 + Math.sqrt(1 + 4 * (xp / 50.0))) / 2
        double level = (1 + Math.sqrt(1 + 0.08 * xp)) / 2;
        return (int) Math.floor(level);
    }

    /**
     * Get leaderboard (top 10 users by XP) - excludes banned users
     */
    public List<LeaderboardUserResponse> getLeaderboard() {
        return userRepository.findTop10ByRoleAndIsActiveTrueOrderByXpDesc(User.Role.USER).stream()
                .map(user -> LeaderboardUserResponse.from(user, calculateLevel(user.getXp() != null ? user.getXp() : 0)))
                .toList();
    }

    /**
     * Get user stats including rank
     */
    public UserStatsResponse getUserStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int xp = user.getXp() != null ? user.getXp() : 0;
        int level = calculateLevel(xp);
        int rank = calculateUserRank(userId);

        UserStatsResponse stats = new UserStatsResponse();
        stats.setXp(xp);
        stats.setLevel(user.getLevel() != null ? user.getLevel() : level);
        stats.setStreak(user.getStreak() != null ? user.getStreak() : 0);
        stats.setRank(rank);
        stats.setDisplayName(user.getDisplayName());
        stats.setEmail(user.getEmail());
        stats.setLastCheckIn(user.getLastCheckIn());
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

    public GamificationActionResponse buildActionResponse(User updatedUser, String actionType) {
        GamificationActionResponse response = new GamificationActionResponse();
        response.setSuccess(true);
        response.setActionType(actionType);
        response.setNewXp(updatedUser.getXp() != null ? updatedUser.getXp() : 0);
        response.setLevel(calculateLevel(updatedUser.getXp() != null ? updatedUser.getXp() : 0));
        return response;
    }
}
