# 🍽️ StreetBite - Simple Guide (Easy Language)

Everything explained like you're explaining to a friend!

---

# PART 1: WHAT IS STREETBITE?

## The Simple Story

Imagine you're hungry and want to eat street food. But you don't know:
- Where are the best food stalls near me?
- What do they sell?
- Are they open right now?
- Are they good? (reviews)

**StreetBite solves this!**

It's like Zomato, but ONLY for street food stalls (chaat wale, vada pav wale, momos wale, etc.)

---

## Who Uses StreetBite?

### 1. CUSTOMERS (Normal People)
**What they can do:**
- Open app → See stalls near them on a map
- Click on a stall → See menu with prices
- Read reviews from other customers
- Get directions to walk there
- Save favorite stalls
- Place orders (coming soon)

### 2. VENDORS (Street Food Sellers)
**What they can do:**
- Register their food stall
- Add menu items with photos and prices
- See how many people viewed their stall
- Create offers (like "20% off today!")
- Mark items as "Sold Out"
- See their earnings report

### 3. ADMIN (App Owner/Manager)
**What they can do:**
- Approve new vendor registrations
- Ban bad vendors
- See how the whole app is doing
- Manage all users

---

# PART 2: THE TWO DATABASES (Where Data is Stored)

## Why Two Databases?

Think of it like this:
- **MySQL** = A permanent notebook (writes everything carefully, keeps forever)
- **Firebase** = A live TV broadcast (shows updates instantly to everyone watching)

### MySQL Stores (Permanent Stuff):
| What | Why MySQL? |
|------|------------|
| User accounts | Need to keep forever, login should be secure |
| Vendor profiles | Business information, address, phone |
| Menu items | Prices, descriptions, photos |
| Orders | Need history for reports |
| Reviews | Need to keep all reviews |
| Payment info | Needs to be secure |

### Firebase Stores (Live Updates):
| What | Why Firebase? |
|------|---------------|
| "Is vendor open right now?" | Changes frequently, everyone should see immediately |
| "Is this item sold out?" | When vada pav is sold out, ALL customers should know instantly |
| Vendor's live GPS location | For mobile vendors who move around |
| Push notifications | "Your order is ready!" messages |

### Real Example:

**Scenario:** Vendor marks "Samosa" as SOLD OUT

```
1. Vendor clicks "Sold Out" button
2. App saves to MySQL (permanent record)
3. App ALSO sends to Firebase (instant update)
4. ALL customers looking at that menu see "SOLD OUT" immediately
   (without refreshing the page!)
```

---

# PART 3: BACKEND SERVICES (The Brain of the App)

The backend has 16 "services" - think of each as a specialist worker:

---

## 🔐 1. Authentication Service (Security Guard)

**Simple Job:** Makes sure only real users can enter

### A) Registration (Signing Up)

**What happens when you click "Sign Up":**

```
Step 1: You enter email + password
Step 2: App checks "Does this email already exist?" 
        → If yes: Error "User already exists"
        → If no: Continue...
Step 3: Password gets "hashed" (scrambled) for security
        Your password: "mypassword123"
        Becomes: "$2a$10$N9qo8uLO..." (random looking text)
        (Nobody can read your real password, not even us!)
Step 4: Account is created in database
Step 5: If you're a vendor, a vendor profile is also created
Step 6: You get a "token" (like an entry pass)
```

### B) Login (Signing In)

**What happens when you click "Login":**

```
Step 1: You enter email + password
Step 2: App finds your account by email
Step 3: App checks if password matches
        (Compares your scrambled password with stored scrambled password)
Step 4: If match: You get a token (entry pass valid for 24 hours)
Step 5: If no match: Error "Wrong password"
```

### C) Forgot Password

**What happens when you click "Forgot Password":**

```
Step 1: You enter your email
Step 2: App creates a secret reset link (valid for 15 minutes only)
Step 3: App sends email with that link
Step 4: You click link → Enter new password
Step 5: Password is changed!
```

---

## 📍 2. Geocoding Service (Address to GPS Converter)

**Simple Job:** Converts text address to GPS coordinates

**Why needed?** 
To show vendors on map, we need GPS numbers (19.0760, 72.8777) not just "Mumbai"

### How it works:

