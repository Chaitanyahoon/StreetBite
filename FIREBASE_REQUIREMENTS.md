# Firebase Requirements for StreetBite

## Why Firebase is Required

Firebase (Firestore) is required in StreetBite to provide **real-time, low-latency data synchronization** for features that need instant updates without constant API polling. While MySQL handles all persistent data storage, Firebase serves as a **real-time sync layer** for ephemeral, frequently-changing data.

### Core Benefits

1. **Real-time Updates Without Polling**
   - Firebase uses WebSocket connections for instant push updates
   - Eliminates the need to poll REST APIs every few seconds
   - Reduces server load and network traffic significantly
   - Provides better user experience with instant feedback

2. **Low-Latency Live Data**
   - Firebase's global CDN ensures fast access to live data
   - Optimized for high-frequency updates (location tracking, status changes)
   - Better suited for mobile vendor tracking than database polling

3. **Offline-First Capability**
   - Firebase SDK caches data locally
   - Users can view last-known status even when offline
   - Automatic sync when connection is restored

4. **Scalable Real-time Infrastructure**
   - Firebase handles WebSocket connections at scale
   - No need to build custom WebSocket infrastructure in Spring Boot
   - Managed service reduces operational complexity

---

## Where Firebase is Required

### 1. **Live Vendor Status** 🟢🔴
**Collection**: `live_vendor_status`

**Why It's Needed**:
- Customers need to see which vendors are **currently accepting orders** before browsing menus
- Vendors can go online/offline instantly without page refresh
- Shows whether vendor is "busy" or "free" in real-time

**User Experience**:
- ❌ Without Firebase: Users might waste time browsing a menu only to find vendor is offline
- ✅ With Firebase: Vendor cards show live status badge (🟢 Online, 🔴 Offline, 🟡 Busy)

**Example Use Cases**:
- Food cart vendor arrives at location → goes online in app → customers immediately see vendor on map
- Vendor runs out of ingredients → marks as "busy" → new orders pause automatically
- Vendor closes for break → goes offline → customers see "Unavailable" instantly

---

### 2. **Live Order Tracking** 📦
**Collection**: `live_orders`

**Why It's Needed**:
- Customers want real-time updates on their order status
- Vendors update order progress from their dashboard
- Eliminates anxiety of "where's my order?"

**Order Status Flow**:
```
Placed → Preparing → Ready → Completed
```

**User Experience**:
- ❌ Without Firebase: Customer must refresh page or wait for API polling (every 10-30 seconds)
- ✅ With Firebase: Instant notification when order status changes

**Example Scenario**:
1. Customer places order → sees "Placed" status
2. Vendor accepts → customer sees "Preparing" (instant update)
3. Vendor marks ready → customer gets notification "Your order is ready for pickup!"
4. No page refresh needed - updates appear automatically

---

### 3. **Live Menu Availability** 🍔
**Collection**: `live_menu_updates`

**Why It's Needed**:
- Menu items can run out during the day
- Vendors need to mark items unavailable without updating MySQL
- Prevents orders for unavailable items

**User Experience**:
- ❌ Without Firebase: Customer adds unavailable item to cart → order fails → frustration
- ✅ With Firebase: Item shows "Sold Out" in real-time → customer knows immediately

**Example**:
- Vendor sells out of "Pani Puri" at 3 PM
- Marks item unavailable in vendor dashboard
- All customers browsing menu see item grayed out instantly
- At 5 PM, vendor restocks → marks available → customers see it's back

---

### 4. **Vendor Location Tracking** 📍
**Collection**: `vendor_location`

**Why It's Needed**:
- Street food vendors are **mobile** (food carts, trucks)
- Location changes throughout the day
- Customers need to find vendor's current location

**User Experience**:
- ❌ Without Firebase: Vendor location updates every minute via API → delay, high server load
- ✅ With Firebase: Vendor location updates every 10 seconds → accurate tracking

**Example Scenario**:
- Food truck parks at Location A (9 AM - 12 PM)
- Moves to Location B (lunch crowd at office complex)
- Moves to Location C (evening at park)
- Customer opens app → sees vendor's **current** location on map

---

### 5. **User Notifications** 🔔
**Collection**: `notifications`

**Why It's Needed**:
- Users get instant alerts for order updates, promotions
- Notifications appear without app refresh
- Better engagement than email notifications

