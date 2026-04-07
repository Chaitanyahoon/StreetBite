package com.streetbite.service;

import com.streetbite.model.*;
import com.streetbite.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class HotTopicService {

    @Autowired
    private HotTopicRepository hotTopicRepository;

    @Autowired
    private TopicCommentRepository topicCommentRepository;

    @Autowired
    private TopicLikeRepository topicLikeRepository;

    @Autowired
    private UserRepository userRepository;

    public List<HotTopic> getAllActiveHotTopics() {
        return hotTopicRepository.findByIsActiveTrueAndIsApprovedTrueOrderByCreatedAtDesc();
    }

    public List<HotTopic> getAllHotTopics() {
        return hotTopicRepository.findAll();
    }

    public HotTopic createHotTopic(HotTopic hotTopic) {
        hotTopic.setActive(true);
        hotTopic.setApproved(true);
        return hotTopicRepository.save(hotTopic);
    }

    public HotTopic createCommunityHotTopic(User user, String title, String content, String imageUrl) {
        validateCommunityTopic(user, title, content);

        HotTopic topic = new HotTopic();
        topic.setTitle(title);
        topic.setContent(content);
        topic.setImageUrl(imageUrl);
        topic.setActive(true);
        topic.setApproved(false);
        topic.setCreatedBy(user);
        topic.setCreatedByDisplayName(user.getDisplayName() != null ? user.getDisplayName() : user.getEmail());

        return hotTopicRepository.save(topic);
    }

    public HotTopic updateHotTopic(Long id, java.util.Map<String, Object> updates) {
        HotTopic topic = hotTopicRepository.findById(id).orElseThrow(() -> new RuntimeException("Topic not found"));
        if (updates.containsKey("title")) {
            topic.setTitle((String) updates.get("title"));
        }
        if (updates.containsKey("content")) {
            topic.setContent((String) updates.get("content"));
        }
        if (updates.containsKey("imageUrl")) {
            topic.setImageUrl((String) updates.get("imageUrl"));
        }
        if (updates.containsKey("isActive")) {
            Object isActive = updates.get("isActive");
            if (isActive instanceof Boolean) {
                topic.setActive((Boolean) isActive);
            }
        }
        if (updates.containsKey("isApproved")) {
            Object isApproved = updates.get("isApproved");
            if (isApproved instanceof Boolean) {
                topic.setApproved((Boolean) isApproved);
            }
        }
        return hotTopicRepository.save(topic);
    }

    private void validateCommunityTopic(User user, String title, String content) {
        if (user == null) {
            throw new RuntimeException("Invalid session. Please log in again");
        }
        if (title == null || title.trim().length() < 8 || title.length() > 140) {
            throw new RuntimeException("Title must be between 8 and 140 characters");
        }
        if (content == null || content.trim().length() < 20 || content.length() > 800) {
            throw new RuntimeException("Content must be between 20 and 800 characters");
        }

        java.time.LocalDateTime since = java.time.LocalDateTime.now().minusHours(24);
        long count = hotTopicRepository.countByCreatedByIdAndCreatedAtAfter(user.getId(), since);
        if (count >= 3) {
            throw new RuntimeException("Topic limit reached. Please wait before posting again.");
        }

        String combined = (title + " " + content).toLowerCase();
        String[] banned = { "spam", "scam", "fraud", "fake", "nsfw", "nude", "porn", "hate", "slur" };
        for (String word : banned) {
            if (combined.contains(word)) {
                throw new RuntimeException("Topic contains restricted content");
            }
        }
    }

    public void deleteHotTopic(Long id) {
        hotTopicRepository.deleteById(id);
    }

    @Transactional
    public TopicComment addComment(Long topicId, Long userId, String text) {
        HotTopic topic = hotTopicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        TopicComment comment = new TopicComment();
        comment.setTopic(topic);
        comment.setUser(user);
        comment.setContent(text);

        return topicCommentRepository.save(comment);
    }

    @Transactional
    public void toggleLike(Long topicId, Long userId) {
        Optional<TopicLike> existingLike = topicLikeRepository.findByTopicIdAndUserId(topicId, userId);
        if (existingLike.isPresent()) {
            topicLikeRepository.delete(existingLike.get());
        } else {
            HotTopic topic = hotTopicRepository.findById(topicId)
                    .orElseThrow(() -> new RuntimeException("Topic not found"));
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

            TopicLike like = new TopicLike();
            like.setTopic(topic);
            like.setUser(user);
            topicLikeRepository.save(like);
        }
    }

    public Long getLikeCount(Long topicId) {
        return topicLikeRepository.countByTopicId(topicId);
    }
}