```
Input: "Juhu Beach, Mumbai"
         ↓
Service checks:
  1. Did we already convert this address before? (Check cache)
     → Yes? Return saved coordinates (saves money!)
     → No? Continue...
  
  2. Ask Google Maps API "Where is this address?"
     → Google returns: latitude = 19.0974, longitude = 72.8267
     → Save in cache for next time
     → Return coordinates
  
  3. If Google is down:
     → Generate fake but consistent coordinates
     → (Same address always gives same fake result)
```

**Why caching?**
- Google Maps API costs money (₹5 per 1000 requests)
- Same address = same coordinates (no need to ask Google again)
- Cache saves money and makes app faster

---

## 🔍 3. Vendor Search Service (Finder)

**Simple Job:** Find food stalls near your location

### How it works:

```
You: "Find vendors within 2 km of my location"
Your GPS: (19.0760, 72.8777)

Service does:
  1. Get ALL active vendors from database
  2. For EACH vendor, calculate distance:
     "How far is this vendor from user's location?"
     (Uses Earth geometry math called Haversine formula)
  3. Filter: Keep only vendors within 2 km
  4. Sort: Nearest first
  5. Return list
```

### The Distance Math (Simplified):
```
Earth is a ball with radius 6,371 km
To find distance between two GPS points:
→ Use spherical geometry (curved distance, not straight line)
→ Formula gives distance in meters
```

---

## 🏪 4. Vendor Service (Shop Manager)

**Simple Job:** Manage vendor profiles (create, update, delete)

### Functions:

**A) Create Vendor**
```
When vendor registers:
→ Create vendor profile
→ Link to user account
→ Set default values (cuisine = "Street Food", status = "Pending")
```

**B) Update Vendor**
```
Vendor changes business name or address?
→ Update in database
→ If location changed, update GPS coordinates too
```

**C) Delete Vendor (Careful! Cascade Delete)**
```
When deleting a vendor, ALSO delete:
  1. All reviews of this vendor
  2. All favorites (users who saved this vendor)
  3. All orders from this vendor
  4. Finally, delete the vendor itself

Why? If we only delete vendor, the reviews/orders would point to nothing!
```

---

## 📋 5. Menu Service (Menu Manager)

**Simple Job:** Manage food items on vendor's menu

### Functions:

**A) Add Menu Item**
```
Vendor adds "Vada Pav - ₹20"
→ Create record with: name, price, description, photo, vendorId
→ Set isAvailable = true
```

**B) Update Menu Item**
```
Change price from ₹20 to ₹25?
→ Update the record
Marked as Sold Out?
→ Set isAvailable = false
→ ALSO sync to Firebase (so customers see immediately)
```

**C) Delete Menu Item**
```
Remove item completely from menu
```

**D) Get Menu**
```
Customer opens vendor page
→ Return all menu items for that vendor
→ Sorted by category (starters, mains, drinks)
```

---

## 🛒 6. Order Service (Order Manager)

**Simple Job:** Handle customer orders

### Order Flow:

```
CUSTOMER                    SYSTEM                      VENDOR
    |                          |                           |
    |---- Places Order ------->|                           |
    |                          |---- Save to DB ---------->|
    |                          |---- Send Notification --->| 🔔 "New Order!"
    |                          |                           |
    |                          |<--- Vendor Accepts -------|
    |<-- "Order Accepted!" ----|                           |
    |                          |                           |
    |                          |<--- Vendor marks Ready ---|
    |<-- "Order Ready!" -------|                           |
    |                          |                           |
    |---- Customer pickup ---->|                           |
    |                          |---- Mark Completed ------>|
```

### Order Statuses:
| Status | Meaning |
|--------|---------|
| PENDING | Just placed, waiting for vendor |
| ACCEPTED | Vendor started making it |
| READY | Food is ready, come pick up! |
| COMPLETED | Customer picked up, done! |
| CANCELLED | Order was cancelled |

---

## ⭐ 7. Review Service (Ratings Manager)

**Simple Job:** Handle customer reviews and ratings

### What's stored in a review:
```
{
  vendorId: 123,           // Which stall?
  userId: 456,             // Who wrote it?
  rating: 4,               // 1-5 stars
  comment: "Great pav bhaji, loved it!",
  photos: ["photo1.jpg", "photo2.jpg"],
  createdAt: "2024-12-09"
}
```

### Impact on Vendor:
- Average rating is recalculated after each review
- Vendor can see all reviews in dashboard
- Customers see average rating on vendor card

---

## 📊 8. Analytics Service (Reports Generator)

**Simple Job:** Track and show vendor performance

### What it tracks:

