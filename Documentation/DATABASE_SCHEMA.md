# 🗄️ Database Schema - MySQL (Aiven)

## 🎯 Database Configuration

The application uses **MySQL 8.0** hosted on **Aiven Cloud**. The schema is managed via **Spring Data JPA**.

---

## 📊 Entity Relationship Diagram (ERD Overview)

### 1. **Users**
- Central entity for authentication.
- **Roles**: `CUSTOMER`, `VENDOR`, `ADMIN`.
- **Relationships**:
    - One User -> One Vendor (if Vendor role)
    - One User -> Many Reviews
    - One User -> Many Favorites

### 2. **Vendors**
- Stores restaurant/stall details.
- **Fields**: Name, Address, Cuisine, Geolocation (Lat/Lng), Rating.
- **Relationships**:
    - One Vendor -> Many MenuItems
    - One Vendor -> Many Reviews
    - One Vendor -> Many Promotions
    - One Vendor -> Many VendorImages

### 3. **Menu Items**
- Food items listed by a vendor.
- **Fields**: Name, Description, Price, Image URL, Category, Is Vegetarian/Spicy.
- **Relationship**: Links back to `Vendor`.

### 4. **Reviews**
- Customer feedback.
- **Fields**: Rating (1-5), Comment, Image URL.
- **Relationships**: Links `User` and `Vendor`.

### 5. **Promotions**
- Special offers created by vendors.
- **Fields**: Discount Value, Start/End Date, Coupon Code.
- **Relationship**: Links back to `Vendor`.

---

## 🔧 Connectivity

The backend connects via JDBC.

### Properties (`application.properties`)

```properties
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## 🗄️ Tables (Schema)

| Table Name | Description | Key Columns |
|------------|-------------|-------------|
| `users` | User accounts | `id`, `email`, `role`, `password_hash` |
| `vendors` | Vendor profiles | `id`, `owner_id`, `name`, `latitude`, `longitude` |
| `menu_items` | Food items | `id`, `vendor_id`, `name`, `price` |
| `reviews` | Ratings & comments | `id`, `vendor_id`, `user_id`, `rating` |
| `promotions` | Discounts | `id`, `vendor_id`, `code`, `discount_value` |
| `favorites` | User favorites | `id`, `user_id`, `vendor_id` |

---

## 🚀 Status

- ✅ **Migration**: Successfully migrated from Firestore to Relational MySQL.
- ✅ **Relationships**: Foreign keys enforce data integrity.
- ✅ **Indexing**: Primary keys and foreign keys are indexed for performance.
- ✅ **Cloud Hosting**: Running purely on Aiven MySQL.


