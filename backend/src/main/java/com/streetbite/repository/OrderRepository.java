package com.streetbite.repository;

import com.streetbite.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);

    List<Order> findByVendorId(Long vendorId);

    List<Order> findByVendorIdAndStatus(Long vendorId, Order.OrderStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o WHERE o.vendor.id = :vendorId")
    Long countByVendorId(Long vendorId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.vendor.id = :vendorId")
    java.math.BigDecimal sumTotalAmountByVendorId(Long vendorId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT o.user.id) FROM Order o WHERE o.vendor.id = :vendorId")
    Long countDistinctUserIdByVendorId(Long vendorId);
}
