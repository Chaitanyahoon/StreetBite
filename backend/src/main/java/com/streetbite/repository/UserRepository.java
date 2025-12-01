package com.streetbite.repository;

import com.streetbite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findTop10ByOrderByXpDesc();

    List<User> findTop10ByRoleOrderByXpDesc(User.Role role);

    List<User> findAllByOrderByXpDesc();
}
