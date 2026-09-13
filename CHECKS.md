# Art Taste Profiler Regression Checks

Run every numbered check before a phase checkpoint.

1. Open the page and confirm it loads with no browser console errors.
2. Open the site with `?diagnostics=1`, expand **Foundation state checks**, activate **Load sample collection**, and confirm three visible sample results appear. Confirm the controls are hidden without the query parameter.
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
13. Confirm eight directional answers ultimately lead to a result containing a cautious summary, strongest supported affinities, mixed/uncertain evidence, representative chosen and rejected works, and official links.
14. Complete one all-left pattern and one all-right pattern and confirm the visible summaries or supported affinities differ.
15. Complete all comparisons with **Neither / Unsure** and confirm the result says there is insufficient directional evidence rather than showing an error.
16. Activate **Start Over** and confirm the welcome screen returns, progress resets to comparison 1 on the next start, and no former answer or result remains.
17. Temporarily make a data path invalid in browser tooling or an isolated test copy and confirm a readable recovery state appears instead of a blank page or raw error.
18. Run `npm run validate` and confirm all catalog, role, image, embedding, concept-score, and initial-pair checks pass.
19. Run `npm test` and confirm every deterministic inference test passes.
20. Inspect browser network requests and confirm the production experience uses only same-origin static files: no museum API, model host, analytics, persistence, or runtime image-analysis request.
21. After the eighth opening comparison, confirm the refinement explanation appears before any follow-up and does not reveal a predicted choice.
22. Repeat one fixed response history and confirm the adaptive pair sequence is identical.
23. Complete all six refinements and confirm no unordered pair repeats, every work has role `quiz`, and no work exceeds three appearances while eligible alternatives exist.
24. Confirm **Finish Now** is absent before three adaptive answers, appears after the third, and the round stops automatically after the sixth.
25. Confirm the result displays one controlled profile name, its supporting attributes, an overall evidence label, and six labeled scorecard rows readable without color.
26. Confirm scorecard and affinity explanations identify supporting and contradicting recorded choices without displaying decimal certainty.
27. Confirm factual clues use only present source metadata, require repeated exposure, and remain neutral when metadata is absent.
28. Confirm **You May Also Like** contains no more than four works, every work has role `recommendation`, and every explanation cites a prepared visual signal, factual overlap, or embedding direction.
29. Activate **Test My Profile** and confirm each pair hides the saved prediction and artwork identity until after the visitor answers.
30. Confirm exactly six unique `holdout` works form exactly three challenge pairs and none appeared in the quiz or recommendations.
31. Confirm directional agreement, directional-trial, inconclusive, and unavailable counts are correct and the playful-check caveat is visible.
32. Confirm challenge answers do not alter the named profile, attribute scorecard, recommendation order, or frozen preference direction when returning to results.
33. Force one quiz image failure and confirm the pair is skipped and replaced with an eligible quiz pair; force one challenge image failure and confirm the trial is marked unavailable rather than replaced.
34. Emulate `prefers-reduced-motion: reduce` and confirm transitions are effectively removed while every state change remains understandable.
35. Restart from the result and challenge screens and confirm all initial, adaptive, recommendation, prediction, and challenge state is cleared.
36. Run the complete flow at the public Vercel URL and confirm it matches the validated local build.
37. At a 1440×900 viewport, confirm both artworks and **Neither / Unsure** are visible without scrolling.
38. On a reveal screen, activate **Change My Choice**, confirm the previous response is removed, and confirm choosing again does not duplicate the pair or progress count.
39. On a 375px viewport, activate **View left work larger**, confirm a modal image opens, Escape closes it, and **Choose This Work** records the selection.
40. Confirm each dynamic view focuses its heading without moving the page away from the top, and only the short status line uses `aria-live`.
41. Confirm **Test My Profile** and **Start Over** appear immediately below the result summary, while detailed score, factual, and representative evidence is available under **How this profile was calculated**.
42. Confirm the home wordmark returns to a clean welcome screen and the skip link becomes visible when focused.
43. At a 796×439 CSS viewport (or a 1592×878 Retina capture), confirm the hero tagline has normal letter and word spacing and never overlaps itself or the headline.
