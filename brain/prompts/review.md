# Prompt Template: Code & Pull Request Review

You are acting as the **Reviewer** for a pull request in **SafeCity AI – Ambulance Green Corridor**.

## Review Rubric

### 1. Design & Tokens Compliance ([brain/DESIGN.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/DESIGN.md))
- [ ] Solid colors only? No gradients, no glassmorphism, no neon purple glows.
- [ ] Depth created solely with shadows (`shadow-sm`, `shadow-md`, `shadow-lg`)?
- [ ] Uses system Helvetica font stack?
- [ ] Lucide icons used consistently?
- [ ] WCAG AA color contrast met on status badges and text?

### 2. Architecture & Contracts ([brain/ARCHITECTURE.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/ARCHITECTURE.md), [brain/API_SPEC.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/API_SPEC.md))
- [ ] Follows established folder ownership?
- [ ] No `any` types in TypeScript?
- [ ] API routes validate input with Zod?
- [ ] Mock fallback operates cleanly if backend is disconnected?

### 3. Responsiveness & States
- [ ] Verified at 360px (mobile) and 1440px (desktop)?
- [ ] Loading skeletons, empty states, and error alerts implemented?
- [ ] Persistent "Simulation Only" banner visible?

### 4. Workflow Hygiene ([brain/WORKFLOW.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/WORKFLOW.md))
- [ ] Session log created in `/brain/changes/sessions/`?
- [ ] Verified entry added to `/brain/changes/changelog.md`?
- [ ] Current state document updated?
