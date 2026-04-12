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
        logger.info("Cleaning up Gamification Ghost Accounts...");

        deleteGhostAccount("TheSpiceKing@streetbite.com");
        deleteGhostAccount("MidnightEater@streetbite.com");
        deleteGhostAccount("SugarRush@streetbite.com");
        deleteGhostAccount("StreetBiteBot@streetbite.com");

        logger.info("Gamification cleanup completed.");
    }

    private void deleteGhostAccount(String email) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            userRepository.delete(existing.get());
            logger.info("Deleted ghost account to clean up leaderboard: {}", email);
        }
    }
}
