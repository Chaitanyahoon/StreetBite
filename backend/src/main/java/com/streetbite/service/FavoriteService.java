package com.streetbite.service;

import com.streetbite.dto.favorite.FavoriteStatusResponse;
import com.streetbite.dto.vendor.VendorResponse;
import com.streetbite.model.Favorite;
import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import com.streetbite.repository.FavoriteRepository;
import com.streetbite.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final VendorRepository vendorRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, VendorRepository vendorRepository) {
        this.favoriteRepository = favoriteRepository;
        this.vendorRepository = vendorRepository;
    }

    public List<VendorResponse> getFavoriteVendors(User user) {
        return favoriteRepository.findFavoriteVendorsByUserId(user.getId()).stream()
                .map(VendorResponse::from)
                .toList();
    }

    public FavoriteStatusResponse getFavoriteStatus(User user, Long vendorId) {
        boolean isFavorite = favoriteRepository.existsByUserIdAndVendorId(user.getId(), vendorId);
        return new FavoriteStatusResponse(isFavorite, null);
    }

    @Transactional
    public FavoriteStatusResponse addFavorite(User user, Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));

        if (favoriteRepository.existsByUserIdAndVendorId(user.getId(), vendorId)) {
            return new FavoriteStatusResponse(true, "Already favorited");
        }

        favoriteRepository.save(new Favorite(user, vendor));
        return new FavoriteStatusResponse(true, "Added to favorites");
    }

    @Transactional
    public FavoriteStatusResponse removeFavorite(User user, Long vendorId) {
        favoriteRepository.deleteByUserIdAndVendorId(user.getId(), vendorId);
        return new FavoriteStatusResponse(false, "Removed from favorites");
    }
}
