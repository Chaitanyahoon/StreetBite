# Implementation Plan: Admin Dashboard Responsive Bento Overhaul

Overhaul the Admin Dashboard (`/admin`) to transition from a generic flat layout to a premium neobrutalist bento design. The layout will be highly responsive on mobile viewports, group statistics KPIs into a compact 2x2 grid, merge the Line and Bar charts into a single toggleable chart block, and apply neobrutalist styling to lists and form components.

## Project Type
WEB

## Success Criteria
- **Neobrutalist Theme**: Use thick borders (`border-3 border-black`), sharp corners, solid background fills (`bg-[#fffaf4]`, `bg-yellow-300`, `bg-orange-300`, `bg-emerald-300`, `bg-sky-200`), and hard drop shadows (`shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]` on mobile, `shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]` on desktop).
- **Stacked Bento Layout (Mobile)**:
  - KPIs grid wraps into a compact `grid-cols-2 lg:grid-cols-4` grid (a 2x2 layout on mobile screens).
  - Paddinings and text sizes are condensed responsively (e.g. `p-4 sm:p-5`, title text `text-2xl sm:text-4xl font-black uppercase tracking-tight`).
  - Pending approvals, recent vendors list, and announcement list compile into space-efficient vertical widgets.
- **Single Toggleable Chart Block**:
  - Merge the "Platform Activity" (LineChart) and "Growth Metrics" (BarChart) widgets into a single unified card block.
  - Add tab buttons inside the chart header (e.g., "Line Chart" vs "Bar Chart") allowing admins to toggle views, saving significant screen real estate on mobile viewports.
- **Form Controls & Modals**:
  - Update the "Announcement Center" text input area and post/delete buttons to match the neobrutalist style.
- **Verification**: Zero TypeScript type errors (`npx tsc --noEmit`), successful next.js builds (`npm run build`), and clean checklist validations.

## Tech Stack
Next.js 16+, Tailwind CSS v4, Lucide Icons, Recharts, React state hooks, and API services (`analyticsApi`, `vendorApi`, `announcementApi`).

## File Structure
- [MODIFY] `frontend/app/admin/page.tsx` (Complete overhaul of layout, styling, and charts merging)

---

## Task Breakdown

### Task 1: Overhaul admin/page.tsx to Neobrutalist Bento Grid & Merge Charts
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`, `react-best-practices`
- **Description**: Rewrite `admin/page.tsx` with a neobrutalist theme. Set up a local state hook (e.g., `const [chartType, setChartType] = useState<'line' | 'bar'>('line')`) to allow toggling between Line and Bar charts inside the single chart container. Update metrics cards, pending approvals alerts, recent vendors list, and announcement form/list components.
- **INPUT**:
  - Existing `frontend/app/admin/page.tsx` file.
  - Platform analytics, vendors list, and announcements api endpoints.
- **OUTPUT**:
  - A clean, responsive dashboard page matching the neobrutalist design specs, with a 2x2 mobile KPI bento layout, a unified toggleable chart widget, and compact listings.
- **VERIFY**: Verify type checks using `npx tsc --noEmit` and confirm compilation.

---

## Phase X: Verification

- [x] Run typechecks with `npx tsc --noEmit` inside `/frontend`
- [x] Run production compiler `npm run build` inside `/frontend`
- [x] Run automated master checklist check `python .agent/scripts/checklist.py .` from root
- [x] Run local development preview server to test dashboard toggling responsiveness.

### Rule Compliance (Manual Check)
- [x] No purple/violet hex codes used
- [x] No standard template layouts used
- [x] Socratic Gate was respected

## ✅ PHASE X COMPLETE
- Lint: [x]
- Security: [x]
- Build: [x]
- Date: 2026-05-25
