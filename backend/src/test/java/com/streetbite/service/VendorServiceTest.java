package com.streetbite.service;

import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import com.streetbite.model.VendorStatus;
import com.streetbite.repository.FavoriteRepository;
import com.streetbite.repository.ReviewRepository;
import com.streetbite.repository.UserRepository;
import com.streetbite.repository.VendorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VendorServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VendorService vendorService;

    @Test
    void banningVendorDeactivatesOwnerAccount() {
        User owner = new User();
        owner.setActive(true);

        Vendor vendor = new Vendor();
        vendor.setOwner(owner);
        vendor.setActive(true);

        when(vendorRepository.save(vendor)).thenReturn(vendor);

        Vendor updated = vendorService.applyStatusChange(vendor, VendorStatus.BANNED);

        assertThat(updated.getStatus()).isEqualTo(VendorStatus.BANNED);
        assertThat(updated.isActive()).isFalse();
        assertThat(owner.getActive()).isFalse();
        verify(userRepository).save(owner);
        verify(vendorRepository).save(vendor);
    }

    @Test
    void suspendingVendorLeavesOwnerActive() {
        User owner = new User();
        owner.setActive(true);

        Vendor vendor = new Vendor();
        vendor.setOwner(owner);
        vendor.setActive(true);

        when(vendorRepository.save(vendor)).thenReturn(vendor);

        Vendor updated = vendorService.applyStatusChange(vendor, VendorStatus.SUSPENDED);

        assertThat(updated.getStatus()).isEqualTo(VendorStatus.SUSPENDED);
        assertThat(updated.isActive()).isFalse();
        assertThat(owner.getActive()).isTrue();
        verify(userRepository, never()).save(owner);
        verify(vendorRepository).save(vendor);
    }
}
