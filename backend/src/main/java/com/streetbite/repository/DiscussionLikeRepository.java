package com.streetbite.repository;

import com.streetbite.model.DiscussionLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DiscussionLikeRepository extends JpaRepository<DiscussionLike, Long> {
    Optional<DiscussionLike> findByDiscussionIdAndUserId(Long discussionId, Long userId);
}
