package com.streetbite.config;

import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import com.streetbite.model.VendorStatus;
import com.streetbite.repository.ReportRepository;
import com.streetbite.repository.UserRepository;
import com.streetbite.repository.VendorRepository;
import com.streetbite.repository.HotTopicRepository;
import com.streetbite.model.HotTopic;
import org.springframework.boot.CommandLineRunner;
import org.springframework.cache.CacheManager;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final HotTopicRepository hotTopicRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final CacheManager cacheManager;

    public DataSeeder(VendorRepository vendorRepository, UserRepository userRepository,
            ReportRepository reportRepository, HotTopicRepository hotTopicRepository, 
            PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate, CacheManager cacheManager) {
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
        this.hotTopicRepository = hotTopicRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
        this.cacheManager = cacheManager;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            // One-time legacy cleanup for Orphaned tables
            cleanupLegacyTables();

            System.out.println("Checking and seeding default users...");
            seedUsers();

            if (vendorRepository.count() == 0) {
                System.out.println("Seeding database with dummy vendors...");
                seedVendors();
                System.out.println("Database seeding completed.");
            } else {
                // Ensure reports are seeded even if vendors exist
            }
            if (reportRepository.count() == 0) {
                seedReports();
            }

            // Seed Hot Topics for Community Page
            if (hotTopicRepository.count() == 0) {
                seedHotTopics();
            }

            // Backfill slugs for existing vendors that might have null slugs
            backfillSlugs();

        } catch (Exception e) {
            System.err.println("CRITICAL ERROR during data seeding: " + e.getMessage());
            System.err.println(
                    "This is likely due to missing database tables. Please run the SQL initialization script.");
            // Do not rethrow, allow application to start even if seeding fails
        }
    }

    private void cleanupLegacyTables() {
        try {
            System.out.println("Cleaning up legacy delivery system tables (if any)...");
            jdbcTemplate.execute("DROP TABLE IF EXISTS order_items");
            jdbcTemplate.execute("DROP TABLE IF EXISTS orders");
            System.out.println("Legacy cleanup successful.");
        } catch (Exception e) {
            System.out.println("Legacy cleanup skipped or not needed: " + e.getMessage());
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
                    // Update role if changed, but DON'T overwrite password for existing users in
                    // production
                    if (existingUser.getRole() != role) {
                        existingUser.setRole(role);
                        return userRepository.save(existingUser);
                    }
                    return existingUser;
                })
                .orElseGet(() -> {
                    // Create new user
                    System.out.println("Seeding new user: " + email);
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

    private void backfillSlugs() {
        System.out.println("Updating all vendors to SEO-friendly clean slugs...");
        List<Vendor> vendors = vendorRepository.findAll();
        long count = 0;
        
        for (Vendor v : vendors) {
            String baseSlug = v.generateSlug(v.getName());
            String finalSlug = baseSlug;
            int suffix = 1;
            
            // Check for uniqueness across existing Vendors (excluding current one)
            while (isSlugTaken(finalSlug, v.getId())) {
                finalSlug = baseSlug + "-" + suffix;
                suffix++;
            }
            
            // Update if changed
            if (!finalSlug.equals(v.getSlug())) {
                v.setSlug(finalSlug);
                vendorRepository.save(v);
                count++;
            }
        }
        
        if (count > 0) {
            System.out.println("Updated " + count + " vendors to the new slug format. Evicting caches...");
            evictVendorCaches();
        }
    }

    private boolean isSlugTaken(String slug, Long currentId) {
        // Avoid relying on an explicit Optional import here so container builds
        // remain resilient even if the source context is stale.
        return vendorRepository.findBySlug(slug)
                .map(existing -> !existing.getId().equals(currentId))
                .orElse(false);
    }

    private void evictVendorCaches() {
        try {
            if (cacheManager.getCache("vendorSearch") != null) {
                cacheManager.getCache("vendorSearch").clear();
            }
            if (cacheManager.getCache("vendors") != null) {
                cacheManager.getCache("vendors").clear();
            }
            System.out.println("Vendor caches cleared successfully.");
        } catch (Exception e) {
            System.out.println("Failed to clear vendor caches: " + e.getMessage());
        }
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
                        "+91 99999 55555",
                        "11:00 AM - 11:00 PM",
                        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80",
                        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80",
                        vendor5));

        vendorRepository.saveAll(vendors);
    }

    private void seedHotTopics() {
        System.out.println("Seeding initial community hot topics...");
        
        HotTopic t1 = new HotTopic();
        t1.setTitle("Best Vada Pav in Mumbai? 🌶️");
        t1.setContent("Everyone has a favorite! Is it the one at Juhu, or the small stall near CST? Let's settle this once and for all. What's your go-to spot for the perfect spice level?");
        t1.setActive(true);
        hotTopicRepository.save(t1);

        HotTopic t2 = new HotTopic();
        t2.setTitle("Late Night Street Food Safest Spots 🌙");
        t2.setContent("Looking for recommendations for late-night cravings after midnight. Which areas are well-lit and have the best crowd even at 2 AM? Safety first, food second!");
        t2.setActive(true);
        hotTopicRepository.save(t2);

        HotTopic t3 = new HotTopic();
        t3.setTitle("Hygiene Check: Your Top 3 'Clean' Vendors 🧼");
        t3.setContent("Street food doesn't have to be 'dirty'! Who are the vendors you've seen following the best hygiene practices? Let's highlight the ones who care about our health.");
        t3.setActive(true);
        hotTopicRepository.save(t3);

        HotTopic t4 = new HotTopic();
        t4.setTitle("Hidden Gem Alert: The Momo King of North 🥟");
        t4.setContent("I found a tiny stall in the corner of Sarojini Nagar that serves the thinnest crust momos I've ever had. No name, just a blue cart. Has anyone else tried it?");
        t4.setActive(true);
        hotTopicRepository.save(t4);
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


    private Vendor createVendor(String name, String description, String cuisine, String address,
            Double lat, Double lon, String phone, String hours, String bannerUrl, String displayUrl, User owner) {
        Vendor vendor = new Vendor();
        vendor.setName(name);
        vendor.setDescription(description);
        vendor.setCuisine(cuisine);
        vendor.setAddress(address);
        vendor.setLatitude(lat);
        vendor.setLongitude(lon);
        // Rating starts at 0 - will be calculated from customer reviews
        vendor.setRating(0.0);
        vendor.setReviewCount(0);
        vendor.setAverageRating(0.0);
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
