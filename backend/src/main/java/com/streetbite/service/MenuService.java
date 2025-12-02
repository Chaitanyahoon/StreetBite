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

    @Transactional
    public MenuItem saveMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    @Transactional
    public MenuItem saveMenuItem(MenuItem menuItem, Long vendorId) {
        // Fetch the vendor entity
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + vendorId));

        // Set the vendor on the menu item
        menuItem.setVendor(vendor);

        // Save and return
        return menuItemRepository.save(menuItem);
    }

    public List<MenuItem> getMenuByVendor(Long vendorId) {
        return menuItemRepository.findByVendorId(vendorId);
    }

    public List<MenuItem> getAvailableMenuByVendor(Long vendorId) {
        return menuItemRepository.findByVendorIdAndIsAvailableTrue(vendorId);
    }

    public Optional<MenuItem> getMenuItemById(Long id) {
        return menuItemRepository.findById(id);
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }
}
