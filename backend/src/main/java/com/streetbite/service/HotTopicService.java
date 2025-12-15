package com.streetbite.service;

import com.streetbite.model.*;
import com.streetbite.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
        return hotTopicRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public List<HotTopic> getAllHotTopics() {
        return hotTopicRepository.findAll();
    }

    public HotTopic createHotTopic(HotTopic hotTopic) {
        hotTopic.setActive(true);
        return hotTopicRepository.save(hotTopic);
    }

    public HotTopic updateHotTopic(Long id, HotTopic topicDetails) {
        HotTopic topic = hotTopicRepository.findById(id).orElseThrow(() -> new RuntimeException("Topic not found"));
        topic.setTitle(topicDetails.getTitle());
        topic.setContent(topicDetails.getContent());
        topic.setImageUrl(topicDetails.getImageUrl());
        topic.setActive(topicDetails.isActive());
        return hotTopicRepository.save(topic);
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
        comment.setText(text);

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