**Notification Types**:
- **Order notifications**: "Your order is ready!"
- **Promotion alerts**: "20% off at your favorite vendor"
- **Vendor updates**: "Vendor you follow is now online"

**User Experience**:
- ✅ Real-time notification badge updates
- ✅ Notification list updates without refresh
- ✅ Mark as read syncs across devices

---

## Technical Implementation

### Frontend (Next.js)
**Files Using Firebase**:
- `lib/firebase.ts` - Firebase initialization and auth
- `lib/firestore-service.ts` - Type-safe Firestore operations
- `lib/firebase-collections.ts` - Collection name constants
- `hooks/use-vendor-status.ts` - Real-time vendor status hook

**Example Usage**:
```typescript
// Subscribe to vendor status updates
FirestoreService.subscribeToVendorStatus(vendorId, (status) => {
  if (status?.isOnline) {
    showOnlineBadge();
  } else {
    showOfflineBadge();
  }
});
```

### Backend (Spring Boot)
**Files Using Firebase**:
- `config/FirebaseConfig.java` - Firebase Admin SDK setup
- `service/FirestoreService.java` - Server-side Firestore operations

**Example Usage**:
```java
// Update order status from backend
firestoreService.updateOrderStatus(orderId, "READY", "5 minutes");
```

---

## Data Flow Architecture

### Persistent Data (MySQL)
```
User registers → Spring Boot API → MySQL (users table)
Vendor creates menu → Spring Boot API → MySQL (menu_items table)
Customer places order → Spring Boot API → MySQL (orders table)
```

### Real-time Data (Firebase)
```
Vendor goes online → Spring Boot → Firebase (live_vendor_status)
Order status changes → Spring Boot → Firebase (live_orders)
Frontend subscribes → Firebase → Instant UI update
```

### Key Principle
> **MySQL is the source of truth. Firebase is the notification layer.**

- When order is created → saved to MySQL **first**
- Then live status → pushed to Firebase for real-time tracking
- If Firebase fails → order still exists in MySQL
- Firebase data is ephemeral and can be rebuilt from MySQL

---

## When Firebase is NOT Used

Firebase is explicitly **NOT** used for:
- ❌ User authentication (handled by MySQL + bcrypt)
- ❌ Menu items storage (MySQL)
- ❌ Order history (MySQL)
- ❌ Reviews (MySQL)
- ❌ Vendor profiles (MySQL)
- ❌ Payment information (MySQL)

These are stored in MySQL because they require:
- Strong consistency
- Complex queries and joins
- Historical data preservation
- ACID transaction guarantees

---

## Configuration Required

### Frontend Setup
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Add web app config to `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   ```

### Backend Setup
1. Download Firebase Admin SDK service account JSON
2. Place as `firebase-key.json` in project root
3. Or set environment variable:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=path/to/firebase-key.json
   ```

### Firestore Collections Setup
Create these collections in Firebase Console:
- `live_vendor_status`
- `live_orders`
- `live_menu_updates`
- `vendor_location`
- `notifications`

---

## Can You Remove Firebase?

### YES, if you:
- Don't need real-time updates (polling is acceptable)
- Are building a basic ordering system
- Want to minimize infrastructure complexity
- Don't have mobile food vendors (fixed locations only)

### NO, if you need:
- ✅ Instant order status notifications
- ✅ Live vendor online/offline status
- ✅ Real-time location tracking for food carts
- ✅ Professional food delivery app experience
- ✅ Low server load (no constant API polling)

---

## Alternative Architecture (Without Firebase)

If you choose to remove Firebase, you would need:

1. **WebSocket Server** (Spring Boot + STOMP)
   - Replace Firestore listeners with WebSocket subscriptions
   - More complex to implement and maintain

2. **Server-Sent Events (SSE)**
   - One-way communication from server to client
   - Simpler than WebSockets but less flexible

3. **Polling with Short Intervals**
   - Hit REST API every 5-10 seconds
   - High server load, poor scalability

4. **No Real-time Features**
   - Manual page refresh required
   - Poor user experience for modern food delivery app

---

## Conclusion

Firebase is required in StreetBite for providing **real-time, scalable, low-latency synchronization** of live data that changes frequently (vendor status, order tracking, location). It complements MySQL's role as the persistent data store and enables a modern, responsive user experience expected in food delivery applications.

**Recommended**: Keep the hybrid MySQL + Firebase architecture for the best balance of data consistency (MySQL) and real-time features (Firebase).
