# 18 FRONTEND BUILD SPEC

STATUS: LOCKED — FULL BUILD 2026-10-04
DATE: 2026-10-04

## PURPOSE
Translate the creative system into a coding-agent handoff without inventing the current stack.

## STACK (verified 2026-10-04)
Zero-build static: `index.html` + `css/tokens.css` + `css/primitives.css` + `css/app.css` + `js/primitives.js` + `js/hero.js` + `js/app.js`.
No package manager, no framework, no installed animation library.
Run: `python -m http.server` in repo root → `http://localhost:<port>/index.html`.
Animation ownership now: (1) CSS transitions/keyframes for states, (2) inline-SVG
transforms for food objects, (3) MotionGate via `matchMedia('(prefers-reduced-motion: reduce)')`
+ `@media (prefers-reduced-motion: reduce)` kill-switch, (4) WAAPI in `js/hero.js` for the
assembly choreography (10) — no library needed.

## COMPONENT MAP — ACTUAL CODE ANCHORS (verified 2026-10-04)
| Spec name | Implementation | File |
|---|---|---|
| `WorldShell` | `.world-shell` + `.kitchen-stage` | `index.html` |
| `DiscoveryField` | `#route-home` + `#stations` + `renderCounters()` + hero `#route-home` shortcut + `body.is-searching` quiet + `.enter` reframe | `index.html` / `js/app.js` / `css/app.css` |
| `RestaurantCounter` | `restaurantCard()` + `#route-restaurant` + `renderRestaurant()` | `js/app.js` |
| `FoodObject` | `.food-object` SVG, 6 `data-part` groups (hero anchor) + `dishArt()` sprite-composed dish visuals (7 dishes: base + 2 ingredients) in `.dish-frame` | `index.html` / `js/app.js` |
| `MenuSection` | `.menu-section` label + count-badge headers over `sections[].items` | `renderRestaurant()` |
| `MenuItem` | `.menu-item` plated rows: art + desc + price + `modField()` radios + Add/variant-steppers + `trayVariantRows()` | `menuRow()` |
| `QuantityControl` | `.qty` + `data-inc`/`data-dec`, `output[aria-live]`, 44px targets; per-variant lines | `js/app.js` / `css/primitives.css` |
| `OrderTray` | `#route-cart` + `renderCart()` + `#nav-count` + `#cart-state` pill + `data-cart-state` + variant `<select>` editing + `repack()` | `index.html` / `js/app.js` |
| `CheckoutStation` | `#route-checkout` + `#checkout-form` + fulfillment radios + `orderType` + adaptive validation + `data-checkout-state` | `index.html` / `js/app.js` |
| `OrderTicket` | `.ticket` + `#order-detail` + `renderOrder(animateFrom)` + `print-in` fresh-entry beat + `.exception` alert panel + `#order-eta` | `js/app.js` / `css/app.css` |
| `JourneyLine` | `.journey-line` SVG (dashed path + 5 `JOURNEY_NODES` + traveling `.journey-pack` box) over semantic `.milestones` OL; WAAPI glide on advance | `js/app.js` / `css/app.css` |
| `DrawerSurface` | WIRED — `#quick-tray` + `#tray-peek` header peek + `renderQuickTray()` + `LKDrawer` (Escape/backdrop/navigate-close) | `index.html` / `js/app.js` / `js/primitives.js` |
| `MotionGate` | `matchMedia('(prefers-reduced-motion: reduce)')` in `app.js` + `hero.js` + CSS kill-switch block in `primitives.css` | `js/`, `css/primitives.css` |

## PAGE MAP
Home/discovery → search → restaurant/menu → cart → checkout → order/tracking → orders/reorder.

## ANIMATION OWNERSHIP (verified — no library present, item 3 N/A)
1. CSS transitions/keyframes for simple states — IN USE (`--t-snap/settle/reveal`, `route-reveal`, toast settle).
2. SVG transforms for illustrated object choreography — LIVE (`dishArt` layers reused as
`data-asm` base/food groups + sprite `#box` pack layer in the assembly stage).
3. Existing animation library — NONE INSTALLED; WAAPI proved sufficient, none will be added.
4. WAAPI/JS orchestration for hero assembly — IMPLEMENTED in `js/hero.js` (`LKAssembly.play/cancel`, 2026-10-04).

MDN documents the Web Animations API as a timing/animation model for synchronizing DOM presentation. Source: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API

## STATE MAP (verified in code)
Global: ready/focused/disabled/error (checkout `role="alert"`; no global loading state — no async data yet).
Cart: empty/adding/packed/editing/checking-out/confirmed — ALL NAMED STATES LIVE
(`cartState` + `data-cart-state`/`data-checkout-state` section markers + `#cart-state` pill;
editing = 1.5s flash after tray mutation; checking-out = checkout station page).
Tracking: confirmed/preparing/picked-up/arriving/delivered (`MILESTONES` + per-status
`MILESTONE_ETAS` + `JOURNEY_NODES`) + exception (`order.exception {msg, eta}` with
support/recovery actions; warn pill + ETA override). All seven states live and tested.
Accessibility: reduced-motion (MotionGate + CSS block, browser-verified) + low-motion mode NOT implemented (optional per 17).

