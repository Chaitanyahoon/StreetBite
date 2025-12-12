package com.streetbite.repository;

import com.streetbite.model.DiscussionComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionCommentRepository extends JpaRepository<DiscussionComment, Long> {

    List<DiscussionComment> findByDiscussionIdOrderByCreatedAtDesc(Long discussionId);

    Long countByDiscussionId(Long discussionId);
}
