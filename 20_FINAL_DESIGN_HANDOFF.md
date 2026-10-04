# 20 FINAL DESIGN HANDOFF

STATUS: BUILT + VERIFIED 2026-10-04 — describes the actual system, not an aspiration
DATE: 2026-10-04

## EXPERIENCE PROMISE
Every order feels like a tiny food story: discover it, assemble it, send it, and watch it arrive.

## CREATIVE CONCEPT
**The Living Kitchen** — a 2D illustrated kitchen that re-composes around user intent; the order is the protagonist.

## VISUAL WORLD
Hand-drawn editorial food illustration; quiet paper environment; charcoal ink outlines; bold controlled food accents; physical object containers.

## COLOUR SYSTEM
Parchment `#F7F0DE`; Charcoal `#1E1D1A`; Brick `#D94F35`; Mustard `#E8B83A`; Herb `#2F6B4F`; Cobalt `#3156C9`; Paper White `#FFFDF7`.

## TYPOGRAPHY
System serif display stack (Iowan Old Style → Palatino → Georgia) + system sans body +
system mono labels. No webfonts: inventory verified, zero font payload, zero licenses.

## ILLUSTRATION
Flat 2D vector, controlled hand-drawn imperfection, modular layers, food-first silhouettes, flat shadows, no glossy 3D.

## MOTION
Tactile/editorial; UI crisp, food objects elastic. Micro 90–160ms; object 240–500ms; hero 1200–1800ms. Every meaningful animation has a purpose.

## INTERACTION METAPHORS
Press/stamp; place on tray; pack/fold; seal/print; ticket/journey; arrival/settle.

## NAVIGATION
Stable semantic navigation + environmental movement; spatial metaphor augments rather than replaces standard navigation.

## PAGE STRUCTURE
Home/discovery → search → restaurant/menu → cart → checkout → order/tracking → past orders/reorder.

## COMPONENT SYSTEM (as built — see 18 for anchors)
WorldShell, DiscoveryField, RestaurantCounter (+ hero tableau + sections), FoodObject
(+ 7 sprite-composed dishes), MenuItem (+ modifiers + variant steppers), QuantityControl
(44px, per-variant), OrderTray (6 named states + variant editing + repack), CheckoutStation
(+ delivery/pickup + adaptive validation), OrderTicket (+ print-in + exception + ETA),
JourneyLine (SVG + traveling pack + semantic OL), DrawerSurface (quick-tray wired),
MotionGate (JS + CSS). All implemented; nothing stubbed.

## ASSET SYSTEM
`assets/kitchen.svg`: 18 symbols — plates/bowls/trays, box/bag packaging, ticket,
journey-mark, 5 ingredients, ladle/spatula/jar, steam-wisp, ink-star, counter-sign.
No icon font/set (controls are text + stamped shapes by design); no raster; no 3D.

## RESPONSIVE
Desktop = full composition; tablet = reduced overlap; mobile = stacked spatial zones. Essential content never depends on hover or drag.

## ACCESSIBILITY
Keyboard-complete; visible focus; semantic text; non-color state cues; reduced motion via `prefers-reduced-motion`.

## PERFORMANCE
Measured 2026-10-04: 112.8KB raw / 34.5KB gzip all files; DOM ≤346; 0ms long tasks;
CLS 0; single upfront payload (nothing lazy-loaded because nothing is heavy enough
to need it); no WebGL/video/particles; transform/opacity only.

## HOW IT MOVES (timings as built)
`snap` 150ms (buttons/stations) · `settle` 340ms (dish/toast/drawer-backdrop) ·
`assemble` 600ms (journey glide) · `reveal` 650ms (routes/drawer) · hero first flight
1527ms, repeats 427ms (WAAPI, measured) · steam 3.4s + node pulse 2.4s (only loops).
Easing: UI `ease-out` everywhere; food `settle` overshoot. Reduced motion collapses
all of it to static state changes with zero meaning lost.

## HERO
Order Assembly Choreography, live in `js/hero.js`: dish → tray → meal → package →
ticket → packed order. Immediate toast + count, non-blocking flight, tray stamp on
landing, interrupt-safe, full contract in 18.

## HOW TO INTERACT + RUN
Mouse, touch, and keyboard reach every state (51/51 keyboard pass; drag/sound/hover
never required). Run: `python -m http.server` in the repo root → open
`http://localhost:<port>/index.html`. `design-system.html` previews tokens/primitives
for developers. No install, no build step, no backend (data is local + hardcoded).

