package com.streetbite.controller;

import com.streetbite.model.Discussion;
import com.streetbite.model.DiscussionComment;
import com.streetbite.model.User;
import com.streetbite.repository.DiscussionRepository;
import com.streetbite.repository.DiscussionCommentRepository;
import com.streetbite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DiscussionController {

    @Autowired
    private DiscussionRepository discussionRepository;

    @Autowired
    private DiscussionCommentRepository commentRepository;

    @Autowired
    private com.streetbite.repository.DiscussionLikeRepository likeRepository;

    @Autowired
    private UserRepository userRepository;

    // ========== PUBLIC ENDPOINTS ==========

    @GetMapping("/discussions")
    public ResponseEntity<List<Map<String, Object>>> getActiveDiscussions() {
        List<Discussion> discussions = discussionRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Discussion d : discussions) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", d.getId());
            item.put("text", d.getTitle());
            item.put("author", d.getAuthorName() != null ? d.getAuthorName() : "admin");
            item.put("tags", d.getTags());
            item.put("likes", d.getLikesCount());
            item.put("replies", d.getRepliesCount());
            item.put("time", formatTimeAgo(d.getCreatedAt()));
            item.put("createdAt", d.getCreatedAt());
            response.add(item);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/discussions/{id}/comments")
    public ResponseEntity<List<Map<String, Object>>> getComments(@PathVariable Long id) {
        List<DiscussionComment> comments = commentRepository.findByDiscussionIdOrderByCreatedAtDesc(id);
        List<Map<String, Object>> response = new ArrayList<>();

        for (DiscussionComment c : comments) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", c.getId());
            item.put("author", c.getAuthorName() != null ? c.getAuthorName() : "anonymous");
            item.put("text", c.getText());
            item.put("likes", c.getLikesCount());
            item.put("time", formatTimeAgo(c.getCreatedAt()));
            response.add(item);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/discussions/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Discussion> discussionOpt = discussionRepository.findById(id);
        if (discussionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Discussion discussion = discussionOpt.get();
        String text = body.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Comment text is required"));
        }

        User user = getCurrentUser();

        DiscussionComment comment = new DiscussionComment();
        comment.setDiscussion(discussion);
        comment.setText(text.trim());
        comment.setUser(user);
        comment.setAuthorName(user != null ? user.getDisplayName() : "anonymous");

        commentRepository.save(comment);

        // Update reply count
        discussion.setRepliesCount(discussion.getRepliesCount() + 1);
        discussionRepository.save(discussion);

        Map<String, Object> response = new HashMap<>();
        response.put("id", comment.getId());
        response.put("author", comment.getAuthorName());
        response.put("text", comment.getText());
        response.put("likes", comment.getLikesCount());
        response.put("time", "Just now");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/discussions/{id}/like")
    public ResponseEntity<?> likeDiscussion(@PathVariable Long id) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Must be logged in to like"));
        }

        Optional<Discussion> discussionOpt = discussionRepository.findById(id);
        if (discussionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Discussion discussion = discussionOpt.get();
        Optional<com.streetbite.model.DiscussionLike> existingLike = likeRepository.findByDiscussionIdAndUserId(id,
                user.getId());

        boolean liked;
        if (existingLike.isPresent()) {
            // Unlike
            likeRepository.delete(existingLike.get());
            discussion.setLikesCount(Math.max(0, discussion.getLikesCount() - 1));
            liked = false;
        } else {
            // Like
            com.streetbite.model.DiscussionLike like = new com.streetbite.model.DiscussionLike();
            like.setDiscussion(discussion);
            like.setUser(user);
            likeRepository.save(like);
            discussion.setLikesCount(discussion.getLikesCount() + 1);
            liked = true;
        }

        discussionRepository.save(discussion);

        return ResponseEntity.ok(Map.of("likes", discussion.getLikesCount(), "liked", liked));
    }

    // ========== ADMIN ENDPOINTS ==========

    @GetMapping("/admin/discussions")
    public ResponseEntity<List<Discussion>> getAllDiscussions() {
        return ResponseEntity.ok(discussionRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/admin/discussions")
    public ResponseEntity<?> createDiscussion(@RequestBody Map<String, Object> body) {
        String title = (String) body.get("title");
        if (title == null || title.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
        }

        Discussion discussion = new Discussion();
        discussion.setTitle(title.trim());
        discussion.setAuthorName("StreetBite Admin");
        discussion.setIsActive(true);

        @SuppressWarnings("unchecked")
        List<String> tags = (List<String>) body.get("tags");
        if (tags != null) {
            discussion.setTags(tags);
        }

        User admin = getCurrentUser();
        if (admin != null) {
            discussion.setAuthor(admin);
            discussion.setAuthorName(admin.getDisplayName() != null ? admin.getDisplayName() : "Admin");
        }

        discussionRepository.save(discussion);

        return ResponseEntity.ok(discussion);
    }

    @PutMapping("/admin/discussions/{id}")
    public ResponseEntity<?> updateDiscussion(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Optional<Discussion> discussionOpt = discussionRepository.findById(id);
        if (discussionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Discussion discussion = discussionOpt.get();

        String title = (String) body.get("title");
        if (title != null && !title.trim().isEmpty()) {
            discussion.setTitle(title.trim());
        }

        @SuppressWarnings("unchecked")
        List<String> tags = (List<String>) body.get("tags");
        if (tags != null) {
            discussion.setTags(tags);
        }

        Boolean isActive = (Boolean) body.get("isActive");
        if (isActive != null) {
            discussion.setIsActive(isActive);
        }

        discussionRepository.save(discussion);

        return ResponseEntity.ok(discussion);
    }

    @PutMapping("/admin/discussions/{id}/toggle")
    public ResponseEntity<?> toggleDiscussion(@PathVariable Long id) {
        Optional<Discussion> discussionOpt = discussionRepository.findById(id);
        if (discussionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Discussion discussion = discussionOpt.get();
        discussion.setIsActive(!discussion.getIsActive());
        discussionRepository.save(discussion);

        return ResponseEntity.ok(Map.of("isActive", discussion.getIsActive()));
    }

    @DeleteMapping("/admin/discussions/{id}")
    public ResponseEntity<?> deleteDiscussion(@PathVariable Long id) {
        if (!discussionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        discussionRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Discussion deleted"));
    }

    // ========== HELPER METHODS ==========

    private User getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String email = auth.getName();
                return userRepository.findByEmail(email).orElse(null);
            }
        } catch (Exception e) {
            // Ignore
        }
        return null;
    }

    private String formatTimeAgo(java.time.LocalDateTime dateTime) {
        if (dateTime == null)
            return "unknown";

        java.time.Duration duration = java.time.Duration.between(dateTime, java.time.LocalDateTime.now());
        long minutes = duration.toMinutes();
        long hours = duration.toHours();
        long days = duration.toDays();

        if (minutes < 1)
            return "Just now";
        if (minutes < 60)
            return minutes + "m ago";
        if (hours < 24)
            return hours + "h ago";
        if (days < 7)
            return days + "d ago";
        return dateTime.toLocalDate().toString();
    }
}