| Metric | How it's tracked |
|--------|------------------|
| Profile Views | Every time customer opens vendor page → +1 |
| Direction Clicks | Every time customer clicks "Get Directions" → +1 |
| Call Clicks | Every time customer clicks phone number → +1 |
| Menu Views | Every time customer looks at menu → +1 |

### What vendors see:

```
Last 7 Days Report:
┌────────────────────────────────────────┐
│ 👀 Profile Views:     247              │
│ 🗺️ Direction Clicks:  89               │
│ 📞 Call Clicks:       34               │
│ 📋 Menu Interactions: 312              │
├────────────────────────────────────────┤
│ 💰 Total Revenue:     ₹15,670          │
│ 📦 Total Orders:      78               │
│ 👥 Unique Customers:  52               │
│ ⭐ Average Rating:    4.3/5            │
└────────────────────────────────────────┘
```

### Daily Chart:
Shows how each metric changed each day (Mon, Tue, Wed...)

---

## 🔔 9. Notification Service (Message Sender)

**Simple Job:** Send push notifications to phones

### Types of notifications:

**A) To Single Person:**
```
Send to customer: "Your order is ready!"
→ Uses their phone's FCM token (unique ID)
```

**B) To Multiple People:**
```
Send to all customers who favorited a vendor: "New item added!"
→ Uses list of FCM tokens
```

**C) To Topic (Group):**
```
Send to all users in "Mumbai" topic: "New vendor opened near you!"
→ Everyone subscribed to "Mumbai" gets it
```

### Pre-made Messages:

| Event | Title | Message |
|-------|-------|---------|
| New Order (to vendor) | 🆕 New Order! | Rahul placed an order. Tap to view. |
| Order Accepted | ✅ Order Accepted! | Your order has been accepted. |
| Order Ready | 🎉 Order Ready! | Your order is ready for pickup! |
| Order Completed | ✨ Order Completed | Thank you! Hope you enjoyed! |
| Order Cancelled | ❌ Order Cancelled | Your order has been cancelled. |

---

## ⚡ 10. Real-Time Sync Service (Live Updater)

**Simple Job:** Push instant updates to all users

### What it syncs:

**A) Menu Availability**
```
Vendor marks "Samosa" sold out
  ↓
RealTimeSyncService.updateMenuAvailability(itemId, false)
  ↓
Firebase collection "live_menu_items" updated
  ↓
ALL customers viewing that menu see "Sold Out" INSTANTLY
```

**B) Vendor Status**
```
Vendor clicks "I'm closing for today"
  ↓
RealTimeSyncService.updateVendorStatus(vendorId, "CLOSED")
  ↓
Firebase collection "live_vendors" updated
  ↓
Map markers change to grey (closed) for all users
```

**C) Vendor Location**
```
Mobile vendor (like an ice cream cart) moves
  ↓
RealTimeSyncService.updateVendorLocation(vendorId, newLat, newLng)
  ↓
Map position updates for all users looking at map
```

---

## 🎮 11. Gamification Service (Rewards System)

**Simple Job:** Give XP points and levels to make app fun

### XP Rewards:
| Action | XP Earned |
|--------|-----------|
| Login daily | 50 XP |
| Complete a food challenge | 50 XP |
| Win a food game/quiz | 100 XP |
| Post in community | 10 XP |

### Level System:
```
XP needed for each level:
Level 1: 0 XP
Level 2: 100 XP
Level 3: 300 XP
Level 4: 600 XP
Level 5: 1000 XP
... and so on

Your Level = (1 + √(1 + 0.08 × YourXP)) / 2
```

### Daily Streak:
```
Day 1: Login → Streak = 1
Day 2: Login → Streak = 2
Day 3: Login → Streak = 3
Day 4: Miss! → Streak resets to 1
```

### Leaderboard:
Shows Top 10 users with most XP

---

## 🔮 12. Zodiac Service (Foodtaar - Fun Feature!)

**Simple Job:** Give fun food predictions based on zodiac sign

### Daily Horoscope for Each Sign:

**Example for Aries:**
```
{
  prediction: "Spicy food is your best friend today!",
  luckyDish: "Vada Pav",
  luckyTime: "3:45 PM",
  challenge: "Try something spicy 🌶️"
}
```

**Example for Taurus:**
```
{
  prediction: "Comfort food will bring you great joy.",
  luckyDish: "Burger",
  luckyTime: "7:30 PM", 
  challenge: "Try something under ₹80"
}
```

