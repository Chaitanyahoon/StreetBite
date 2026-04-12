package com.streetbite.repository;

import com.streetbite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByResetPasswordToken(String token);
    
    List<User> findTop10ByOrderByXpDesc();

    List<User> findTop10ByRoleOrderByXpDesc(User.Role role);

    // Leaderboard query that excludes banned users (isActive = false)
    List<User> findTop10ByRoleAndIsActiveTrueOrderByXpDesc(User.Role role);

    // Niche Leaderboard queries
    List<User> findTop10ByRoleAndIsActiveTrueOrderBySpiceXpDesc(User.Role role);
    List<User> findTop10ByRoleAndIsActiveTrueOrderBySugarXpDesc(User.Role role);
    List<User> findTop10ByRoleAndIsActiveTrueOrderByNightOwlXpDesc(User.Role role);

    List<User> findAllByOrderByXpDesc();

    List<User> findByCreatedAtAfter(java.time.LocalDateTime date);

    long countByCreatedAtAfter(java.time.LocalDateTime date);

    long countByRole(User.Role role);

    long countByRoleAndCreatedAtAfter(User.Role role, java.time.LocalDateTime date);
}
