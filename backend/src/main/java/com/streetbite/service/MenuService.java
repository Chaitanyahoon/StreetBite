package com.streetbite.service;

import com.streetbite.dto.menu.MenuItemCreateRequest;
import com.streetbite.dto.menu.MenuItemUpdateRequest;
import com.streetbite.model.MenuItem;
import com.streetbite.model.Vendor;
import com.streetbite.repository.MenuItemRepository;
import com.streetbite.repository.VendorRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final VendorRepository vendorRepository;
    private final ApplicationEventPublisher eventPublisher;

    public MenuService(
            MenuItemRepository menuItemRepository,
            VendorRepository vendorRepository,
            ApplicationEventPublisher eventPublisher) {
        this.menuItemRepository = menuItemRepository;
        this.vendorRepository = vendorRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public MenuItem saveMenuItem(MenuItem menuItem) {
        MenuItem saved = menuItemRepository.saveAndFlush(menuItem);
        if (saved.getId() != null) {
            eventPublisher.publishEvent(new RealtimeSyncEvents.MenuItemSavedEvent(saved.getId(), saved.isAvailable()));
        }
        return saved;
    }

    @Transactional
    public MenuItem saveMenuItem(MenuItem menuItem, Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + vendorId));

        menuItem.setVendor(vendor);

        MenuItem saved = menuItemRepository.saveAndFlush(menuItem);
        if (saved.getId() != null) {
            eventPublisher.publishEvent(new RealtimeSyncEvents.MenuItemSavedEvent(saved.getId(), saved.isAvailable()));
        }
        return saved;
    }

    @Transactional
    public MenuItem createMenuItem(MenuItemCreateRequest request) {
        MenuItem menuItem = new MenuItem();
        applyMenuItemCreateRequest(menuItem, request);
        return saveMenuItem(menuItem, request.getVendorId());
    }

    @Transactional
    public MenuItem updateMenuItem(MenuItem menuItem, MenuItemUpdateRequest updates) {
        applyMenuItemUpdateRequest(menuItem, updates);
        return saveMenuItem(menuItem);
    }

    private void applyMenuItemCreateRequest(MenuItem menuItem, MenuItemCreateRequest request) {
        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setCategory(request.getCategory());
        menuItem.setImageUrl(request.getImageUrl());
        menuItem.setAvailable(request.isAvailable());
        menuItem.setPreparationTime(request.getPreparationTime());
    }

    private void applyMenuItemUpdateRequest(MenuItem menuItem, MenuItemUpdateRequest updates) {
        if (updates.getName() != null) {
            menuItem.setName(updates.getName());
        }
        if (updates.getDescription() != null) {
            menuItem.setDescription(updates.getDescription());
        }
        if (updates.getPrice() != null) {
            menuItem.setPrice(updates.getPrice());
        }
        if (updates.getCategory() != null) {
            menuItem.setCategory(updates.getCategory());
        }
        if (updates.getImageUrl() != null) {
            menuItem.setImageUrl(updates.getImageUrl());
        }
        if (updates.getIsAvailable() != null) {
            menuItem.setAvailable(updates.getIsAvailable());
        }
        if (updates.getPreparationTime() != null) {
            menuItem.setPreparationTime(updates.getPreparationTime());
        }
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
        eventPublisher.publishEvent(new RealtimeSyncEvents.MenuItemDeletedEvent(id));
    }
}
