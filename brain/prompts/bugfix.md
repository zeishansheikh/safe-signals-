# Prompt Template: Debug & Bugfix

You are investigating and fixing a bug in **SafeCity AI – Ambulance Green Corridor**.

## Diagnostic Protocol
1. Read [brain/changes/current-state.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/changes/current-state.md) to understand current verified system behavior.
2. Reproduce the bug locally with exact inputs and viewport dimensions.
3. Identify root cause at boundary (e.g. malformed JSON, state desynchronization, unhandled undefined, or missing CSS variable).

## Bugfix Rules
- Do NOT introduce new npm packages or external dependencies.
- Preserve existing comments and docstrings.
- Ensure the fix adheres to [brain/DESIGN.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/DESIGN.md) and [brain/API_SPEC.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/API_SPEC.md).
- Verify responsiveness at 360px and 1440px.

## Post-Fix Logging Mandate
1. Create `/brain/changes/sessions/YYYY-MM-DD-NN-fix-[short-title].md` documenting root cause, solution, and files touched.
2. Append verified entry to `/brain/changes/changelog.md`.
3. Update `/brain/changes/current-state.md`.
