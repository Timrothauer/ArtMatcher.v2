# Art Taste Profiler Regression Checks

Run every numbered check before a phase checkpoint. Phase 0 should take less than three minutes to check manually.

1. Open the page and confirm it loads with no browser console errors.
2. Activate **Load sample collection** and confirm three visible sample results appear.
3. Activate **Preview empty state** and confirm the empty-state message appears.
4. Activate **Preview error state** and confirm a readable sentence appears without a stack trace or raw response.
5. Activate any preview control and confirm the busy state appears, all controls disable, and controls re-enable when loading finishes.
6. At a 375px viewport width, confirm text, controls, and results fit without horizontal scrolling.
7. Navigate every action using Tab and activate each with the keyboard; confirm focus is always visible.
8. Inspect Git-tracked files and confirm no secret, token, model cache, or environment file is present.
9. Open the public Vercel URL in another browser context and confirm it shows the same working version.
