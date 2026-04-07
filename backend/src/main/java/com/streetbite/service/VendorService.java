package com.streetbite.service;

import com.streetbite.dto.vendor.VendorCreateRequest;
import com.streetbite.dto.vendor.VendorUpdateRequest;
import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import com.streetbite.model.VendorStatus;
import com.streetbite.repository.UserRepository;
import com.streetbite.repository.VendorRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class VendorService {

    private final com.streetbite.repository.ReviewRepository reviewRepository;
    private final com.streetbite.repository.FavoriteRepository favoriteRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public VendorService(
            com.streetbite.repository.ReviewRepository reviewRepository,
            com.streetbite.repository.FavoriteRepository favoriteRepository,
            VendorRepository vendorRepository,
            UserRepository userRepository,
            ApplicationEventPublisher eventPublisher) {
        this.reviewRepository = reviewRepository;
        this.favoriteRepository = favoriteRepository;
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Vendor saveVendor(Vendor vendor) {
        Vendor savedVendor = vendorRepository.save(vendor);
        if (savedVendor.getId() != null) {
            eventPublisher.publishEvent(new RealtimeSyncEvents.VendorUpdatedEvent(
                    savedVendor.getId(),
                    savedVendor.getStatus(),
                    savedVendor.getLatitude(),
                    savedVendor.getLongitude(),
                    savedVendor.getAddress()
            ));
        }
        return savedVendor;
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public List<Vendor> getActiveVendors() {
        return vendorRepository.findByIsActiveTrueAndStatusNotIn(
                java.util.List.of(
                        com.streetbite.model.VendorStatus.BANNED,
                        com.streetbite.model.VendorStatus.SUSPENDED,
                        com.streetbite.model.VendorStatus.REJECTED
                )
        );
    }

    public Optional<Vendor> getVendorById(Long id) {
        return vendorRepository.findById(id);
    }

    public List<Vendor> getVendorsByOwner(Long ownerId) {
        return vendorRepository.findByOwnerId(ownerId);
    }

    public Optional<Vendor> getVendorBySlug(String slug) {
        return vendorRepository.findBySlug(slug);
    }

    @Transactional
    public Vendor createVendor(VendorCreateRequest request) {
        Vendor vendor = new Vendor();
        if (request.getOwnerId() != null) {
            User owner = userRepository.findById(request.getOwnerId())
                    .orElseThrow(() -> new IllegalArgumentException("Owner not found"));
            vendor.setOwner(owner);
        }

        applyVendorCreateRequest(vendor, request);
        return saveVendor(vendor);
    }

    @Transactional
    public Vendor updateVendor(Vendor vendor, VendorUpdateRequest updates) {
        applyVendorUpdateRequest(vendor, updates);
        return saveVendor(vendor);
    }

    private void applyVendorCreateRequest(Vendor vendor, VendorCreateRequest request) {
        vendor.setName(request.getName());
        vendor.setDescription(request.getDescription());
        vendor.setCuisine(request.getCuisine());
        vendor.setAddress(request.getAddress());
        vendor.setLatitude(request.getLatitude());
        vendor.setLongitude(request.getLongitude());
        vendor.setPhone(request.getPhone());
        vendor.setHours(request.getHours());
        vendor.setBannerImageUrl(request.getBannerImageUrl());
        vendor.setDisplayImageUrl(request.getDisplayImageUrl());
        vendor.setSlug(null);
    }

    private void applyVendorUpdateRequest(Vendor vendor, VendorUpdateRequest updates) {
        if (updates.getName() != null) {
            vendor.setName(updates.getName());
            vendor.setSlug(null);
        }
        if (updates.getDescription() != null) {
            vendor.setDescription(updates.getDescription());
        }
        if (updates.getCuisine() != null) {
            vendor.setCuisine(updates.getCuisine());
        }
        if (updates.getAddress() != null) {
            vendor.setAddress(updates.getAddress());
        }
        if (updates.getLatitude() != null) {
            vendor.setLatitude(updates.getLatitude());
        }
        if (updates.getLongitude() != null) {
            vendor.setLongitude(updates.getLongitude());
        }
        if (updates.getPhone() != null) {
            vendor.setPhone(updates.getPhone());
        }
        if (updates.getHours() != null) {
            vendor.setHours(updates.getHours());
        }
        if (updates.getBannerImageUrl() != null) {
            vendor.setBannerImageUrl(updates.getBannerImageUrl());
        }
        if (updates.getDisplayImageUrl() != null) {
            vendor.setDisplayImageUrl(updates.getDisplayImageUrl());
        }
        if (updates.getStatus() != null) {
            applyStatusChange(vendor, VendorStatus.valueOf(updates.getStatus()));
        }
    }

    @Transactional
    public Vendor applyStatusChange(Vendor vendor, VendorStatus status) {
        vendor.setStatus(status);

        boolean isBlockedStatus = status == VendorStatus.BANNED
                || status == VendorStatus.SUSPENDED
                || status == VendorStatus.REJECTED;
        vendor.setActive(!isBlockedStatus);

        if (vendor.getOwner() != null && status == VendorStatus.BANNED) {
            vendor.getOwner().setActive(false);
            userRepository.save(vendor.getOwner());
        }

        if (vendor.getId() != null) {
            eventPublisher.publishEvent(new RealtimeSyncEvents.VendorUpdatedEvent(
                    vendor.getId(),
                    vendor.getStatus(),
                    vendor.getLatitude(),
                    vendor.getLongitude(),
                    vendor.getAddress()
            ));
        }

        return vendor;
    }

    @Transactional
    public void deleteVendor(Long id) {
        // Get vendor first to access owner
        Optional<Vendor> vendorOpt = vendorRepository.findById(id);
        Long ownerId = null;
        if (vendorOpt.isPresent()) {
            Vendor vendor = vendorOpt.get();
            if (vendor.getOwner() != null) {
                ownerId = vendor.getOwner().getId();
            }
        }

        // Manually cascade delete related entities
        reviewRepository.deleteByVendorId(id);
        favoriteRepository.deleteByVendorId(id);

        // Delete the vendor
        vendorRepository.deleteById(id);
        eventPublisher.publishEvent(new RealtimeSyncEvents.VendorDeletedEvent(id));

        // Also delete the owner User so they can re-register
        if (ownerId != null) {
            userRepository.deleteById(ownerId);
        }
    }
}
