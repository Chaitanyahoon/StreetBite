package com.streetbite.controller;

import com.streetbite.model.Announcement;
import com.streetbite.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @GetMapping("/active")
    public ResponseEntity<List<Announcement>> getActiveAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findByIsActiveTrueOrderByCreatedAtDesc());
    }

    @GetMapping("/hot")
    public ResponseEntity<List<Announcement>> getHotAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findByIsActiveTrueOrderByCreatedAtDesc()
            .stream()
            .limit(3)
            .toList());
    }

    @GetMapping
    public ResponseEntity<List<Announcement>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Announcement> createAnnouncement(@RequestBody Announcement announcement) {
        return ResponseEntity.ok(announcementRepository.save(announcement));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        Boolean isActive = payload.get("isActive");
        if (isActive == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "isActive is required"));
        }

        return announcementRepository.findById(id)
                .map(announcement -> {
                    announcement.setActive(isActive);
                    announcementRepository.save(announcement);
                    return ResponseEntity.ok(announcement);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id) {
        if (!announcementRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        announcementRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
