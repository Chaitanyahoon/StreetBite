package com.streetbite.service;

import com.streetbite.dto.gamification.GamificationActionResponse;
import com.streetbite.dto.gamification.LeaderboardUserResponse;
import com.streetbite.dto.gamification.UserStatsResponse;
import com.streetbite.model.User;
import com.streetbite.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

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

    public User awardXp(Long userId, String actionType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int xpToAward = getXpForAction(actionType);
        int currentXp = user.getXp() != null ? user.getXp() : 0;
        user.setXp(currentXp + xpToAward);

        int newLevel = calculateLevel(user.getXp());
        user.setLevel(newLevel);

        if ("daily_login".equalsIgnoreCase(actionType)) {
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate lastCheckIn = user.getLastCheckIn();

            if (lastCheckIn != null) {
                if (lastCheckIn.plusDays(1).equals(today)) {
                    user.setStreak((user.getStreak() != null ? user.getStreak() : 0) + 1);
                } else if (!lastCheckIn.equals(today)) {
                    user.setStreak(1);
                }
            } else {
                user.setStreak(1);
            }
            user.setLastCheckIn(today);
        }

        return userRepository.save(user);
    }

    private int getXpForAction(String actionType) {
        return switch (actionType.toLowerCase()) {
            case "daily_login" -> XP_DAILY_LOGIN;
            case "complete_challenge" -> XP_COMPLETE_CHALLENGE;
            case "win_game" -> XP_WIN_GAME;
            case "community_post" -> XP_COMMUNITY_POST;
            default -> 0;
        };
    }

    public int calculateLevel(int xp) {
        if (xp < 0) return 1;
        double level = (1 + Math.sqrt(1 + 0.08 * xp)) / 2;
        return (int) Math.floor(level);
    }

    public List<LeaderboardUserResponse> getLeaderboard() {
        return userRepository.findTop10ByRoleAndIsActiveTrueOrderByXpDesc(User.Role.USER).stream()
                .map(user -> LeaderboardUserResponse.from(user, calculateLevel(user.getXp() != null ? user.getXp() : 0)))
                .toList();
    }

    public Map<String, List<LeaderboardUserResponse>> getNicheLeaderboards() {
        Map<String, List<LeaderboardUserResponse>> leaderboards = new HashMap<>();
        
        leaderboards.put("spice", userRepository.findTop10ByRoleAndIsActiveTrueOrderBySpiceXpDesc(User.Role.USER).stream()
                .filter(u -> u.getSpiceXp() > 0)
                .map(user -> LeaderboardUserResponse.fromNiche(user, user.getSpiceXp()))
                .toList());
                
        leaderboards.put("sugar", userRepository.findTop10ByRoleAndIsActiveTrueOrderBySugarXpDesc(User.Role.USER).stream()
                .filter(u -> u.getSugarXp() > 0)
                .map(user -> LeaderboardUserResponse.fromNiche(user, user.getSugarXp()))
                .toList());
                
        leaderboards.put("night", userRepository.findTop10ByRoleAndIsActiveTrueOrderByNightOwlXpDesc(User.Role.USER).stream()
                .filter(u -> u.getNightOwlXp() > 0)
                .map(user -> LeaderboardUserResponse.fromNiche(user, user.getNightOwlXp()))
                .toList());
                
        return leaderboards;
    }

    public User awardNicheXp(Long userId, String niche, int amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("spice".equalsIgnoreCase(niche)) {
            user.setSpiceXp(user.getSpiceXp() + amount);
        } else if ("sugar".equalsIgnoreCase(niche)) {
            user.setSugarXp(user.getSugarXp() + amount);
        } else if ("night".equalsIgnoreCase(niche)) {
            user.setNightOwlXp(user.getNightOwlXp() + amount);
        }

        // Add to global XP too so they visually level up
        int currentXp = user.getXp() != null ? user.getXp() : 0;
        user.setXp(currentXp + amount);
        user.setLevel(calculateLevel(user.getXp()));

        return userRepository.save(user);
    }

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

    private int calculateUserRank(Long userId) {
        List<User> allUsers = userRepository.findAllByOrderByXpDesc();
        for (int i = 0; i < allUsers.size(); i++) {
            if (allUsers.get(i).getId().equals(userId)) {
                return i + 1;
            }
        }
        return allUsers.size();
    }

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
