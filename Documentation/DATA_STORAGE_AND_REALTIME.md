# Data Storage And Realtime

## Source Of Truth

StreetBite uses **MySQL** as the primary database.

This means the following business data lives in MySQL and should be treated as authoritative:

- users
- vendors
- menu items
- promotions
- reviews
- favorites
- reports
- analytics events
- device tokens

Those records are accessed in the backend through Spring Data JPA repositories under `backend/src/main/java/com/streetbite/repository`.

## What Firebase Is Used For

Firebase is **not** the primary database in the current app.

It is only used for two categories of behavior:

1. Realtime mirrors for UI updates
2. Push notifications via Firebase Cloud Messaging

### Firestore Collections

The frontend reads only these realtime collections:

- `live_vendors`
  - vendor status
  - vendor live location
- `live_menu_items`
  - menu item availability

These collections are mirrors of MySQL-backed entities. If Firestore is unavailable, the API still works and MySQL remains correct.

## Backend Write Flow

### Menu items

- MySQL write happens in `MenuService`
- after save/delete, `RealTimeSyncService` mirrors availability into `live_menu_items`

### Vendors

- MySQL write happens in `VendorService`
- after save/delete, `RealTimeSyncService` mirrors status and location into `live_vendors`

## Frontend Read Flow

### Normal data

The frontend gets vendor, menu, promotion, review, auth, and user data from the backend REST API in `frontend/lib/api.ts`.

### Realtime overlays

The frontend reads Firebase only for live overlays:

- `useLiveVendorStatus`
- `useLiveVendorLocation`
- `useLiveMenuItem`
- `useLiveMenuAvailability`
- `useNotifications`

Those hooks now import from `frontend/lib/realtime.ts`, which exists to make the boundary explicit.

## Practical Rule

When you are debugging data:

- if the problem is core app data, check **MySQL / backend service / JPA repository**
- if the problem is live status, live availability, live location, or push, check **Firebase**

## Current Intent

The intended architecture is:

- **MySQL** = persistence and business truth
- **Firebase Firestore** = best-effort realtime mirror
- **Firebase Messaging** = web push delivery

If Firebase fails, the app should degrade to normal API behavior rather than lose core data.
