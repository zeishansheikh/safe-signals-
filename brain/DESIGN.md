# Design System & Tokens — SafeCity AI

> **Aesthetic Philosophy:** Industrial Emergency Operations Center. Solid colors only. **NO gradients, NO "AI-glow" purple palettes, NO glassmorphism.** Depth is created purely through 4 distinct shadow levels and crisp borders.

---

## 1. Color Palette Tokens (Hex Scales)

| Token | 50 (Lightest) | 100 | 500 (Base) | 700 | 900 (Deepest) | Purpose |
|---|---|---|---|---|---|---|
| **Background / Neutral** | `#ffffff` | `#f9fafb` | `#111827` | `#0f172a` | `#0b0f17` | Canvas background and surfaces |
| **Border** | `#f3f4f6` | `#e5e7eb` | `#4b5563` | `#374151` | `#1f2937` | Dividers and container frames |
| **Text Primary** | `#0b0f17` | `#111827` | `#f9fafb` | `#ffffff` | `#ffffff` | High contrast labels & readings |
| **Text Secondary** | `#4b5563` | `#6b7280` | `#9ca3af` | `#d1d5db` | `#e5e7eb` | Captions, units, and timestamps |
| **Accent (Blue)** | `#eff6ff` | `#dbeafe` | `#2563eb` | `#1d4ed8` | `#1e3a8a` | Interactive primary actions only |
| **Success (Green)** | `#f0fdf4` | `#dcfce7` | `#16a34a` | `#15803d` | `#064e3b` | Green signals, normal status |
| **Warning (Amber)** | `#fffbeb` | `#fef3c7` | `#d97706` | `#b45309` | `#78350f` | Amber caution, delay advisory |
| **Danger (Red)** | `#fef2f2` | `#fee2e2` | `#dc2626` | `#b91c1c` | `#7f1d1d` | Ambulance detection, emergency |

*Semantic Rule:* Red, green, and amber are reserved strictly for emergency, clearance, and advisory meanings—never decorative flourish.

---

## 2. Depth & Shadows (No Glows)
- `shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.4)`
- `shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.5)`
- `shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.6)`
- `shadow-xl`: `0 20px 25px -5px rgba(0, 0, 0, 0.7)`

---

## 3. Typography & Rationale
- **Primary Typography Stack:** `var(--font-geist-sans), "Neue Haas Grotesk Text Pro", "Neue Haas Unica Pro", "Helvetica Neue", Helvetica, Arial, sans-serif`
- **Why Geist Sans + Neue Haas Grotesk:**
  - **Swiss Neo-Grotesque Aesthetic:** Modeled directly after Neue Haas Grotesk and Univers, delivering authoritative, high-density municipal emergency aesthetics.
  - **Tabular Numerics (`tnum`):** Native `font-variant-numeric: tabular-nums` locks countdown timers (`42s → 41s`) and speed readouts without numeric jitter.
  - **Zero CLS & 0ms Latency:** Embedded via Next.js 14 (`geist/font/sans`) with zero layout shift, maximizing Lighthouse performance (≥ 95).
  - **Zero Licensing Hurdles:** 100% open-source for hackathon evaluation and production edge hosting.
- **Type Scale:**
  - Micro / Meta: `11px` (Line-height: 14px, Weight: 600/700, Uppercase)
  - Caption / Small: `12px` (Line-height: 16px, Weight: 500)
  - Body / Standard: `13px` / `14px` (Line-height: 20px, Weight: 400/500)
  - Card Title: `15px` (Line-height: 22px, Weight: 700)
  - Section Header: `18px` (Line-height: 24px, Weight: 700)
  - Metric Big Display: `22px` – `28px` (Line-height: 32px, Weight: 700, Monospace / tabular numbers)

---

## 4. Spacing, Radii & Layout Grid
- **4px Spacing Scale:** `4px` (1), `8px` (2), `12px` (3), `16px` (4), `24px` (6), `32px` (8).
- **Radius Scale:** `sm` (4px), `md` (8px), `lg` (12px), `full` (9999px).
- **Breakpoints:**
  - Compact Mobile: `< 640px` (single column vertical stack)
  - Tablet / Collapsible: `< 1100px` (sidebar transforms to off-canvas drawer)
- **Iconography & Strict No-Emoji Mandate:** Strictly **Lucide React SVG icons** (`stroke-width="2"`, monochrome vectors). **NEVER use emojis anywhere** for logos, map markers, alert indicators, navigation, or status badges. All map markers and UI badges must be clean geometric SVG vector shapes.

## 5. Component Interaction States Matrix

| Component | Default | Hover | Focus-Visible | Disabled | Loading |
|---|---|---|---|---|---|
| **Primary Button** | Accent-500 fill, white text | Accent-700 fill | 2px solid Focus ring (2px offset) | Opacity 50%, not-allowed | Spinner replaces icon, label dimmed |
| **Secondary Button**| Surface fill, Border-500 | Border-Accent | 2px solid Focus ring | Opacity 50%, not-allowed | Spinner replaces icon |
| **Danger Button** | Danger-500 fill, white text | Danger-700 fill | 2px solid Danger ring | Opacity 50%, not-allowed | Spinner replaces icon |
| **Input / Field** | Surface fill, Border-500 | Border-700 | 2px solid Accent-500 | Surface-elevated, text-muted | Skeleton pulse line |
| **Card / Panel** | Surface fill, Border-700 | Neutral | None | N/A | Gray-800 Skeleton block |

---

## 6. CSS Tokens & Tailwind Snippet

```css
/* In styles/globals.css */
:root {
  --bg: #0b0f17;
  --surface: #111827;
  --surface-elevated: #1f2937;
  --border: #374151;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --accent: #2563eb;
  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;
}
```

```js
// In tailwind.config.ts snippet
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        border: 'var(--border)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        accent: 'var(--accent)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        sans: [
          'var(--font-geist-sans)',
          '"Neue Haas Grotesk Text Pro"',
          '"Neue Haas Unica Pro"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
};
```
