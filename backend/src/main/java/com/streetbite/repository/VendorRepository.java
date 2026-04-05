package com.streetbite.repository;

import com.streetbite.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    List<Vendor> findByOwnerId(Long ownerId);

    List<Vendor> findByIsActiveTrue();

    List<Vendor> findByCuisineContainingIgnoreCase(String cuisine);

    long countByCreatedAtAfter(java.time.LocalDateTime date);

    java.util.Optional<Vendor> findBySlug(String slug);
}
