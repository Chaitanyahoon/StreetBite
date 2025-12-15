package com.streetbite.repository;

import com.streetbite.model.TopicComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicCommentRepository extends JpaRepository<TopicComment, Long> {
    List<TopicComment> findByTopicIdOrderByCreatedAtDesc(Long topicId);
}
