package com.streetbite.controller;

import com.streetbite.model.HotTopic;
import com.streetbite.model.TopicComment;
import com.streetbite.model.User;
import com.streetbite.service.HotTopicService;
import com.streetbite.repository.UserRepository;
import com.streetbite.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hottopics")
public class HotTopicController {

    @Autowired
    private HotTopicService hotTopicService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public List<HotTopic> getAllActive() {
        return hotTopicService.getAllActiveHotTopics();
    }

    @GetMapping("/admin/all")
    public List<HotTopic> getAll() {
        return hotTopicService.getAllHotTopics();
    }

    @PostMapping
    public HotTopic create(@RequestBody HotTopic hotTopic) {
        return hotTopicService.createHotTopic(hotTopic);
    }

    @PutMapping("/{id}")
    public HotTopic update(@PathVariable Long id, @RequestBody HotTopic hotTopic) {
        return hotTopicService.updateHotTopic(id, hotTopic);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        hotTopicService.deleteHotTopic(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, String> payload,
            @CookieValue(value = "jwt", required = false) String jwtToken) {
        try {
            // Validate token
            if (jwtToken == null || !jwtToken.contains(".") || jwtToken.split("\\.").length != 3) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid session. Please log in again"));
            }

            String email = jwtUtil.extractEmail(jwtToken);
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            TopicComment comment = hotTopicService.addComment(id, user.getId(), payload.get("text"));

            // Return simple response to avoid serialization issues
            return ResponseEntity.ok(Map.of(
                    "id", comment.getId(),
                    "content", comment.getContent(),
                    "createdAt", comment.getCreatedAt().toString(),
                    "userId", user.getId(),
                    "userName", user.getDisplayName() != null ? user.getDisplayName() : user.getEmail()));
        } catch (Exception e) {
            System.err.println("Failed to add comment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Long id,
            @CookieValue(value = "jwt", required = false) String jwtToken) {
        try {
            // Validate token
            if (jwtToken == null || !jwtToken.contains(".") || jwtToken.split("\\.").length != 3) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid session. Please log in again"));
            }

            String email = jwtUtil.extractEmail(jwtToken);
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            hotTopicService.toggleLike(id, user.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Failed to toggle like: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
