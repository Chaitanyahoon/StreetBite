package com.streetbite.service;

import com.streetbite.model.Order;
import com.streetbite.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserDeviceService userDeviceService;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public Order createOrder(Order order) {
        Order savedOrder = orderRepository.save(order);

        // Notify vendor
        try {
            Long vendorOwnerId = savedOrder.getVendor().getOwner().getId();
            List<String> vendorTokens = userDeviceService.getUserTokens(vendorOwnerId);

            for (String token : vendorTokens) {
                notificationService.notifyVendorNewOrder(
                        token,
                        savedOrder.getId(),
                        savedOrder.getUser().getDisplayName());
            }
        } catch (Exception e) {
            System.err.println("Failed to send new order notification: " + e.getMessage());
        }

        return savedOrder;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);

        // Notify customer
        try {
            Long customerId = savedOrder.getUser().getId();
            List<String> customerTokens = userDeviceService.getUserTokens(customerId);

            for (String token : customerTokens) {
                notificationService.notifyCustomerOrderUpdate(
                        token,
                        savedOrder.getId(),
                        status.toString());
            }
        } catch (Exception e) {
            System.err.println("Failed to send order update notification: " + e.getMessage());
        }

        return savedOrder;
    }

    @Transactional
    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getOrdersByVendor(Long vendorId) {
        return orderRepository.findByVendorId(vendorId);
    }
}