### All 12 Zodiac Signs Covered:
Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces

### How predictions are "random" but consistent:
```
Same sign + Same date = Same prediction every time
(Uses day-of-year math to pick from prediction list)

Different day? Different prediction for same sign!
```

---

## 📧 13. Email Service (Email Sender)

**Simple Job:** Send emails (currently just password reset)

### How Password Reset Email Works:

```
User clicks "Forgot Password"
  ↓
System creates unique token (random ID)
  ↓
Token valid for 15 minutes only
  ↓
Email sent:
  Subject: "StreetBite - Password Reset Request"
  Body: "Click this link to reset: http://...?token=abc123"
  ↓
User clicks link, enters new password
  ↓
Password changed!
```

### Email Settings (SMTP):
- Uses Gmail's email servers
- Sends from app's official email address
- Secure SSL connection

---

## 🎁 14. Promotion Service (Deals Manager)

**Simple Job:** Manage vendor promotions and offers

### Promotion Types:

| Type | Example | How it works |
|------|---------|--------------|
| PERCENTAGE | 20% off | Price × 0.8 = Final price |
| FIXED_AMOUNT | ₹50 off | Price - 50 = Final price |
| BUY_ONE_GET_ONE | BOGO | Buy 1, get 1 free |

### Promotion Data:
```
{
  vendorId: 123,
  title: "Weekend Special!",
  description: "20% off on all chaat items",
  discountType: "PERCENTAGE",
  discountValue: 20,
  promoCode: "CHAAT20",
  startDate: "2024-12-09",
  endDate: "2024-12-10",
  maxUses: 100,        // Limit how many can use it
  currentUses: 45      // 45 already used
}
```

---

## 📱 15. User Device Service (Device Tracker)

**Simple Job:** Track user's phone for notifications

### Why needed?
One user can have multiple devices (phone + tablet)
We need to send notification to ALL their devices

### How it works:
```
User logs in on Phone A
  → Phone A's FCM token stored
  
User also logs in on Tablet B  
  → Tablet B's FCM token stored
  
Now user has 2 tokens in database
  
When sending notification:
  → Get all tokens for that user
  → Send to ALL tokens
  → User gets notification on both devices!
```

---

## 📈 16. Vendor Stats Service (Statistics Calculator)

**Simple Job:** Calculate vendor's business statistics

### What it calculates:

| Stat | What it measures |
|------|------------------|
| Total Revenue | Sum of all order amounts |
| Total Orders | Count of all orders |
| Avg Order Value | Total Revenue ÷ Total Orders |
| Customer Retention | Customers who ordered more than once |
| Peak Hours | Busiest times (most orders) |
| Popular Items | Most ordered menu items |

---

# PART 4: FRONTEND PAGES (What Users See)

## Customer Pages:

### Home Page (`/`)
```
┌────────────────────────────────────────┐
│  🍽️ StreetBite                    [Login]│
├────────────────────────────────────────┤
│                                        │
│    Find Street Food Near You           │
│    [Search Bar with location]          │
│                                        │
│    🗺️ [View Map] button               │
│                                        │
├────────────────────────────────────────┤
│   Featured Vendors:                    │
│   ┌────┐ ┌────┐ ┌────┐               │
│   │ V1 │ │ V2 │ │ V3 │               │
│   └────┘ └────┘ └────┘               │
└────────────────────────────────────────┘
```

### Explore Page (`/explore`)
```
┌────────────────────────────────────────┐
│  [Filter] [Sort] [Cuisine dropdown]    │
├────────────────────────────────────────┤
│                                        │
│    Google Map with vendor markers      │
│    📍 📍 📍 📍                         │
│                                        │
├────────────────────────────────────────┤
│   List of vendors (clickable):         │
│   ┌──────────────────────────────┐    │
│   │ 🍕 Raju's Vada Pav  ⭐ 4.5   │    │
│   │    500m away | ₹₹ | Open    │    │
│   └──────────────────────────────┘    │
└────────────────────────────────────────┘
```