## DATA MODEL
```text
Restaurant { id, name, cuisine, eta, station, blurb, sections[], menu[] } // hardcoded; rating?/illustration NOT present
MenuItem { id, restaurantId, restaurantName, name, price, desc, art, mods? } // mods = { name, required, options[{label,delta}] }; only m4 (required spice) + m6 (optional butter)
CartItem { lineKey (itemId or itemId|Variant) -> quantity }                // via lineInfo(); old plain keys still valid
Order { id, items{lineKey:qty}, total, name, address, pay, fulfillment, status, placedAt, exception? } // fulfillment: delivery|pickup; milestones[] implicit via MILESTONES; eta/paymentSummary NOT present
```
No API shapes exist. Fields marked NOT present are added only when a real data source or the hero/checkout milestones require them — never speculatively.

## ASSET MODEL (sprite live 2026-10-04)
`assets/kitchen.svg` — 18-symbol library (`plate tray bowl box bag ticket journey-mark
tomato chili herb-sprig onion lemon ladle spatula jar steam-wisp ink-star counter-sign`),
flat palette fills, charcoal outlines, viewBoxes cropped to art so `<use>` sizing is exact.
Referenced via `<use href="assets/kitchen.svg#id">` (stage scene + design-system library grid).
Rule: choreographed hero parts stay inline with `data-part` groups; static cast comes from
the sprite — never flattened mega-scenes, never stock/3D (16).

## DESIGN TOKENS — CANONICAL IMPLEMENTATION (2026-10-04)
`css/tokens.css` is the single value source: 7 palette colors + `--brick-deep`
(text-on-paper contrast) + `--on-accent` + `--scrim`; 3 font stacks; 6-step type scale
(`--text-hero/section/card/body/meta/label` per 11); 4px spacing rhythm; stroke/radius
set incl. `--radius-card/stage/pill`; flat-offset elevation (`--shadow-stamp/press/food`,
never blur); focus ring/offset; `--target-min: 44px`; full z ladder; motion tokens
(`snap/settle/assemble/reveal/celebrate` + `--ease-out`/`--ease-settle` per 12).
Rule enforced by check-script: zero raw color literals in `primitives.css`/`app.css`
or HTML `style` attributes (SVG artwork `fill`/`stroke` source values excepted per 16).

## PRIMITIVE LAYER (2026-10-04)
`css/primitives.css` — every reusable look: world/stage/card/ticket/empty surfaces,
food object, type, label, badge, buttons, quantity, stations, form controls, divider,
drawer + backdrop, focus treatment, toast/notice, reduced-motion gate.
`css/app.css` — composition/layout only (nav, shell, routes, grids, journey structure, footer).
`js/primitives.js` — `window.LKDrawer` (Escape/backdrop close, focus in + return, Tab containment).
`design-system.html` — inspectable preview of all tokens + primitives (dev-facing, outside product IA).

## BUILD ORDER
1. Repo-safe foundation/tokens.
2. WorldShell static environment.
3. Semantic data/components.
4. Discovery/restaurant.
5. Cart/checkout.
6. Hero choreography.
7. Tracking journey.
8. Responsive/reduced-motion.
9. Optional audio.
10. Browser QA.

## DO NOT IMPLEMENT
Generic glass cards; random gradients; permanent particles; gesture-only nav; full-screen blocking spectacle; default 3D food; unverified stack changes.

## HERO CONTRACT — AS BUILT 2026-10-04 (`js/hero.js`, upholds 10/12/13)
- TRIGGER: any meaningful add-to-cart (first flight full, later flights compressed).
- INITIAL STATE: dish sits in its card; tray indicator idle; count/toast fire FIRST (functional confirmation immediate, non-blocking).
- TRANSFORMATION: `.asm-stage` overlay anchored pixel-exact to the source `.dish-frame`, built from the same `DISH_PARTS` layers (base/food) + sprite pack + HTML ticket.
- SEQUENCE: lift (220ms, first only) → base scaleX 1.14 tray-expand → elastic settle w/ overshoot + garnish pop (fill-box origin) → box slides in + meal dims → readable ticket snaps → flight to tray rect (scale 0.12) → bump.
- USER FEEDBACK: toast + count at once; ticket text mid-flight; tray stamp on landing.
- FINAL STATE: overlay removed from DOM; stable tray state with metadata; `LKAssembly.lastMs` records true flight.
- FALLBACK / REDUCED-MOTION: stage never plays; settle/bump gated; toast + count + pill carry full meaning.
- INTERRUPT: `cancel()` kills anims + node, marks dead (no phantom landing); route changes cancel; repeats re-fire compressed.

## TECHNICAL GATE — RESOLVED FOR FOUNDATION + HERO 2026-10-04
Stack, file paths, animation ownership and state map above are verified against the live
repo (see 01). Primitive layer added 2026-10-04 (tokens/primitives/app split + LKDrawer +
design-system preview; regression: product browser pass unchanged, 21/22 + correct-totals
proof, zero console errors). Hero added 2026-10-04 (`js/hero.js` WAAPI assembly, 24/24 hero
pass: true first-flight 1527ms in 1200–1800 budget, repeats 427ms in 350–550 budget,
interrupt/RM/mobile verified). Journey added 2026-10-04 (visual journey line + traveling
pack + exception model + print-in continuity, 43/43 tracking pass). Scroll discipline
(task routes land on content, instant + clamp-aware) and focus management (route-heading
focus + cross-render focus keeper) verified in the a11y pass (51/51). Remaining OPEN
technical work: committed test/lint harness (14 suites live in Temp, uncommitted).

## NEXT PHASE
Handoff complete — see 20_FINAL_DESIGN_HANDOFF.md. Only standalone futures remain:
committed harness, backend, optional audio.