## IMPLEMENTATION PRIORITIES
1. Repo-safe foundation — DONE (tokens/primitives/app split, `design-system.html` preview).
2. WorldShell and asset primitives — DONE (stage pantry-wall scene + 18-symbol
`assets/kitchen.svg`; world browser pass 17/17: centering, overflow, layering, SVG,
responsive 390px, motion stability, reduced-motion collapse).
3. Semantic product flow — DONE (7 hash routes, browser-verified).
   Discovery experience — DONE 2026-10-04: sprite-composed dish art on every card/row,
   search states (idle/focus-quiet/debounced-loading/results/count/empty/error-retry),
   price sort, station reframe, one-shot restaurant entry, add success physics + tray bump,
   hero shortcut action, route-change scroll discipline. Discovery pass 30/30, zero errors.
4. Cart/checkout — DONE 2026-10-04: all six cart states live with visible markers,
   variant editing with line moves, repack settle, quick-tray drawer wired to product,
   delivery/pickup fulfillment with adaptive validation, full path verified end to end.
   Transaction pass 34/34 (states, drawer, fees, recovery, mobile confirm), zero errors.
   Restaurant/menu world — DONE 2026-10-04: counter hero tableau + identity/ETA/cuisine,
   menu sections, plated rows, required/optional modifiers with gated Add + remembered
   choices, per-variant steppers, unknown-counter error, 44px touch targets.
   Restaurant pass 25/25 (keyboard, touch, modifiers, qty, overflow, responsive), zero errors.
5. Hero choreography — DONE 2026-10-04 (`js/hero.js`): staged assembly anchored to the
   source dish, true first-flight 1527ms / repeats 427ms, interrupt-safe, RM fallback
   meaning-preserving. Hero pass 24/24, zero errors.
6. Tracking journey — DONE 2026-10-04: visual journey line with traveling pack marker,
   per-status ETAs, exception with support/recovery, one-shot print-in continuity from
   the sealed pack. Tracking pass 43/43, zero errors.
7. Responsive/reduced-motion — DONE 2026-10-04: tiered recomposition (desktop/tablet/
   mobile/touch), fluid SVG art, no-wrap prices, 44px targets, flights in-budget at
   360/768. Responsive pass ALL-PASS (6 viewports × 7 routes + keyboard).
8. Accessibility — DONE 2026-10-04: route focus management + focus keeper, alert roles,
   error focus, truthful expanded state; keyboard-only full purchase + RM flow verified.
   Accessibility pass 51/51, zero errors.
9. Performance — DONE 2026-10-04 as measured (no guesswork): 112.8KB raw / 34.5KB gzip
   all files, DOM ≤346, 0ms long tasks, CLS 0. Zero-build stack stands on evidence.
10. QA + polish — DONE 2026-10-04: brutal end-to-end pass (1 HIGH + 2 MEDIUM fixed and
    verified), intentionality sweep (sprite brand mark, dev-voice copy removed).
11. Optional audio — OPEN (off by default per 09).

## KNOWN RISKS (updated 2026-10-04)
Spatial composition may slow comparison (standing watchpoint; shortcut + density cover
it); no committed test/lint harness yet (14 Playwright suites live in Temp, uncommitted);
no backend (demo milestones/exception honestly labeled); audio never started (optional).

## NON-NEGOTIABLES
No generic clone aesthetic; no random decoration; motion is UX; food is hero; function survives art direction; accessibility/performance are first-class; one world across all stages.

## REJECTED DIRECTIONS
Glassmorphism, generic gradients, generic 3D food, mascot-led UI, gesture-only navigation, permanent particle effects, arbitrary motion.

## HANDOFF STATE
Creative system: **READY**.
Implementation: **COMPLETE except explicitly OPEN items below** (audio, backend, harness —
all standalone, none load-bearing for the shipped experience).
Repo-specific technical mapping: **LOCKED** (zero-build static; anchors in 18; facts in 01).
Rendered browser QA: **PASS 2026-10-04** — foundation 22/22, discovery 31/31, restaurant
25/25, transaction 34/34, hero 24/24, tracking 43/43, motion 10/10, responsive 6×7,
accessibility 51/51, full QA with measured performance (34.5KB gzip, 0ms long tasks,
CLS 0). Zero console errors in every pass. Screenshots reviewed at every milestone.
Journey motion: **DONE** — pack travels its map; exception handled with recovery.
Hero choreography: **DONE** — functional state ballet, immediate confirmation, non-blocking
flight, meaning-preserving RM fallback (contract in 18).

## NEXT PHASE
Commit the validation harness (`Temp/opencode/*.py` → repo `tests/`), then declare the
build complete per the completion contract. Optional audio remains a standalone decision.
