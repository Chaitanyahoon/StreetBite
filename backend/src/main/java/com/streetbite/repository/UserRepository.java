package com.streetbite.repository;

import com.streetbite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByResetPasswordToken(String token);
    
    List<User> findTop50ByOrderByXpDesc();

    List<User> findTop50ByRoleOrderByXpDesc(User.Role role);

    // Leaderboard query that excludes banned users (isActive = false)
    List<User> findTop50ByRoleAndIsActiveTrueOrderByXpDesc(User.Role role);

    // Niche Leaderboard queries
    List<User> findTop50ByRoleAndIsActiveTrueOrderBySpiceXpDesc(User.Role role);
    List<User> findTop50ByRoleAndIsActiveTrueOrderBySugarXpDesc(User.Role role);
    List<User> findTop50ByRoleAndIsActiveTrueOrderByNightOwlXpDesc(User.Role role);

    List<User> findAllByOrderByXpDesc();

    List<User> findByCreatedAtAfter(java.time.LocalDateTime date);

    long countByCreatedAtAfter(java.time.LocalDateTime date);

    long countByRole(User.Role role);

    long countByRoleAndCreatedAtAfter(User.Role role, java.time.LocalDateTime date);
}
