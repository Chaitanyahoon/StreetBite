package com.streetbite.config;

import com.streetbite.model.Vendor;
import com.streetbite.model.VendorStatus;
import com.streetbite.repository.VendorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final VendorRepository vendorRepository;

    public DataSeeder(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (vendorRepository.count() == 0) {
            System.out.println("Seeding database with dummy vendors...");
            seedVendors();
            System.out.println("Database seeding completed.");
        }
    }

    private void seedVendors() {
        List<Vendor> vendors = Arrays.asList(
                createVendor(
                        "Sharma Ji's Chaat",
                        "Famous for spicy and tangy street food delicacies like Pani Puri, Aloo Tikki, and Dahi Bhalla.",
                        "North Indian, Street Food",
                        "Connaught Place, New Delhi",
                        28.6315, 77.2167,
                        4.8, 1250, 4.8,
                        "+91 98765 43210",
                        "10:00 AM - 10:00 PM",
                        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
                        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80"),
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
                        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80"),
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
                        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80"),
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
                        "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&q=80"),
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
                        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80"));

        vendorRepository.saveAll(vendors);
    }

    private Vendor createVendor(String name, String description, String cuisine, String address,
            Double lat, Double lon, Double rating, Integer reviewCount,
            Double avgRating, String phone, String hours, String bannerUrl, String displayUrl) {
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
        vendor.setActive(true);
        vendor.setStatus(VendorStatus.AVAILABLE);
        return vendor;
    }
}
