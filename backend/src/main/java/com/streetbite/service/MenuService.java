package com.streetbite.service;

import com.streetbite.model.MenuItem;
import com.streetbite.model.Vendor;
import com.streetbite.repository.MenuItemRepository;
import com.streetbite.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MenuService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private RealTimeSyncService realTimeSyncService;

    @Transactional
    public MenuItem saveMenuItem(MenuItem menuItem) {
        MenuItem saved = menuItemRepository.saveAndFlush(menuItem);
        syncRealtimeAvailability(saved);
        return saved;
    }

    @Transactional
    public MenuItem saveMenuItem(MenuItem menuItem, Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + vendorId));

        menuItem.setVendor(vendor);

        MenuItem saved = menuItemRepository.saveAndFlush(menuItem);
        syncRealtimeAvailability(saved);
        return saved;
    }

    public List<MenuItem> getMenuByVendor(Long vendorId) {
        return menuItemRepository.findByVendorId(vendorId);
    }

    public List<MenuItem> getAvailableMenuByVendor(Long vendorId) {
        return menuItemRepository.findByVendorIdAndAvailableTrue(vendorId);
    }

    public Optional<MenuItem> getMenuItemById(Long id) {
        return menuItemRepository.findById(id);
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
        realTimeSyncService.deleteMenuAvailability(id);
    }

    private void syncRealtimeAvailability(MenuItem menuItem) {
        if (menuItem.getId() == null) {
            return;
        }
        realTimeSyncService.updateMenuAvailability(menuItem.getId(), menuItem.isAvailable());
    }
}
