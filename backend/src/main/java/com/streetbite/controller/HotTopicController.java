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
    public TopicComment addComment(@PathVariable Long id, @RequestBody Map<String, String> payload,
            @RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractEmail(token.substring(7));
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        return hotTopicService.addComment(id, user.getId(), payload.get("text"));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractEmail(token.substring(7));
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        hotTopicService.toggleLike(id, user.getId());
        return ResponseEntity.ok().build();
    }
}
