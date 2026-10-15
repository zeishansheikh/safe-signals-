# Prompt Template: Implement New Feature

You are implementing a new feature for **SafeCity AI – Ambulance Green Corridor**.

## Context & Preparation Checklist
1. Read [brain/00-START-HERE.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/00-START-HERE.md) and [brain/changes/current-state.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/changes/current-state.md).
2. Check [brain/DESIGN.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/DESIGN.md) for required tokens (Solid colors only, zero gradients, system Helvetica stack, Lucide icons).
3. Check [brain/API_SPEC.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/API_SPEC.md) for data contracts.
4. Keep the work scoped to a single 30-minute task.

## Feature Instructions
- **Target Feature:** [Insert Feature Name & Scope]
- **Target Files:** [List files to create or modify in /components or /app]
- **Requirements:**
  - Strictly adhere to Design Tokens (zero ad-hoc hex values, zero purple glows).
  - Provide full responsive styling for mobile (360px) and desktop (1440px).
  - Include default, loading, empty, and error states.
  - Runtime validate all incoming payload data with Zod schemas.

## Post-Implementation Mandate
1. Create `/brain/changes/sessions/YYYY-MM-DD-NN-[feature-name].md`.
2. Append verified entry to `/brain/changes/changelog.md`.
3. Update `/brain/changes/current-state.md` and check off tasks in `/brain/BUILD_PLAN.md`.
4. Commit using Conventional Commits referencing the session file.
