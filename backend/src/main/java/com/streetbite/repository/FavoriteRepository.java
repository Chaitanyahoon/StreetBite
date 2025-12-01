package com.streetbite.repository;

import com.streetbite.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    // Find all favorites for a user
    List<Favorite> findByUserId(Long userId);

    // Check if a vendor is favorited by a user
    Optional<Favorite> findByUserIdAndVendorId(Long userId, Long vendorId);

    // Check if exists
    boolean existsByUserIdAndVendorId(Long userId, Long vendorId);

    // Delete a favorite
    void deleteByUserIdAndVendorId(Long userId, Long vendorId);

    // Get favorite vendors for a user (with vendor details)
    @Query("SELECT f.vendor FROM Favorite f WHERE f.user.id = :userId ORDER BY f.createdAt DESC")
    List<com.streetbite.model.Vendor> findFavoriteVendorsByUserId(@Param("userId") Long userId);
}
