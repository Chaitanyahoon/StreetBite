# StreetBite Backend - Spring Boot with Firebase

A production-ready Spring Boot backend for the StreetBite street food delivery platform, integrated with Firebase Firestore for real-time data management.

## Features

### Authentication & Security
- JWT-based authentication with role-based access control
- Three user roles: VENDOR, ADMIN, CUSTOMER
- Firebase integration for secure credential management
- CORS configured for frontend integration

### Vendor Management
- Vendor profile management (business details, location)
- Menu item CRUD operations with categories and pricing
- Promotions and discount code management
- Analytics tracking (revenue, orders, customer metrics)
- Order counting and metrics

### Admin Management
- Platform statistics and analytics
- Vendor approval/rejection workflow
- Vendor suspension and deletion
- Commission and revenue tracking
- Vendor details and performance metrics

### Menu & Promotions
- Complete menu management system
- Promotional code creation and tracking
- Usage limit enforcement
- Item availability management
- Preparation time tracking

### Analytics
- Vendor performance tracking
- Revenue and order analytics
- Customer acquisition metrics
- Rating and satisfaction tracking
- View counting

## Tech Stack

- **Java 17**
- **Spring Boot 3.1.5**
- **Spring Security**
- **Firebase Admin SDK**
- **JWT (JSON Web Tokens)**
- **Maven**

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Firebase project with service account key

### Installation

1. Clone the repository
\`\`\`bash
git clone <your-repo>
cd streetbite-backend
\`\`\`

2. Download Firebase Service Account Key
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save as `src/main/resources/firebase-key.json`

3. Configure application properties
   - Edit `src/main/resources/application.yml`
   - Update Firebase config values
   - Change JWT secret for production

4. Build the project
\`\`\`bash
mvn clean install
\`\`\`

5. Run the application
\`\`\`bash
mvn spring-boot:run
\`\`\`

The API will be available at `http://localhost:8080/api`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (vendor/admin/customer)
- `POST /api/auth/login` - Login and get JWT token

### Vendor APIs
- `GET /api/vendor/profile/{vendorId}` - Get vendor profile
- `PUT /api/vendor/profile/{vendorId}` - Update vendor profile
- `GET /api/vendor/all` - Get all vendors
- `POST /api/vendor/increment-orders/{vendorId}` - Increment order count

### Menu APIs
- `POST /api/menu/{vendorId}/create` - Create menu item
- `PUT /api/menu/{itemId}/update` - Update menu item
- `DELETE /api/menu/{itemId}/delete` - Delete menu item
- `GET /api/menu/{itemId}` - Get menu item
- `GET /api/menu/vendor/{vendorId}` - Get vendor's menu
- `POST /api/menu/{itemId}/increment-orders` - Increment item orders

### Promotions APIs
- `POST /api/promotions/{vendorId}/create` - Create promotion
- `PUT /api/promotions/{promotionId}/update` - Update promotion
- `DELETE /api/promotions/{promotionId}/delete` - Delete promotion
- `GET /api/promotions/{promotionId}` - Get promotion details
- `GET /api/promotions/vendor/{vendorId}` - Get vendor's promotions
- `POST /api/promotions/{promotionId}/use` - Record promotion usage

### Admin APIs
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/vendors/pending` - Get pending vendor approvals
- `POST /api/admin/vendors/{vendorId}/approve` - Approve vendor
- `POST /api/admin/vendors/{vendorId}/reject` - Reject vendor
- `POST /api/admin/vendors/{vendorId}/suspend` - Suspend vendor
- `DELETE /api/admin/vendors/{vendorId}` - Delete vendor
- `GET /api/admin/vendors/{vendorId}/details` - Get vendor details

### Analytics APIs
- `GET /api/analytics/vendor/{vendorId}` - Get vendor analytics
- `POST /api/analytics/vendor/{vendorId}/record-view` - Record vendor view
- `POST /api/analytics/vendor/{vendorId}/record-order` - Record order analytics

## Request/Response Examples

### Register
\`\`\`bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com",
    "password": "password123",
    "role": "VENDOR"
  }'
\`\`\`

### Login
\`\`\`bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com",
    "password": "password123"
  }'
\`\`\`

### Create Menu Item
\`\`\`bash
curl -X POST http://localhost:8080/api/menu/{vendorId}/create \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chicken Biryani",
    "category": "Biryani",
    "description": "Flavorful chicken biryani",
    "price": 250,
    "preparationTime": 20
  }'
\`\`\`

## Firebase Firestore Schema

### Users Collection
\`\`\`
users/
  {email}/
    - userId: string
    - email: string
    - password: string (hashed)
    - role: string (VENDOR/ADMIN/CUSTOMER)
    - createdAt: timestamp
    - updatedAt: timestamp
\`\`\`

### Vendors Collection
\`\`\`
vendors/
  {vendorId}/
    - vendorId: string
    - businessName: string
    - ownerName: string
    - email: string
    - phone: string
    - address: string
    - latitude: number
    - longitude: number
    - description: string
    - logoUrl: string
    - rating: number
    - totalOrders: number
    - totalRevenue: number
    - isActive: boolean
    - status: string (PENDING/APPROVED/REJECTED)
    - openingHours: string
    - closingHours: string
    - createdAt: timestamp
\`\`\`

### Menu Items Collection
\`\`\`
menuItems/
  {itemId}/
    - itemId: string
    - vendorId: string
    - name: string
    - category: string
    - description: string
    - price: number
    - imageUrl: string
    - isAvailable: boolean
    - preparationTime: number
    - rating: number
    - totalOrders: number
    - createdAt: timestamp
    - updatedAt: timestamp
\`\`\`

### Promotions Collection
\`\`\`
promotions/
  {promotionId}/
    - promotionId: string
    - vendorId: string
    - code: string
    - description: string
    - discountPercentage: number
    - discountAmount: number
    - maxUsageCount: number
    - currentUsageCount: number
    - startDate: timestamp
    - expiryDate: timestamp
    - isActive: boolean
    - createdAt: timestamp
\`\`\`

## Deployment

### Deploy to Production

1. Update JWT secret in `application.yml`
2. Update CORS allowed origins for production domain
3. Build production package
\`\`\`bash
mvn clean package -DskipTests
\`\`\`

4. Deploy JAR file to your server
\`\`\`bash
java -jar target/streetbite-backend-1.0.0.jar
\`\`\`

## Environment Variables

Set these for production:
- `JWT_SECRET` - Strong JWT signing key
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_STORAGE_BUCKET` - Firebase storage bucket

## Support

For issues or questions, please create an issue in the repository.
