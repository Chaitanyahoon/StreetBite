package com.streetbite.service;

import com.streetbite.dto.announcement.AnnouncementCreateRequest;
import com.streetbite.model.Announcement;
import com.streetbite.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    public List<Announcement> getActiveAnnouncements() {
        return announcementRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    @Transactional
    public Announcement createAnnouncement(AnnouncementCreateRequest request) {
        Announcement announcement = new Announcement();
        announcement.setMessage(request.getMessage() != null ? request.getMessage().trim() : null);
        announcement.setType(request.getType() != null ? request.getType().trim().toUpperCase() : "INFO");
        announcement.setActive(request.getIsActive() == null || request.getIsActive());
        return announcementRepository.save(announcement);
    }

    @Transactional
    public Optional<Announcement> updateStatus(Long id, boolean isActive) {
        return announcementRepository.findById(id)
                .map(announcement -> {
                    announcement.setActive(isActive);
                    return announcementRepository.save(announcement);
                });
    }

    @Transactional
    public boolean deleteAnnouncement(Long id) {
        if (!announcementRepository.existsById(id)) {
            return false;
        }
        announcementRepository.deleteById(id);
        return true;
    }
}
