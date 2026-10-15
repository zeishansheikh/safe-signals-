# Prompt Template: Design-Token-Compliant UI Polish

You are polishing the user interface and interactions for **SafeCity AI – Ambulance Green Corridor**.

## Non-Negotiable Aesthetics Mandate
- **Solid Colors Only:** Never introduce gradients, backdrop blurs (glassmorphism), or glowing box-shadows.
- **Tokens Adherence:** Every color must reference variables defined in [brain/DESIGN.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/DESIGN.md):
  - `--bg`, `--surface`, `--surface-elevated`, `--border`, `--text-primary`, `--text-secondary`
  - `--accent` (`#2563eb`), `--success` (`#16a34a`), `--warning` (`#d97706`), `--danger` (`#dc2626`)
- **Depth:** Use only `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`.
- **System Typography:** Use system Helvetica stack with tabular numbers for timestamps and speed counters.

## Polish Checklist
1. **Interactive States:** Check hover, active, focus-visible, and disabled states for all buttons.
2. **Tabular Numerics:** Add `font-variant-numeric: tabular-nums;` to countdown clocks and ETA values to prevent visual jitter.
3. **Mobile Audit:** Resize browser to 360px and verify hamburger menu drawer behavior, button tap targets (>= 44x44px), and horizontal scrolling prevention.
4. **Contrast Verification:** Test text against dark backgrounds using WCAG AA 4.5:1 ratio.

## Post-Polish Logging
1. Record polished components in `/brain/changes/sessions/YYYY-MM-DD-NN-ui-polish.md`.
2. Append verified entry to `/brain/changes/changelog.md`.
3. Update `/brain/changes/current-state.md`.
