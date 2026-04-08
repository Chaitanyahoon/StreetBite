package com.streetbite.controller;

import com.streetbite.dto.hottopic.CommunityTopicRequest;
import com.streetbite.dto.hottopic.HotTopicCommentCreateRequest;
import com.streetbite.dto.hottopic.HotTopicCommentResponse;
import com.streetbite.dto.hottopic.HotTopicCreateRequest;
import com.streetbite.dto.hottopic.HotTopicResponse;
import com.streetbite.dto.hottopic.HotTopicUpdateRequest;
import com.streetbite.dto.hottopic.TopicSubmissionResponse;
import com.streetbite.model.HotTopic;
import com.streetbite.model.TopicComment;
import com.streetbite.model.User;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.HotTopicService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hottopics")
public class HotTopicController {

    private final HotTopicService hotTopicService;
    private final AuthenticatedUserService authenticatedUserService;

    public HotTopicController(HotTopicService hotTopicService, AuthenticatedUserService authenticatedUserService) {
        this.hotTopicService = hotTopicService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @GetMapping
    public List<HotTopicResponse> getAllActive() {
        return hotTopicService.getAllActiveHotTopics().stream().map(HotTopicResponse::from).toList();
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAll(Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        List<HotTopicResponse> topics = hotTopicService.getAllHotTopics().stream().map(HotTopicResponse::from).toList();
        return ResponseEntity.ok(topics);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody HotTopicCreateRequest request, Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        try {
            HotTopic created = hotTopicService.createHotTopic(request);
            return ResponseEntity.ok(HotTopicResponse.from(created));
        } catch (RuntimeException exception) {
            return badRequest(exception.getMessage() != null ? exception.getMessage() : "Unable to create topic");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
            @RequestBody HotTopicUpdateRequest updates,
            Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        try {
            HotTopic updated = hotTopicService.updateHotTopic(id, updates);
            return ResponseEntity.ok(HotTopicResponse.from(updated));
        } catch (RuntimeException exception) {
            String message = exception.getMessage() != null ? exception.getMessage() : "Unable to update topic";
            if (isTopicNotFound(message)) {
                return notFound(message);
            }
            return badRequest(message);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        try {
            hotTopicService.deleteHotTopic(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (RuntimeException exception) {
            String message = exception.getMessage() != null ? exception.getMessage() : "Unable to delete topic";
            if (isTopicNotFound(message)) {
                return notFound(message);
            }
            return badRequest(message);
        }
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody HotTopicCommentCreateRequest payload,
            Authentication authentication) {
        try {
            User user = resolveAuthenticatedUser(authentication);
            if (user == null) {
                return unauthorized("Invalid session. Please log in again");
            }

            TopicComment comment = hotTopicService.addComment(id, user.getId(), payload.getText());
            return ResponseEntity.ok(HotTopicCommentResponse.from(comment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Long id, Authentication authentication) {
        try {
            User user = resolveAuthenticatedUser(authentication);
            if (user == null) {
                return unauthorized("Invalid session. Please log in again");
            }

            hotTopicService.toggleLike(id, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/community")
    public ResponseEntity<?> createCommunityTopic(@RequestBody CommunityTopicRequest payload,
            Authentication authentication) {
        try {
            User user = resolveAuthenticatedUser(authentication);
            if (user == null) {
                return unauthorized("Invalid session. Please log in again");
            }

            HotTopic created = hotTopicService.createCommunityHotTopic(
                    user,
                    payload.getTitle(),
                    payload.getContent(),
                    payload.getImageUrl(),
                    payload.getCityName(),
                    payload.getLatitude(),
                    payload.getLongitude());
            return ResponseEntity.ok(new TopicSubmissionResponse("Topic submitted for review", created.getId()));
        } catch (Exception e) {
            String message = e.getMessage() != null ? e.getMessage() : "Unable to submit topic";
            if (message.toLowerCase().contains("limit")) {
                return ResponseEntity.status(429).body(Map.of("error", message));
            }
            return ResponseEntity.badRequest().body(Map.of("error", message));
        }
    }

    private User resolveAuthenticatedUser(Authentication authentication) {
        return authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
    }

    private ResponseEntity<Map<String, String>> unauthorized(String message) {
        return ResponseEntity.status(401).body(Map.of("error", message));
    }

    private ResponseEntity<Map<String, String>> forbidden(String message) {
        return ResponseEntity.status(403).body(Map.of("error", message));
    }

    private ResponseEntity<Map<String, String>> badRequest(String message) {
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    private ResponseEntity<Map<String, String>> notFound(String message) {
        return ResponseEntity.status(404).body(Map.of("error", message));
    }

    private boolean isTopicNotFound(String message) {
        return message.toLowerCase().contains("not found");
    }
}