### Vendor Detail Page (`/vendors/[id]`)
```
┌────────────────────────────────────────┐
│  ← Back                                │
├────────────────────────────────────────┤
│  [Banner Image]                        │
│  🍕 Raju's Famous Vada Pav            │
│  ⭐ 4.5 (124 reviews) | Open now       │
│  📍 Andheri West, Mumbai               │
│  [❤️ Save] [📞 Call] [🗺️ Directions]  │
├────────────────────────────────────────┤
│  MENU                                  │
│  ┌──────────────────────────────┐     │
│  │ Vada Pav............... ₹20 │     │
│  │ Double Vada Pav........ ₹35 │     │
│  │ Cold Drink............ ₹25  │     │
│  └──────────────────────────────┘     │
├────────────────────────────────────────┤
│  REVIEWS                               │
│  ⭐⭐⭐⭐⭐ "Best vada pav ever!"      │
│  ⭐⭐⭐⭐☆ "Good but crowded"         │
└────────────────────────────────────────┘
```

---

## Vendor Dashboard Pages:

### Dashboard Home (`/vendor`)
```
┌────────────────────────────────────────┐
│  Welcome, Raju!                        │
├────────────────────────────────────────┤
│  Today's Stats:                        │
│  ┌────────┐ ┌────────┐ ┌────────┐    │
│  │ ₹2,450 │ │   12   │ │  4.5   │    │
│  │Revenue │ │ Orders │ │ Rating │    │
│  └────────┘ └────────┘ └────────┘    │
├────────────────────────────────────────┤
│  Quick Actions:                        │
│  [➕ Add Item] [📊 Analytics]          │
│  [🎫 Promotions] [⚙️ Settings]        │
└────────────────────────────────────────┘
```

### Menu Management (`/vendor/menu`)
```
┌────────────────────────────────────────┐
│  My Menu                    [+ Add New]│
├────────────────────────────────────────┤
│  ┌──────────────────────────────┐     │
│  │ 🍕 Vada Pav          ₹20     │     │
│  │ [✅ Available] [Edit] [Delete]│    │
│  └──────────────────────────────┘     │
│  ┌──────────────────────────────┐     │
│  │ 🥤 Cold Drink        ₹25     │     │
│  │ [❌ Sold Out] [Edit] [Delete] │     │
│  └──────────────────────────────┘     │
└────────────────────────────────────────┘
```

---

# PART 5: HOW THINGS WORK (Step by Step)

## Example 1: Customer Searches for Nearby Vendors

```
STEP 1: Customer opens StreetBite app
        ↓
STEP 2: Browser asks "Can we access your location?"
        Customer clicks "Allow"
        ↓
STEP 3: Customer's GPS: 19.0760, 72.8777 (Mumbai)
        ↓
STEP 4: Frontend sends request:
        GET /api/vendors/search?lat=19.0760&lng=72.8777&radius=5000
        ↓
STEP 5: Backend receives request
        ↓
STEP 6: VendorSearchService:
        → Gets all active vendors from MySQL
        → Calculates distance for each vendor
        → Filters: Keep only within 5000 meters
        → Sorts: Nearest first
        ↓
STEP 7: Returns: [Raju's Stall (500m), Priya's Chaat (800m), ...]
        ↓
STEP 8: Frontend displays on map with markers 📍
```

---

## Example 2: Vendor Adds New Menu Item

```
STEP 1: Vendor clicks "Add New Item" button
        ↓
STEP 2: Fills form:
        - Name: "Samosa"
        - Price: ₹15
        - Category: "Snacks"
        - Description: "Crispy fried with spicy filling"
        - Photo: [uploads image]
        ↓
STEP 3: Clicks "Save"
        ↓
STEP 4: Frontend sends:
        POST /api/menu/123 (vendor ID)
        Body: {name, price, category, description, imageUrl}
        ↓
STEP 5: Backend validates the data
        ↓
STEP 6: MenuService creates new record in MySQL
        ↓
STEP 7: Returns success
        ↓
STEP 8: Menu shows new item instantly!
```

---

## Example 3: Customer Places Order

```
STEP 1: Customer adds items to cart:
        - 2x Vada Pav
        - 1x Cold Drink
        ↓
STEP 2: Clicks "Place Order"
        ↓
STEP 3: Frontend sends:
        POST /api/orders
        Body: {vendorId: 123, items: [...], userId: 456}
        ↓
STEP 4: OrderService creates order (status = PENDING)
        ↓
STEP 5: NotificationService sends push to vendor:
        🔔 "New Order! Rahul placed an order. Tap to view."
        ↓
STEP 6: Customer sees: "Order placed! Waiting for vendor..."
        ↓
STEP 7: Vendor's phone shows notification
        ↓
STEP 8: Vendor opens app, clicks "Accept"
        ↓
STEP 9: OrderService updates status to ACCEPTED
        ↓
STEP 10: NotificationService sends push to customer:
         🔔 "Order Accepted! Your order has been accepted."
        ↓
STEP 11: Customer sees status change in app!
```

