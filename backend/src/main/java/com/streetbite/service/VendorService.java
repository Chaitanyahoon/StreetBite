package com.streetbite.service;

import com.streetbite.model.Vendor;
import com.streetbite.repository.VendorRepository;
import com.streetbite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class VendorService {

    @Autowired
    private com.streetbite.repository.ReviewRepository reviewRepository;

    @Autowired
    private com.streetbite.repository.FavoriteRepository favoriteRepository;

    @Autowired
    private com.streetbite.repository.OrderRepository orderRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Vendor saveVendor(Vendor vendor) {
        return vendorRepository.save(vendor);
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public List<Vendor> getActiveVendors() {
        return vendorRepository.findByIsActiveTrue();
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
        orderRepository.deleteByVendorId(id);

        // Delete the vendor
        vendorRepository.deleteById(id);

        // Also delete the owner User so they can re-register
        if (ownerId != null) {
            userRepository.deleteById(ownerId);
        }
    }
}
