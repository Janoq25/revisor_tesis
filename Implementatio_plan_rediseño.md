# Futuristic Holographic UI Redesign

This plan details the steps to completely overhaul the UI of the "Tesis AI" application, transforming it into a futuristic, holographic, and neon-themed interface based on the user's detailed specifications.

## User Review Required
> [!IMPORTANT]
> Please review this plan to ensure it covers all the requested changes. The design requires a dark theme by default, and I will be removing the existing light mode CSS to enforce this deep black/neon aesthetic. Let me know if you want to keep a toggle, or just enforce dark mode.
> The fonts `Playfair Display`, `Cormorant Garamond`, and `Inconsolata` will be added from Google Fonts.

## Proposed Changes

### 1. Global Styles and Layout
#### [MODIFY] `src/app/globals.css`
- Change root variables to use `#080808` background.
- Define `--cyan-neon`, `--blue-deep`, `--blue-muted`, etc.
- Add glowing effects (`box-shadow`, `text-shadow`) to cards and titles.
- Add holographic grid background (via CSS radial gradients or grid background image/pattern).
- Update card and button styles to have neon borders and cyan accents.

#### [MODIFY] `src/app/layout.tsx`
- Import Google Fonts: `Playfair_Display`, `Cormorant_Garamond`, and `Inconsolata`.
- Add font variables to the HTML body.
- Enforce the new dark theme on the body.

### 2. Sidebar Component
#### [MODIFY] `src/components/ui/Sidebar.tsx`
- Update background to deep black.
- Apply new typography and glowing gradients to the "Tesis AI" logo area.
- Add the stylized book icon with gradient.
- Update navigation links to feature cyan icons and glowing active states.
- Add User Avatar 'N' section at the bottom.

### 3. Upload Space & Main Dashboard Pages
#### [MODIFY] `src/app/page.tsx` (Upload Space)
- Update title to "Upload Space" with cyan-blue gradient and `Playfair Display`.
- Change subtitle to use `Cormorant Garamond` and muted blue.
- Update "Esquema de Evaluación Activo" section to match the 3 detailed cards layout requested (Problem Tree, APA 7, Estructura).

#### [MODIFY] `src/app/dashboard/DashboardClient.tsx`
- Redesign the "Dashboard Visión" section with 4 KPI cards (neon borders, Playfair numbers).
- Redesign the "Estado de Revisiones" section (Donut chart with Cyan/Deep Blue).
- Redesign the "Frecuencia de Observaciones" section (Bar chart with Cyan bars, Inconsolata axes).
- Redesign the "Reportes de Revisión Recientes" table/list with neon styles and the detailed report panel ("Detalle del Último Reporte").

#### [MODIFY] `src/components/ui/FileUploader.tsx` (and `QueueTable.tsx`)
- Update file uploader to match the "Holographic neural brain" request with cyan progress indicators and Inconsolata text.

## Verification Plan
### Manual Verification
- The user will test the interface in the browser via `npm run dev` to verify the holographic styling, neon glows, typography, and layout match the requested aesthetics.