---

## Example 4: Vendor Marks Item as Sold Out

```
STEP 1: Vendor toggles "Samosa" to Sold Out
        ↓
STEP 2: Frontend sends:
        PUT /api/menu/456 (item ID)
        Body: {isAvailable: false}
        ↓
STEP 3: MenuController receives request
        ↓
STEP 4: Updates MySQL: isAvailable = false
        ↓
STEP 5: RealTimeSyncService syncs to Firebase:
        → Collection: "live_menu_items"
        → Document: "456"
        → Data: {isAvailable: false, lastUpdated: now}
        ↓
STEP 6: Firebase pushes update to ALL connected clients
        ↓
STEP 7: ALL customers viewing that menu see "SOLD OUT"
        (without refreshing page!)
```

---

# PART 6: SECURITY (Keeping Things Safe)

## Password Protection

```
Your password: "ilovefood123"
        ↓
BCrypt scrambles it: "$2a$10$XYZ..." (60 random characters)
        ↓
Stored in database: Only the scrambled version
        ↓
Even if hacker steals database, they see:
"$2a$10$XYZ..." (useless to them!)
```

## JWT Tokens (Your Entry Pass)

```
After login, you get a token:
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyYWh1bEBnbWFpb...

This token contains:
- Your email
- Your user ID
- Your role (CUSTOMER/VENDOR/ADMIN)
- Expiry time (24 hours)

Every time you make a request:
Frontend adds: "Authorization: Bearer eyJhbGciOi..."
Backend checks token: Is it valid? Not expired?
If yes → Request processed
If no → Error 401 Unauthorized
```

## Protected Routes

| Who Can Access | Pages |
|----------------|-------|
| Everyone | Home, Explore, Vendor Details |
| Logged in users | Profile, Favorites, Orders |
| Vendors only | Vendor Dashboard, Menu Management |
| Admins only | Admin Dashboard, User Management |

---

# PART 7: API QUICK REFERENCE

## Authentication APIs
```
POST /api/auth/register     → Create account
POST /api/auth/login        → Login (get token)
POST /api/auth/forgot-password → Request reset email
POST /api/auth/reset-password  → Change password
```

## Vendor APIs
```
GET  /api/vendors/all       → All vendors
GET  /api/vendors/search    → Search nearby
GET  /api/vendors/123       → Single vendor details
POST /api/vendors/register  → Register as vendor
PUT  /api/vendors/123       → Update vendor profile
DELETE /api/vendors/123     → Delete vendor
```

## Menu APIs
```
GET  /api/menu/vendor/123   → Get vendor's menu
POST /api/menu/123          → Add menu item
PUT  /api/menu/456          → Update menu item
DELETE /api/menu/456        → Delete menu item
```

## Order APIs
```
POST /api/orders            → Create new order
GET  /api/orders/user/789   → My orders (customer)
GET  /api/orders/vendor/123 → My orders (vendor)
PUT  /api/orders/111/status → Update order status
```

## Review APIs
```
POST /api/reviews           → Write review
GET  /api/vendors/123/reviews → Get vendor's reviews
PUT  /api/reviews/222       → Update review
DELETE /api/reviews/222     → Delete review
```

## Analytics APIs
```
GET  /api/analytics/vendor/123 → Vendor's analytics
POST /api/analytics/event      → Log analytics event
```

## Gamification APIs
```
POST /api/gamification/xp           → Award XP
GET  /api/gamification/leaderboard  → Top 10 users
GET  /api/gamification/stats/789    → My stats
```

## Zodiac APIs
```
GET  /api/zodiac/Aries              → Today's horoscope
PUT  /api/zodiac/user/789           → Set my zodiac sign
POST /api/zodiac/complete-challenge → Complete food challenge
```

---

# Summary

**StreetBite is:**
- A street food discovery platform
- Connecting hungry customers with local vendors
- Built with modern technology (Next.js + Spring Boot)
- Using hybrid database (MySQL + Firebase)
- Secure (BCrypt passwords, JWT authentication)
- Real-time (instant updates via Firebase)
- Fun (gamification, zodiac predictions)

**16 Backend Services** each doing their specific job
**16 Frontend Pages** for different user experiences
**2 Databases** working together for reliability + speed

---

*Document created: December 9, 2025*
*Version: 1.0 - Simple Language Edition*
