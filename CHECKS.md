# Art Taste Profiler Regression Checks

Run every numbered check before a phase checkpoint.

1. Open the page and confirm it loads with no browser console errors.
2. Expand **Foundation state checks**, activate **Load sample collection**, and confirm three visible sample results appear.
3. Activate **Preview empty state** and confirm the empty-state message appears.
4. Activate **Preview error state** and confirm a readable sentence appears without a stack trace or raw response.
5. Activate any preview control and confirm the busy state appears, all controls disable, and controls re-enable when loading finishes.
6. At a 375px viewport width, confirm text, controls, images, and results fit without horizontal scrolling.
7. Navigate every action using Tab and activate each with the keyboard; confirm focus is always visible.
8. Inspect Git-tracked files and confirm no secret, token, model cache, model weight, temporary response, rejected candidate, or environment file is present.
9. Open the public Vercel URL in another browser context and confirm it shows the same working version.
10. From the welcome view, activate **Discover My Taste** and confirm comparison 1 of 8 shows two local images without artwork identities.
11. Complete all eight comparisons with mouse or touch. Confirm each answer reveals title, artist/maker, date, institution, and an official source link before continuing.
12. Repeat the flow with the Left Arrow, Right Arrow, and N keys; confirm N records **Neither / Unsure** and never forces a directional preference.
13. Confirm eight directional answers lead to a result containing a cautious summary, strongest supported affinities, mixed/uncertain evidence, representative chosen and rejected works, and official links.
14. Complete one all-left pattern and one all-right pattern and confirm the visible summaries or supported affinities differ.
15. Complete all eight comparisons with **Neither / Unsure** and confirm the result says there is insufficient directional evidence rather than showing an error.
16. Activate **Start Over** and confirm the welcome screen returns, progress resets to comparison 1 on the next start, and no former answer or result remains.
17. Temporarily make a data path invalid in browser tooling or an isolated test copy and confirm a readable recovery state appears instead of a blank page or raw error.
18. Run `npm run validate` and confirm all catalog, role, image, embedding, concept-score, and initial-pair checks pass.
19. Run `npm test` and confirm every deterministic vector, neutrality, answer-pattern, and restart test passes.
20. Inspect browser network requests and confirm the production experience uses only same-origin static files: no museum API, model host, analytics, persistence, or runtime image-analysis request.
