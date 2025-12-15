package com.streetbite.repository;

import com.streetbite.model.TopicLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TopicLikeRepository extends JpaRepository<TopicLike, Long> {
    Optional<TopicLike> findByTopicIdAndUserId(Long topicId, Long userId);

    Long countByTopicId(Long topicId);
}
