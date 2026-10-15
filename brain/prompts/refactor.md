# Prompt Template: Safe Refactor

You are refactoring an existing module in **SafeCity AI – Ambulance Green Corridor**.

## Refactoring Constraints
1. **Behavioral Invariance:** Refactoring must NOT alter user-facing behavior, API contract shapes, or UI appearance.
2. Read [brain/ARCHITECTURE.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/ARCHITECTURE.md) and [brain/DESIGN.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/DESIGN.md).
3. Ensure strict TypeScript types (zero `any`).
4. Validate that all design tokens remain mapped to CSS variables (no raw hex codes introduced).

## Step-by-Step Execution
1. Isolate the target component or utility function.
2. Extract sub-components or reusable hooks into clean, single-responsibility files.
3. Test locally across all viewport widths.
4. Run `npm test` and `npm run lint` to guarantee clean compilation.

## Post-Refactor Logging
1. Document the change in `/brain/changes/sessions/YYYY-MM-DD-NN-refactor-[module].md`.
2. Append verified entry to `/brain/changes/changelog.md`.
3. Update `/brain/changes/current-state.md`.
