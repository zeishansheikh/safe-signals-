# Prompt Template: Failed Deployment Triage & Recovery

You are debugging a failed deployment or build error in **SafeCity AI – Ambulance Green Corridor**.

## Immediate Triage Protocol
1. **Check Build Logs:** Inspect Vercel or CI deployment log output for the exact line error.
2. **Common Failure Modes:**
   - Missing environment variables in Vercel project settings (compare with [brain/ENV.md](file:///c:/Users/ATECH/Desktop/Hachathon/brain/ENV.md)).
   - TypeScript build failure due to strict mode or unhandled `null`/`undefined`.
   - Node version mismatch (assert Node.js 18.x or 20.x).
   - Dynamic server usage during static pre-rendering (wrap client-only modules like Leaflet in `dynamic(() => import(...), { ssr: false })`).
3. **Local Reproduction:**
   Run `npm run build` locally in terminal to reproduce the exact error.

## Rollback Command
If the failure is unresolved within 5 minutes, immediately promote the last known green production deployment in the Vercel Dashboard to keep the demo live.

## Logging Mandate
Document root cause and fix in `/brain/changes/sessions/YYYY-MM-DD-NN-deploy-fix.md`.
