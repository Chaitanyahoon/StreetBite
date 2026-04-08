package com.streetbite.service;

import com.streetbite.dto.hottopic.HotTopicCreateRequest;
import com.streetbite.dto.hottopic.HotTopicUpdateRequest;
import com.streetbite.model.HotTopic;
import com.streetbite.model.TopicComment;
import com.streetbite.model.TopicLike;
import com.streetbite.model.User;
import com.streetbite.repository.HotTopicRepository;
import com.streetbite.repository.TopicCommentRepository;
import com.streetbite.repository.TopicLikeRepository;
import com.streetbite.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class HotTopicService {

    private final HotTopicRepository hotTopicRepository;
    private final TopicCommentRepository topicCommentRepository;
    private final TopicLikeRepository topicLikeRepository;
    private final UserRepository userRepository;

    public HotTopicService(
            HotTopicRepository hotTopicRepository,
            TopicCommentRepository topicCommentRepository,
            TopicLikeRepository topicLikeRepository,
            UserRepository userRepository) {
        this.hotTopicRepository = hotTopicRepository;
        this.topicCommentRepository = topicCommentRepository;
        this.topicLikeRepository = topicLikeRepository;
        this.userRepository = userRepository;
    }

    public List<HotTopic> getAllActiveHotTopics() {
        return hotTopicRepository.findByIsActiveTrueAndIsApprovedTrueOrderByCreatedAtDesc();
    }

    public List<HotTopic> getAllHotTopics() {
        return hotTopicRepository.findAll();
    }

    public HotTopic createHotTopic(HotTopicCreateRequest request) {
        HotTopic hotTopic = new HotTopic();
        hotTopic.setTitle(request.getTitle());
        hotTopic.setContent(request.getContent());
        hotTopic.setImageUrl(request.getImageUrl());
        String cityName = normalizeNullable(request.getCityName());
        validateCityName(cityName);
        hotTopic.setCityName(cityName);
        applyCoordinates(hotTopic, request.getLatitude(), request.getLongitude());
        hotTopic.setActive(true);
        hotTopic.setApproved(true);
        return hotTopicRepository.save(hotTopic);
    }

    public HotTopic createCommunityHotTopic(
            User user,
            String title,
            String content,
            String imageUrl,
            String cityName,
            Double latitude,
            Double longitude) {
        validateCommunityTopic(user, title, content);
        String normalizedCityName = normalizeNullable(cityName);
        validateCityName(normalizedCityName);
        validateCoordinateRange(latitude, longitude);

        HotTopic topic = new HotTopic();
        topic.setTitle(title);
        topic.setContent(content);
        topic.setImageUrl(imageUrl);
        topic.setCityName(normalizedCityName);
        applyCoordinates(topic, latitude, longitude);
        topic.setActive(true);
        topic.setApproved(false);
        topic.setCreatedBy(user);
        topic.setCreatedByDisplayName(user.getDisplayName() != null ? user.getDisplayName() : user.getEmail());

        return hotTopicRepository.save(topic);
    }

    public HotTopic updateHotTopic(Long id, HotTopicUpdateRequest updates) {
        HotTopic topic = hotTopicRepository.findById(id).orElseThrow(() -> new RuntimeException("Topic not found"));
        if (updates.getTitle() != null) {
            topic.setTitle(updates.getTitle());
        }
        if (updates.getContent() != null) {
            topic.setContent(updates.getContent());
        }
        if (updates.getImageUrl() != null) {
            topic.setImageUrl(updates.getImageUrl());
        }
        if (updates.getCityName() != null) {
            String nextCityName = normalizeNullable(updates.getCityName());
            validateCityName(nextCityName);
            topic.setCityName(nextCityName);
        }
        if (updates.getLatitude() != null || updates.getLongitude() != null) {
            Double nextLatitude = updates.getLatitude() != null ? updates.getLatitude() : topic.getLatitude();
            Double nextLongitude = updates.getLongitude() != null ? updates.getLongitude() : topic.getLongitude();
            applyCoordinates(topic, nextLatitude, nextLongitude);
        }
        if (updates.getIsActive() != null) {
            topic.setActive(updates.getIsActive());
        }
        if (updates.getIsApproved() != null) {
            topic.setApproved(updates.getIsApproved());
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

        if (text == null || text.trim().length() < 2 || text.length() > 400) {
            throw new RuntimeException("Comment must be between 2 and 400 characters");
        }

        TopicComment comment = new TopicComment();
        comment.setTopic(topic);
        comment.setUser(user);
        comment.setContent(text.trim());

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

    private void applyCoordinates(HotTopic topic, Double latitude, Double longitude) {
        validateCoordinateRange(latitude, longitude);
        topic.setLatitude(latitude);
        topic.setLongitude(longitude);
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void validateCoordinateRange(Double latitude, Double longitude) {
        if ((latitude == null) != (longitude == null)) {
            throw new RuntimeException("Both latitude and longitude are required when setting coordinates");
        }
        if (latitude != null && (latitude < -90 || latitude > 90)) {
            throw new RuntimeException("Invalid latitude: must be between -90 and 90");
        }
        if (longitude != null && (longitude < -180 || longitude > 180)) {
            throw new RuntimeException("Invalid longitude: must be between -180 and 180");
        }
    }

    private void validateCityName(String cityName) {
        if (cityName != null && cityName.length() > 120) {
            throw new RuntimeException("City name is too long");
        }
    }
}
