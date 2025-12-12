package com.streetbite.repository;

import com.streetbite.model.Discussion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionRepository extends JpaRepository<Discussion, Long> {

    List<Discussion> findByIsActiveTrueOrderByCreatedAtDesc();

    List<Discussion> findAllByOrderByCreatedAtDesc();

    @Query("SELECT d FROM Discussion d ORDER BY d.likesCount DESC")
    List<Discussion> findAllOrderByLikesDesc();
}
