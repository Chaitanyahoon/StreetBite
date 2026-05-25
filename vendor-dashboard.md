# Implementation Plan: Vendor Dashboard Responsive Overhaul

Overhaul the Vendor Dashboard (`/vendor`) to transition from a generic, oversized container design to a beautiful, premium neobrutalist bento layout. The interface will scale down cleanly for mobile viewports, stack statistics cards in a compact 2x2 grid, prune away unnecessary getting-started tips, and integrate a live stall status toggle.

## Project Type
WEB

## Success Criteria
- **Neobrutalist Styling**: Use thick borders (`border-3 border-black`), sharp corners, solid background accents (`bg-yellow-300`, `bg-orange-300`, `bg-sky-200`, `bg-emerald-300`), and responsive hard drop shadows (`shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]` on mobile, `shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]` on desktop).
- **Responsive Layout Constraints**: 
  - Welcome block uses responsive padding (`p-4 sm:p-6`) and heading sizes.
  - Analytics statistics wrap into a tight `grid-cols-2 lg:grid-cols-4` format, ensuring a 2x2 bento layout on mobile screens to save vertical scroll space.
  - Slashes inner elements sizes (icons downscale from `w-6 h-6` to `w-5 h-5`, text labels use `text-xs sm:text-sm`).
- **Interactive Stall Status Toggle**: 
  - Embed the vendor's current status display directly in the dashboard header.
  - Provide a drop-down or toggle buttons allowing vendors to set their status (AVAILABLE, BUSY, UNAVAILABLE) in real-time, calling `vendorApi.updateStatus()` instantly.
- **Useful Features Only**:
  - Keep analytics KPIs: Profile Views, Direction Clicks, Menu Clicks/Interactions, Rating & Reviews.
  - Keep most-viewed dishes list in a compact neobrutalist card block.
  - Remove verbose boilerplate getting-started tips cards to maximize utility.
- **Verification**: Clean compile check, Next.js build check, and automated checklist validation run.

## Tech Stack
Next.js 16+, Tailwind CSS v4, Lucide Icons, React hooks, and API services (`analyticsApi`, `vendorApi`).

## File Structure
- [MODIFY] `frontend/app/vendor/page.tsx` (Complete overhaul of dashboard metrics UI and integration of status state management controls)

---

## Task Breakdown

### Task 1: Overhaul vendor/page.tsx to Neobrutalist Bento Dashboard
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`, `react-best-practices`
- **Description**: Rebuild the main dashboard page at `vendor/page.tsx` to follow a premium neobrutalist bento layout. Set up the local state controls for vendor details and status updates.
- **INPUT**:
  - Existing `frontend/app/vendor/page.tsx` file.
  - `vendorApi.getById()`, `vendorApi.updateStatus()` endpoints for fetching details and setting availability status.
  - `analyticsApi.getVendorAnalytics()` for fetching views/clicks count.
- **OUTPUT**:
  - An updated, fully responsive dashboard page containing:
    - Welcome header with interactive, drop-down select controls to set stall status (AVAILABLE, BUSY, UNAVAILABLE).
    - Compact 2x2 grid for metrics.
    - Quick-action buttons (Menu, Promotions, Settings).
    - Most Viewed Items in a styled neobrutalist listing.
- **VERIFY**: Run `npx tsc --noEmit` to verify type safety and `npm run build` to confirm compilation.

---

## Phase X: Verification

- [x] Run typechecks with `npx tsc --noEmit` inside `/frontend`
- [x] Run production compiler `npm run build` inside `/frontend`
- [x] Run automated master checklist check `python .agent/scripts/checklist.py .` from root
- [x] Run local development preview server to test layout interaction responsiveness.

### Rule Compliance (Manual Check)
- [x] No purple/violet hex codes used
- [x] No standard template layouts used
- [x] Socratic Gate was respected

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-05-25
