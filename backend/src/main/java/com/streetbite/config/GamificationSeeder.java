package com.streetbite.config;

import com.streetbite.model.User;
import com.streetbite.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class GamificationSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(GamificationSeeder.class);
    private final UserRepository userRepository;

    public GamificationSeeder(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        logger.info("Checking Gamification Ghost Accounts...");

        createGhostAccount("TheSpiceKing@streetbite.com", "TheSpiceKing", 1, 14200, 200, 50);
        createGhostAccount("MidnightEater@streetbite.com", "MidnightEater", 2, 50, 400, 18500);
        createGhostAccount("SugarRush@streetbite.com", "SugarRush", 3, 100, 15000, 200);
        createGhostAccount("StreetBiteBot@streetbite.com", "StreetBiteBot", 4, 1000, 1000, 1000);

        logger.info("Gamification seeding completed.");
    }

    private void createGhostAccount(String email, String displayName, int avatarId, int spiceXp, int sugarXp, int nightOwlXp) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isEmpty()) {
            User ghost = new User();
            ghost.setEmail(email);
            // Some random unusable password hash
            ghost.setPasswordHash("$2a$10$xyz123abc456dummyhash......................");
            ghost.setDisplayName(displayName);
            ghost.setProfilePicture("https://i.pravatar.cc/100?img=" + avatarId);
            ghost.setRole(User.Role.USER);
            ghost.setEmailVerified(true);
            ghost.setActive(true);
            
            // Set massive XP fields
            int totalXp = spiceXp + sugarXp + nightOwlXp;
            ghost.setXp(totalXp);
            ghost.setSpiceXp(spiceXp);
            ghost.setSugarXp(sugarXp);
            ghost.setNightOwlXp(nightOwlXp);
            
            // Just raw math for level approximation
            double level = (1 + Math.sqrt(1 + 0.08 * totalXp)) / 2;
            ghost.setLevel((int) Math.floor(level));

            userRepository.save(ghost);
            logger.info("Created ghost account: {}", displayName);
        }
    }
}
