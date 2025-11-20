package com.streetbite.service;

import com.google.api.core.ApiFuture;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.*;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.streetbite.model.MenuItem;
import com.streetbite.model.Promotion;
import com.streetbite.model.Review;
import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class FirestoreService {

    private Firestore db;

    @PostConstruct
    public void init() throws Exception {
        // Expect GOOGLE_APPLICATION_CREDENTIALS env var to be set to service account JSON path
        if (FirebaseApp.getApps().isEmpty()) {
            String credPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
            FirebaseOptions options;
            boolean firebaseInitialized = false;
            
            if (credPath != null && !credPath.isEmpty()) {
                try {
                    FileInputStream serviceAccount = new FileInputStream(credPath);
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                    FirebaseApp.initializeApp(options);
                    firebaseInitialized = true;
                } catch (Exception e) {
                    System.err.println("Warning: Could not load Firebase credentials from: " + credPath);
                    System.err.println("Error: " + e.getMessage());
                    System.err.println("Attempting to use default credentials...");
                }
            }
            
            if (!firebaseInitialized) {
                // Try default credentials as fallback
                try {
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.getApplicationDefault())
                            .build();
                    FirebaseApp.initializeApp(options);
                    firebaseInitialized = true;
                } catch (Exception e) {
                    System.err.println("Warning: Could not initialize Firebase with default credentials.");
                    System.err.println("Backend will start in limited mode - Firestore operations may fail.");
                    System.err.println("Set GOOGLE_APPLICATION_CREDENTIALS environment variable for full functionality.");
                }
            }
        }
        
        try {
            this.db = com.google.firebase.cloud.FirestoreClient.getFirestore();
        } catch (Exception e) {
            System.err.println("Warning: Could not initialize Firestore client: " + e.getMessage());
            System.err.println("Database operations will not be available.");
            this.db = null;
        }
    }


    // Save vendor (register) with specific ID
    public void saveVendor(Vendor vendor, String vendorId) throws ExecutionException, InterruptedException {
        if (db == null) {
            throw new IllegalStateException("Firestore database is not initialized. Check server logs for credential errors.");
        }
        vendor.setId(vendorId);
        vendor.setCreatedAt(Instant.now().toString());
        vendor.setUpdatedAt(Instant.now().toString());
        DocumentReference vendorRef = db.collection("vendors").document(vendorId);
        vendorRef.set(asMap(vendor)).get();
    }

    // Update vendor location or fields
    public void updateVendor(String id, Map<String, Object> patch) throws ExecutionException, InterruptedException {
        DocumentReference ref = db.collection("vendors").document(id);
        patch.put("updatedAt", Instant.now().toString());
        ref.update(patch).get();
    }

    // Get all vendors (small scale). For production use geohash indexing
    public List<Vendor> getAllVendors() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> snap = db.collection("vendors").get();
        List<QueryDocumentSnapshot> docs = snap.get().getDocuments();
        return docs.stream().map(this::toVendor).collect(Collectors.toList());
    }

    // Get vendor by ID
    public Vendor getVendorById(String vendorId) throws ExecutionException, InterruptedException {
        DocumentReference ref = db.collection("vendors").document(vendorId);
        DocumentSnapshot doc = ref.get().get();
        if (!doc.exists()) return null;
        return toVendor(doc);
    }

    // Geocode cache: look up by address string
    public Map<String, Object> findGeocodeForAddress(String address) throws ExecutionException, InterruptedException {
        CollectionReference col = db.collection("geocoding_cache");
        Query q = col.whereEqualTo("address", address).limit(1);
        List<QueryDocumentSnapshot> docs = q.get().get().getDocuments();
        if (docs.isEmpty()) return null;
        return docs.get(0).getData();
    }

    public void saveGeocode(String address, double lat, double lng) throws ExecutionException, InterruptedException {
        Map<String, Object> m = new HashMap<>();
        m.put("address", address);
        m.put("lat", lat);
        m.put("lng", lng);
        m.put("createdAt", Instant.now().toString());
        db.collection("geocoding_cache").add(m).get();
    }

    // User management methods
    public String saveUser(User user) throws ExecutionException, InterruptedException {
        if (db == null) {
            throw new IllegalStateException("Firestore database is not initialized. Check server logs for credential errors.");
        }
        user.setCreatedAt(Instant.now().toString());
        user.setUpdatedAt(Instant.now().toString());
        CollectionReference users = db.collection("users");
        ApiFuture<DocumentReference> added = users.add(asUserMap(user));
        DocumentReference ref = added.get();
        return ref.getId();
    }

    public User getUserByEmail(String email) throws ExecutionException, InterruptedException {
        CollectionReference users = db.collection("users");
        Query q = users.whereEqualTo("email", email).limit(1);
        List<QueryDocumentSnapshot> docs = q.get().get().getDocuments();
        if (docs.isEmpty()) return null;
        return toUser(docs.get(0));
    }

    public User getUserById(String userId) throws ExecutionException, InterruptedException {
        DocumentReference ref = db.collection("users").document(userId);
        DocumentSnapshot doc = ref.get().get();
        if (!doc.exists()) return null;
        return toUser(doc);
    }

    public void updateUser(String userId, Map<String, Object> patch) throws ExecutionException, InterruptedException {
        DocumentReference ref = db.collection("users").document(userId);
        patch.put("updatedAt", Instant.now().toString());
        ref.update(patch).get();
    }

    private Map<String, Object> asUserMap(User u) {
        Map<String, Object> m = new HashMap<>();
        if (u.getEmail() != null) m.put("email", u.getEmail());
        if (u.getDisplayName() != null) m.put("displayName", u.getDisplayName());
        if (u.getPhoneNumber() != null) m.put("phoneNumber", u.getPhoneNumber());
        if (u.getRole() != null) m.put("role", u.getRole());
        if (u.getPhotoUrl() != null) m.put("photoUrl", u.getPhotoUrl());
        if (u.getLocation() != null) m.put("location", u.getLocation());
        m.put("isActive", u.isActive());
        m.put("createdAt", u.getCreatedAt());
        m.put("updatedAt", u.getUpdatedAt());
        return m;
    }

    private User toUser(DocumentSnapshot d) {
        User u = new User();
        u.setUserId(d.getId());
        u.setEmail(d.getString("email"));
        u.setDisplayName(d.getString("displayName"));
        u.setPhoneNumber(d.getString("phoneNumber"));
        u.setRole(d.getString("role"));
        u.setPhotoUrl(d.getString("photoUrl"));
        @SuppressWarnings("unchecked")
        Map<String, Object> location = (Map<String, Object>) d.get("location");
        u.setLocation(location);
        u.setActive(d.getBoolean("isActive") != null ? d.getBoolean("isActive") : true);
        u.setCreatedAt(d.getString("createdAt"));
        u.setUpdatedAt(d.getString("updatedAt"));
        return u;
    }

    private Map<String, Object> asMap(Vendor v) {
        Map<String, Object> m = new HashMap<>();
        m.put("name", v.getName());
        m.put("address", v.getAddress());
        m.put("latitude", v.getLatitude());
        m.put("longitude", v.getLongitude());
        m.put("cuisine", v.getCuisine());
        m.put("phone", v.getPhone());
        m.put("hours", v.getHours());
        m.put("description", v.getDescription());
        m.put("extra", v.getExtra());
        m.put("createdAt", v.getCreatedAt());
        m.put("updatedAt", v.getUpdatedAt());
        return m;
    }

    private Vendor toVendor(DocumentSnapshot d) {
        Vendor v = new Vendor();
        v.setId(d.getId());
        v.setName(d.getString("name"));
        v.setAddress(d.getString("address"));
        Double lat = d.contains("latitude") ? d.getDouble("latitude") : null;
        Double lng = d.contains("longitude") ? d.getDouble("longitude") : null;
        v.setLatitude(lat);
        v.setLongitude(lng);
        v.setCuisine(d.getString("cuisine"));
        v.setPhone(d.getString("phone"));
        v.setHours(d.getString("hours"));
        v.setDescription(d.getString("description"));
        v.setCreatedAt(d.getString("createdAt"));
        v.setUpdatedAt(d.getString("updatedAt"));
        return v;
    }

    // Menu Item management methods
    public String saveMenuItem(MenuItem item) throws ExecutionException, InterruptedException {
        item.setCreatedAt(Instant.now().toString());
        item.setUpdatedAt(Instant.now().toString());
        CollectionReference menuItems = db.collection("menuItems");
        ApiFuture<DocumentReference> added = menuItems.add(asMenuItemMap(item));
        DocumentReference ref = added.get();
        return ref.getId();
    }

    public List<MenuItem> getMenuItemsByVendor(String vendorId) throws ExecutionException, InterruptedException {
        CollectionReference menuItems = db.collection("menuItems");
        Query q = menuItems.whereEqualTo("vendorId", vendorId);
        ApiFuture<QuerySnapshot> snap = q.get();
        List<QueryDocumentSnapshot> docs = snap.get().getDocuments();
        return docs.stream().map(this::toMenuItem).collect(Collectors.toList());
    }

    public MenuItem getMenuItemById(String itemId) throws ExecutionException, InterruptedException {
        DocumentReference ref = db.collection("menuItems").document(itemId);
        DocumentSnapshot doc = ref.get().get();
        if (!doc.exists()) return null;
        return toMenuItem(doc);
    }

    public void updateMenuItem(String itemId, Map<String, Object> patch) throws ExecutionException, InterruptedException {
        DocumentReference ref = db.collection("menuItems").document(itemId);
        patch.put("updatedAt", Instant.now().toString());
        ref.update(patch).get();
    }

    public void deleteMenuItem(String itemId) throws ExecutionException, InterruptedException {
        DocumentReference ref = db.collection("menuItems").document(itemId);
        ref.delete().get();
    }

    private Map<String, Object> asMenuItemMap(MenuItem item) {
        Map<String, Object> m = new HashMap<>();
        if (item.getVendorId() != null) m.put("vendorId", item.getVendorId());
        if (item.getName() != null) m.put("name", item.getName());
        if (item.getCategory() != null) m.put("category", item.getCategory());
        if (item.getDescription() != null) m.put("description", item.getDescription());
        if (item.getPrice() != null) m.put("price", item.getPrice());
        if (item.getImageUrl() != null) m.put("imageUrl", item.getImageUrl());
        m.put("isAvailable", item.getIsAvailable() != null ? item.getIsAvailable() : true);
        if (item.getPreparationTime() != null) m.put("preparationTime", item.getPreparationTime());
        if (item.getRating() != null) m.put("rating", item.getRating());
        if (item.getTotalOrders() != null) m.put("totalOrders", item.getTotalOrders());
        m.put("createdAt", item.getCreatedAt());
        m.put("updatedAt", item.getUpdatedAt());
        return m;
    }

    private MenuItem toMenuItem(DocumentSnapshot d) {
        MenuItem item = new MenuItem();
        item.setItemId(d.getId());
        item.setVendorId(d.getString("vendorId"));
        item.setName(d.getString("name"));
        item.setCategory(d.getString("category"));
        item.setDescription(d.getString("description"));
        item.setPrice(d.getDouble("price"));
        item.setImageUrl(d.getString("imageUrl"));
        item.setIsAvailable(d.getBoolean("isAvailable") != null ? d.getBoolean("isAvailable") : true);
        Long prepTime = d.getLong("preparationTime");
        item.setPreparationTime(prepTime != null ? prepTime.intValue() : null);
        item.setRating(d.getDouble("rating"));
        Long totalOrders = d.getLong("totalOrders");
        item.setTotalOrders(totalOrders != null ? totalOrders.intValue() : null);
        item.setCreatedAt(d.getString("createdAt"));
        item.setUpdatedAt(d.getString("updatedAt"));
        return item;
    }

    // ========== REVIEW METHODS ==========

    /**
     * Save a review
     */
    public String saveReview(Review review) throws ExecutionException, InterruptedException {
        review.setCreatedAt(Instant.now().toString());
        review.setUpdatedAt(Instant.now().toString());
        CollectionReference reviews = db.collection("reviews");
        ApiFuture<DocumentReference> added = reviews.add(asReviewMap(review));
        DocumentReference ref = added.get();
        
        // Update vendor average rating
        updateVendorRating(review.getVendorId());
        
        return ref.getId();
    }

    /**
     * Get all reviews for a vendor
     */
    public List<Review> getReviewsByVendor(String vendorId) throws ExecutionException, InterruptedException {
        CollectionReference reviews = db.collection("reviews");
        Query q = reviews.whereEqualTo("vendorId", vendorId);
        ApiFuture<QuerySnapshot> snap = q.get();
        List<QueryDocumentSnapshot> docs = snap.get().getDocuments();
        return docs.stream()
                .map(this::toReview)
                .sorted((a, b) -> {
                    String aCreated = a.getCreatedAt();
                    String bCreated = b.getCreatedAt();
                    if (aCreated == null || bCreated == null) return 0;
                    return bCreated.compareTo(aCreated); // Descending order
                })
                .collect(Collectors.toList());
    }

    /**
     * Get review by ID
     */
    public Review getReviewById(String reviewId) throws ExecutionException, InterruptedException {
        DocumentReference ref = db.collection("reviews").document(reviewId);
        DocumentSnapshot doc = ref.get().get();
        if (!doc.exists()) return null;
        return toReview(doc);
    }

    /**
     * Update review
     */
    public void updateReview(String reviewId, Map<String, Object> patch) throws ExecutionException, InterruptedException {
        DocumentReference ref = db.collection("reviews").document(reviewId);
        patch.put("updatedAt", Instant.now().toString());
        ref.update(patch).get();
        
        // Get vendorId and update rating
        DocumentSnapshot doc = ref.get().get();
        if (doc.exists()) {
            String vendorId = doc.getString("vendorId");
            if (vendorId != null) {
                updateVendorRating(vendorId);
            }
        }
    }

    /**
     * Delete review
     */
    public void deleteReview(String reviewId) throws ExecutionException, InterruptedException {
        DocumentReference ref = db.collection("reviews").document(reviewId);
        DocumentSnapshot doc = ref.get().get();
        String vendorId = null;
        if (doc.exists()) {
            vendorId = doc.getString("vendorId");
        }
        ref.delete().get();
        
        // Update vendor rating after deletion
        if (vendorId != null) {
            updateVendorRating(vendorId);
        }
    }

    /**
     * Calculate and update vendor average rating
     */
    private void updateVendorRating(String vendorId) throws ExecutionException, InterruptedException {
        List<Review> reviews = getReviewsByVendor(vendorId);
        Map<String, Object> updateMap = new HashMap<>();
        
        if (reviews.isEmpty()) {
            // No reviews, set rating to null
            updateMap.put("averageRating", null);
            updateMap.put("totalReviews", 0);
        } else {
            double sum = reviews.stream()
                    .filter(r -> r.getRating() != null)
                    .mapToInt(Review::getRating)
                    .sum();
            double avg = sum / reviews.size();
            int total = reviews.size();
            updateMap.put("averageRating", avg);
            updateMap.put("totalReviews", total);
        }
        
        updateVendor(vendorId, updateMap);
    }

    private Map<String, Object> asReviewMap(Review r) {
        Map<String, Object> m = new HashMap<>();
        if (r.getVendorId() != null) m.put("vendorId", r.getVendorId());
        if (r.getUserId() != null) m.put("userId", r.getUserId());
        if (r.getUserName() != null) m.put("userName", r.getUserName());
        if (r.getUserPhotoUrl() != null) m.put("userPhotoUrl", r.getUserPhotoUrl());
        if (r.getRating() != null) m.put("rating", r.getRating());
        if (r.getComment() != null) m.put("comment", r.getComment());
        if (r.getImageUrls() != null) m.put("imageUrls", r.getImageUrls());
        m.put("isVerifiedPurchase", r.getIsVerifiedPurchase() != null ? r.getIsVerifiedPurchase() : false);
        m.put("createdAt", r.getCreatedAt());
        m.put("updatedAt", r.getUpdatedAt());
        return m;
    }

    private Review toReview(DocumentSnapshot d) {
        Review r = new Review();
        r.setReviewId(d.getId());
        r.setVendorId(d.getString("vendorId"));
        r.setUserId(d.getString("userId"));
        r.setUserName(d.getString("userName"));
        r.setUserPhotoUrl(d.getString("userPhotoUrl"));
        Long rating = d.getLong("rating");
        r.setRating(rating != null ? rating.intValue() : null);
        r.setComment(d.getString("comment"));
        @SuppressWarnings("unchecked")
        List<String> imageUrls = (List<String>) d.get("imageUrls");
        r.setImageUrls(imageUrls);
        Boolean isVerifiedPurchase = d.getBoolean("isVerifiedPurchase");
        r.setIsVerifiedPurchase(isVerifiedPurchase != null ? isVerifiedPurchase : false);
        r.setCreatedAt(d.getString("createdAt"));
        r.setUpdatedAt(d.getString("updatedAt"));
        return r;
    }

    // ========== PROMOTION METHODS ==========

    /**
     * Save a promotion
     */
    public String savePromotion(Promotion promotion) throws ExecutionException, InterruptedException {
        promotion.setCreatedAt(Instant.now().toString());
        promotion.setUpdatedAt(Instant.now().toString());
        if (promotion.getCurrentUses() == null) {
            promotion.setCurrentUses(0);
        }
        CollectionReference promotions = db.collection("promotions");
        ApiFuture<DocumentReference> added = promotions.add(asPromotionMap(promotion));
        DocumentReference ref = added.get();
        return ref.getId();
    }

    /**
     * Get all promotions for a vendor
     */
    public List<Promotion> getPromotionsByVendor(String vendorId) throws ExecutionException, InterruptedException {
        CollectionReference promotions = db.collection("promotions");
        Query q = promotions.whereEqualTo("vendorId", vendorId);
        ApiFuture<QuerySnapshot> snap = q.get();
        List<QueryDocumentSnapshot> docs = snap.get().getDocuments();
        return docs.stream()
                .map(this::toPromotion)
                .sorted((a, b) -> {
                    String aCreated = a.getCreatedAt();
                    String bCreated = b.getCreatedAt();
                    if (aCreated == null || bCreated == null) return 0;
                    return bCreated.compareTo(aCreated); // Descending order
                })
                .collect(Collectors.toList());
    }

    /**
     * Get active promotions for a vendor
     */
    public List<Promotion> getActivePromotionsByVendor(String vendorId) throws ExecutionException, InterruptedException {
        CollectionReference promotions = db.collection("promotions");
        Query q = promotions.whereEqualTo("vendorId", vendorId)
                .whereEqualTo("isActive", true);
        ApiFuture<QuerySnapshot> snap = q.get();
        List<QueryDocumentSnapshot> docs = snap.get().getDocuments();
        return docs.stream()
                .map(this::toPromotion)
                .sorted((a, b) -> {
                    String aCreated = a.getCreatedAt();
                    String bCreated = b.getCreatedAt();
                    if (aCreated == null || bCreated == null) return 0;
                    return bCreated.compareTo(aCreated); // Descending order
                })
                .collect(Collectors.toList());
    }

    /**
     * Get promotion by ID
     */
    public Promotion getPromotionById(String promotionId) throws ExecutionException, InterruptedException {
        DocumentReference ref = db.collection("promotions").document(promotionId);
        DocumentSnapshot doc = ref.get().get();
        if (!doc.exists()) return null;
        return toPromotion(doc);
    }

    /**
     * Update promotion
     */
    public void updatePromotion(String promotionId, Map<String, Object> patch) throws ExecutionException, InterruptedException {
        DocumentReference ref = db.collection("promotions").document(promotionId);
        patch.put("updatedAt", Instant.now().toString());
        ref.update(patch).get();
    }

    /**
     * Delete promotion
     */
    public void deletePromotion(String promotionId) throws ExecutionException, InterruptedException {
        DocumentReference ref = db.collection("promotions").document(promotionId);
        ref.delete().get();
    }

    /**
     * Increment promotion usage count
     */
    public void incrementPromotionUses(String promotionId) throws ExecutionException, InterruptedException {
        DocumentReference ref = db.collection("promotions").document(promotionId);
        DocumentSnapshot doc = ref.get().get();
        if (doc.exists()) {
            Long currentUses = doc.getLong("currentUses");
            int newUses = (currentUses != null ? currentUses.intValue() : 0) + 1;
            ref.update("currentUses", newUses, "updatedAt", Instant.now().toString()).get();
        }
    }

    private Map<String, Object> asPromotionMap(Promotion p) {
        Map<String, Object> m = new HashMap<>();
        if (p.getVendorId() != null) m.put("vendorId", p.getVendorId());
        if (p.getTitle() != null) m.put("title", p.getTitle());
        if (p.getDescription() != null) m.put("description", p.getDescription());
        if (p.getDiscountType() != null) m.put("discountType", p.getDiscountType());
        if (p.getDiscountValue() != null) m.put("discountValue", p.getDiscountValue());
        if (p.getPromoCode() != null) m.put("promoCode", p.getPromoCode());
        if (p.getStartDate() != null) m.put("startDate", p.getStartDate());
        if (p.getEndDate() != null) m.put("endDate", p.getEndDate());
        m.put("isActive", p.getIsActive() != null ? p.getIsActive() : true);
        if (p.getMaxUses() != null) m.put("maxUses", p.getMaxUses());
        m.put("currentUses", p.getCurrentUses() != null ? p.getCurrentUses() : 0);
        if (p.getImageUrl() != null) m.put("imageUrl", p.getImageUrl());
        m.put("createdAt", p.getCreatedAt());
        m.put("updatedAt", p.getUpdatedAt());
        return m;
    }

    private Promotion toPromotion(DocumentSnapshot d) {
        Promotion p = new Promotion();
        p.setPromotionId(d.getId());
        p.setVendorId(d.getString("vendorId"));
        p.setTitle(d.getString("title"));
        p.setDescription(d.getString("description"));
        p.setDiscountType(d.getString("discountType"));
        p.setDiscountValue(d.getDouble("discountValue"));
        p.setPromoCode(d.getString("promoCode"));
        p.setStartDate(d.getString("startDate"));
        p.setEndDate(d.getString("endDate"));
        Boolean isActive = d.getBoolean("isActive");
        p.setIsActive(isActive != null ? isActive : true);
        Long maxUses = d.getLong("maxUses");
        p.setMaxUses(maxUses != null ? maxUses.intValue() : null);
        Long currentUses = d.getLong("currentUses");
        p.setCurrentUses(currentUses != null ? currentUses.intValue() : 0);
        p.setImageUrl(d.getString("imageUrl"));
        p.setCreatedAt(d.getString("createdAt"));
        p.setUpdatedAt(d.getString("updatedAt"));
        return p;
    }

    // ========== FAVORITES METHODS ==========

    /**
     * Add vendor to user's favorites
     */
    public void addFavorite(String userId, String vendorId) throws ExecutionException, InterruptedException {
        DocumentReference userRef = db.collection("users").document(userId);
        DocumentSnapshot userDoc = userRef.get().get();
        
        if (!userDoc.exists()) {
            throw new IllegalArgumentException("User not found");
        }
        
        @SuppressWarnings("unchecked")
        List<String> favorites = (List<String>) userDoc.get("favorites");
        if (favorites == null) {
            favorites = new ArrayList<>();
        }
        
        if (!favorites.contains(vendorId)) {
            favorites.add(vendorId);
            userRef.update("favorites", favorites, "updatedAt", Instant.now().toString()).get();
        }
    }

    /**
     * Remove vendor from user's favorites
     */
    public void removeFavorite(String userId, String vendorId) throws ExecutionException, InterruptedException {
        DocumentReference userRef = db.collection("users").document(userId);
        DocumentSnapshot userDoc = userRef.get().get();
        
        if (!userDoc.exists()) {
            throw new IllegalArgumentException("User not found");
        }
        
        @SuppressWarnings("unchecked")
        List<String> favorites = (List<String>) userDoc.get("favorites");
        if (favorites != null) {
            favorites.remove(vendorId);
            userRef.update("favorites", favorites, "updatedAt", Instant.now().toString()).get();
        }
    }

    /**
     * Get user's favorite vendors
     */
    public List<String> getUserFavorites(String userId) throws ExecutionException, InterruptedException {
        DocumentReference userRef = db.collection("users").document(userId);
        DocumentSnapshot userDoc = userRef.get().get();
        
        if (!userDoc.exists()) {
            return new ArrayList<>();
        }
        
        @SuppressWarnings("unchecked")
        List<String> favorites = (List<String>) userDoc.get("favorites");
        return favorites != null ? favorites : new ArrayList<>();
    }

    /**
     * Check if vendor is in user's favorites
     */
    public boolean isFavorite(String userId, String vendorId) throws ExecutionException, InterruptedException {
        List<String> favorites = getUserFavorites(userId);
        return favorites.contains(vendorId);
    }
}
