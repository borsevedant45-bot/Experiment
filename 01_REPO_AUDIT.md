# 01 REPO AUDIT

STATUS: LOCKED — FULL TECHNICAL GATE PASSED 2026-10-04
DATE: 2026-10-04

## PURPOSE
Understand the actual technical environment before making implementation-specific claims.

## INSPECTION METHOD
`Get-ChildItem -Recurse -Depth 3` file tree, `Test-Path` on all conventional
slots (package.json/src/app/components/public/styles/routes/tests/Dockerfile/Makefile),
full read of `index.html` (169 lines) + `js/app.js` (347 lines),
regex sweep for external refs/imports, `node --check`, Python HTML parse,
CSS-var cross-check, live `python -m http.server` + curl-equivalent checks,
and a real Chromium render via Python Playwright (22 behavior checks + screenshots).

## VERIFIED FACTS
| Question | Answer |
|---|---|
| Framework / version | None — vanilla HTML5 + CSS3 + ES5-style JS (IIFE, `var`, no modules) |
| Language | HTML, CSS, JavaScript (no TypeScript) |
| Package manager | None — no `package.json`, no lockfile, no `node_modules` |
| Build system | None — zero-build static; files are served as authored |
| Entry points | `index.html` → `css/tokens.css` → `css/app.css` → `js/app.js` (single classic script, end of body) |
| Routing | Hash router in `js/app.js` (`currentRoute`/`render` + `hashchange`): `#/` `#/search` `#/restaurant/:id` `#/cart` `#/checkout` `#/order/:id` `#/orders` — matches all 7 families in `14` |
| Component architecture | No framework components. View-render functions: `renderCounters` `renderSearch` `renderRestaurant` `renderCart` `renderCheckout` `renderOrder` `renderOrders` + one delegated click handler for cart actions; `esc()` HTML-escapes all interpolated data |
| Styling | Hand-authored `css/tokens.css` (custom-property tokens) + `css/app.css` (`@import` of tokens). No preprocessor, no utility framework |
| Animation libraries | None installed, none referenced |
| SVG handling | One inline modular SVG (`.food-object`, 6 `data-part` groups: shadow/tray/plate/food/garnish/steam). `assets/` directory exists but is EMPTY — no sprite, no standalone SVGs, no icon set |
| Fonts | System stacks only (`--font-display` serif fallback chain, system sans/mono). No webfonts, no licenses to preserve |
| Pages / states | All 7 route sections exist in DOM; cart states empty/adding/packed/confirmed implemented; tracking milestones confirmed→delivered with demo advance; checkout validation with `role="alert"`; orders archive + reorder reconstruct |
| Data / state | Hardcoded `RESTAURANTS`/`MENU_INDEX` in `js/app.js`; persistence via `localStorage` keys `lk-cart`, `lk-orders`; in-memory `cart` object is source of truth during session (storage is read once at load). No API/backend |
| Dependencies | Zero — regex sweep finds no `http` imports, no CDN, no `require`/`import`; only local `js/app.js` script ref and local CSS `@import` |
| Scripts | None (no npm scripts; no Makefile/Dockerfile/CI) |
| Dev server | Any static server; verified with `python -m http.server` (200 on all 4 files) |
| Production build | N/A — identical files served as-is; transfer ≈ 30KB total (`tokens.css` ~2KB, `app.css` ~10KB, `app.js` ~17.5KB; ~12KB gzip) vs 220KB budget |
| Tests | None in repo |
| Lint / types | None in repo (`tsc`/`eslint` not installed; `node --check` used instead) |
| Browser automation | Not in repo, but AVAILABLE in environment: Python Playwright + Chromium 1243 (`ms-playwright/chromium-1243/chrome-win64/chrome.exe`). Used for this gate; reusable for future QA |
| Implementation status | Foundation only: WorldShell + semantic flow + cart/checkout/tracking-functional. Hero choreography, journey animation, asset families, drawer/dialog, audio: NOT built |

## PRESERVE (do not replace without compelling reason)
- Zero-build static delivery (keeps 220KB budget trivially, zero install,Grand runnable).
- Hash routing (deep-linksafe on any static host; no server rewrite rules needed).
- Token file split (`tokens.css` = contract from 11/12/18; `app.css` = usage).
- `data-part` modular SVG convention (foundation for 16 asset families).
- `esc()` + `role="alert"`/`aria-live`/`aria-current` semantics already in code.
- localStorage keys `lk-cart` / `lk-orders` (user data must migrate, never be silently orphaned).

## GAPS FOUND (become future work, not redesign)
1. ~~`assets/` empty~~ RESOLVED 2026-10-04 — `assets/kitchen.svg` (18 symbols) + stage scene; remaining: dish-variant illustrations for menu cards.
2. `DrawerSurface` primitive ready (`LKDrawer` + demo) — product wiring still OPEN.
3. No focus management on route change (skip-link focus verified; routed sections never receive focus).
4. No loading/error states for data layer (currently hardcoded; acceptable until a real API exists).
5. No tests/lint/CI in repo — Playwright scripts live in Temp, not committed.

## PRIOR CONTEXT — NOW LIVE-VERIFIED
The 2D hand-drawn food illustration direction exists in code as the inline
`.food-object` SVG (flat fills, charcoal 3px outlines, offset shadow). The sparse
kitchen-tableau direction exists as `.kitchen-stage` + `.world-shell`.
Both are real DOM, rendered and screenshot-verified — no longer "context only".

## DECISIONS
- Do not invent framework/library/version information (nothing to invent: all answers verified above).
- Do not replace the zero-build stack without a compelling product reason (any framework
  adoption must prove it cannot be done in ~30KB of vanilla first).
- Stack mapping is now LOCKED for foundation scope (was OPEN).
- `advance-btn` is dynamically injected then queried — confirmed intentional, not a dangling reference.

## REJECTED DIRECTIONS
- Assume React/Next/Vite/GSAP/Framer Motion is installed (verified absent).
- Claim browser/render validation without a mounted app (this gate used real Chromium).

## LOCKED DECISIONS
Repository truth outranks creative assumptions. Technical gate PASSED for foundation scope.

## DEPENDENCIES
Outstanding technical work (hero choreography, asset families, drawer, focus management,
tests) proceeds under 18_BUILD_SPEC without a further audit gate — the canvas is known.

## OUTPUT
A truthful boundary between verified technical facts and design assumptions.

## NEXT PHASE
02 — Experience Brief (creative phases inherit a KNOWN canvas, not an OPEN one).
