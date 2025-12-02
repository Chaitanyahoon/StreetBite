package com.streetbite.service;

import com.streetbite.model.UserDevice;
import com.streetbite.repository.UserDeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserDeviceService {

    @Autowired
    private UserDeviceRepository userDeviceRepository;

    /**
     * Save or update FCM token for a user
     */
    @Transactional
    public UserDevice saveToken(Long userId, String fcmToken, String deviceType) {
        // Check if token already exists
        Optional<UserDevice> existing = userDeviceRepository.findByFcmToken(fcmToken);

        if (existing.isPresent()) {
            // Update existing token
            UserDevice device = existing.get();
            device.setUserId(userId);
            device.setDeviceType(deviceType);
            return userDeviceRepository.save(device);
        } else {
            // Create new token entry
            UserDevice newDevice = new UserDevice(userId, fcmToken, deviceType);
            return userDeviceRepository.save(newDevice);
        }
    }

    /**
     * Get all tokens for a user
     */
    public List<String> getUserTokens(Long userId) {
        return userDeviceRepository.findByUserId(userId)
                .stream()
                .map(UserDevice::getFcmToken)
                .collect(Collectors.toList());
    }

    /**
     * Get all devices for a user
     */
    public List<UserDevice> getUserDevices(Long userId) {
        return userDeviceRepository.findByUserId(userId);
    }

    /**
     * Delete a specific token
     */
    @Transactional
    public void deleteToken(String fcmToken) {
        userDeviceRepository.deleteByFcmToken(fcmToken);
    }

    /**
     * Delete all tokens for a user
     */
    @Transactional
    public void deleteUserTokens(Long userId) {
        userDeviceRepository.deleteByUserId(userId);
    }
}
