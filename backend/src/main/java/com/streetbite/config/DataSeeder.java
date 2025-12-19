package com.streetbite.config;

import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import com.streetbite.model.VendorStatus;
import com.streetbite.repository.ReportRepository;
import com.streetbite.repository.UserRepository;
import com.streetbite.repository.VendorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final com.streetbite.repository.OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(VendorRepository vendorRepository, UserRepository userRepository,
            ReportRepository reportRepository, com.streetbite.repository.OrderRepository orderRepository,
            PasswordEncoder passwordEncoder) {
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("Checking and seeding default users...");
            seedUsers();

            if (vendorRepository.count() == 0) {
                System.out.println("Seeding database with dummy vendors...");
                seedVendors();
                System.out.println("Database seeding completed.");
            } else {
                // Ensure reports are seeded even if vendors exist
                if (reportRepository.count() == 0) {
                    seedReports();
                }
            }

            // Seed Orders for Analytics if none exist
            if (orderRepository.count() == 0) {
                System.out.println("Seeding past orders for analytics...");
                seedOrders();
            }
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR during data seeding: " + e.getMessage());
            System.err.println(
                    "This is likely due to missing database tables. Please run the SQL initialization script.");
            // Do not rethrow, allow application to start even if seeding fails
        }
    }

    private void seedUsers() {
        // Create or Update Admin User
        createOrUpdateUser("admin@streetbite.com", "admin123", "Admin User", User.Role.ADMIN);

        // Create Team Admin User
        createOrUpdateUser("teamstreetbite@gmail.com", "Admin@123", "Team StreetBite", User.Role.ADMIN);

        // Create or Update Regular User
        createOrUpdateUser("user@streetbite.com", "user123", "John Doe", User.Role.USER);
    }

    private User createOrUpdateUser(String email, String password, String displayName, User.Role role) {
        return userRepository.findByEmail(email)
                .map(existingUser -> {
                    // Update existing user password just in case
                    existingUser.setPasswordHash(passwordEncoder.encode(password));
                    existingUser.setRole(role); // Ensure role is correct
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    // Create new user
                    User user = new User();
                    user.setEmail(email);
                    user.setFirebaseUid(java.util.UUID.randomUUID().toString());
                    user.setPasswordHash(passwordEncoder.encode(password));
                    user.setDisplayName(displayName);
                    user.setRole(role);
                    user.setCreatedAt(java.time.LocalDateTime.now());
                    user.setUpdatedAt(java.time.LocalDateTime.now());
                    return userRepository.save(user);
                });
    }

    private void seedVendors() {
        // Create Vendor Users first
        User vendor1 = createOrUpdateUser("vendor1@streetbite.com", "vendor123", "Raghu Owner", User.Role.VENDOR);
        User vendor2 = createOrUpdateUser("vendor2@streetbite.com", "vendor123", "Mumbai Masala Owner",
                User.Role.VENDOR);
        User vendor3 = createOrUpdateUser("vendor3@streetbite.com", "vendor123", "Spice Route Owner", User.Role.VENDOR);
        User vendor4 = createOrUpdateUser("vendor4@streetbite.com", "vendor123", "Dosa Plaza Owner", User.Role.VENDOR);
        User vendor5 = createOrUpdateUser("vendor5@streetbite.com", "vendor123", "Kolkata Rolls Owner",
                User.Role.VENDOR);

        List<Vendor> vendors = Arrays.asList(
                createVendor(
                        "Raghu's Vada Pav",
                        "Famous for spicy and tangy street food delicacies like Pani Puri, Aloo Tikki, and Dahi Bhalla.",
                        "North Indian, Street Food",
                        "Connaught Place, New Delhi",
                        28.6315, 77.2167,
                        4.8, 1250, 4.8,
                        "+91 98765 43210",
                        "10:00 AM - 10:00 PM",
                        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
                        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80",
                        vendor1),
                createVendor(
                        "Mumbai Masala",
                        "Authentic Mumbai street food experience. Try our Vada Pav and Pav Bhaji.",
                        "Maharashtrian, Fast Food",
                        "Juhu Beach, Mumbai",
                        19.0988, 72.8264,
                        4.7, 980, 4.7,
                        "+91 91234 56789",
                        "11:00 AM - 11:00 PM",
                        "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80",
                        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
                        vendor2),
                createVendor(
                        "Spice Route",
                        "A culinary journey through the spices of Hyderabad. Best Biryani in town.",
                        "Hyderabadi, Biryani",
                        "Charminar, Hyderabad",
                        17.3616, 78.4747,
                        4.9, 2100, 4.9,
                        "+91 88888 77777",
                        "12:00 PM - 12:00 AM",
                        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
                        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80",
                        vendor3),
                createVendor(
                        "Dosa Plaza",
                        "Serving over 50 varieties of Dosas. A South Indian breakfast paradise.",
                        "South Indian, Vegetarian",
                        "Indiranagar, Bangalore",
                        12.9716, 77.5946,
                        4.6, 850, 4.6,
                        "+91 77777 66666",
                        "7:00 AM - 10:00 PM",
                        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
                        "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&q=80",
                        vendor4),
                createVendor(
                        "Kolkata Kathi Rolls",
                        "The original taste of Kolkata rolls. Chicken, Mutton, and Paneer rolls available.",
                        "Bengali, Rolls",
                        "Park Street, Kolkata",
                        22.5726, 88.3639,
                        4.5, 600, 4.5,
                        "+91 99999 55555",
                        "11:00 AM - 11:00 PM",
                        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80",
                        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80",
                        vendor5));

        vendorRepository.saveAll(vendors);
    }

    private void seedReports() {
        com.streetbite.model.Report r1 = new com.streetbite.model.Report();
        r1.setReporterId(1L); // Admin
        r1.setReportedId(3L); // Vendor 1
        r1.setType("VENDOR");
        r1.setReason("Inappropriate images in gallery");
        r1.setStatus("PENDING");
        reportRepository.save(r1);

        com.streetbite.model.Report r2 = new com.streetbite.model.Report();
        r2.setReporterId(2L); // User
        r2.setReportedId(4L); // Vendor 2
        r2.setType("ORDER");
        r2.setReason("Order never delivered");
        r2.setStatus("RESOLVED");
        reportRepository.save(r2);

        com.streetbite.model.Report r3 = new com.streetbite.model.Report();
        r3.setReporterId(2L); // User
        r3.setReportedId(5L); // Vendor 3
        r3.setType("REVIEW");
        r3.setReason("Fake review detected");
        r3.setStatus("PENDING");
        reportRepository.save(r3);
    }

    private void seedOrders() {
        java.util.List<User> users = userRepository.findAll();
        java.util.List<Vendor> vendors = vendorRepository.findAll();
        java.util.Random random = new java.util.Random();

        if (users.isEmpty() || vendors.isEmpty())
            return;

        // Generate orders for the last 10 days
        for (int i = 0; i < 50; i++) {
            User user = users.get(random.nextInt(users.size()));
            Vendor vendor = vendors.get(random.nextInt(vendors.size()));

            com.streetbite.model.Order order = new com.streetbite.model.Order();
            order.setUser(user);
            order.setVendor(vendor);

            // Random amount between 100 and 1000
            double amount = 100 + (900 * random.nextDouble());
            order.setTotalAmount(java.math.BigDecimal.valueOf(amount));

            order.setStatus(com.streetbite.model.Order.OrderStatus.COMPLETED);

            // Random date in last 10 days
            int daysAgo = random.nextInt(10);
            order.setCreatedAt(java.time.LocalDateTime.now().minusDays(daysAgo));

            orderRepository.save(order);
        }
    }

    private Vendor createVendor(String name, String description, String cuisine, String address,
            Double lat, Double lon, Double rating, Integer reviewCount,
            Double avgRating, String phone, String hours, String bannerUrl, String displayUrl, User owner) {
        Vendor vendor = new Vendor();
        vendor.setName(name);
        vendor.setDescription(description);
        vendor.setCuisine(cuisine);
        vendor.setAddress(address);
        vendor.setLatitude(lat);
        vendor.setLongitude(lon);
        vendor.setRating(rating);
        vendor.setReviewCount(reviewCount);
        vendor.setAverageRating(avgRating);
        vendor.setPhone(phone);
        vendor.setHours(hours);
        vendor.setBannerImageUrl(bannerUrl);
        vendor.setDisplayImageUrl(displayUrl);
        vendor.setOwner(owner);
        vendor.setActive(true);
        vendor.setStatus(VendorStatus.AVAILABLE);
        return vendor;
    }
}
