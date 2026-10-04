# 17 RESPONSIVE + ACCESSIBILITY + PERFORMANCE

STATUS: LOCKED (rules) + MEASURED 2026-10-04 (appendix below; rules unchanged)
DATE: 2026-10-04

## RESPONSIVE
### Desktop
Full environmental composition; target ≤ 12 independently animated objects in peak hero moments.

### Tablet
Reduce overlap and travel distance; target ≤ 8 peak concurrent animated objects.

### Mobile
Convert spatial surfaces into stacked zones; target ≤ 6 peak concurrent animated objects. Preserve metaphor, not desktop geometry.

### Touch
No hover-only meaning. Large practical hit targets. Drag is optional.

## REDUCED MOTION
Use `prefers-reduced-motion: reduce` to disable or soften non-essential animation. Replace large translation/scale and ambient loops with short state transitions or static indicators. MDN describes this as a mechanism for providing a complementary reduced-motion experience. Source: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion

## KEYBOARD
Logical tab order, persistent visible focus, semantic controls, managed focus for dialog/drawer states.

## SCREEN READERS
Metaphorical visuals receive semantic text where they convey information. Decorative objects are hidden from assistive technology. Important order/status changes are exposed semantically.

## COLOR
Never rely on color alone. Use text, icon, shape, position or pattern as a secondary cue.

## PROPOSED PERFORMANCE TARGETS
These are design targets, not measured repo values.
- Initial JS ≤ 220 KB gzip before non-critical route code.
- Typical additional route JS ≤ 150 KB gzip.
- Interactive SVG target ≤ 50 KB each where practical.
- Typical raster asset target ≤ 200 KB.
- Peak simultaneous animated objects ≤ 12 desktop / 8 tablet / 6 mobile.
- Lazy-load heavy route-specific art.
- Avoid default WebGL and autoplay video.

MDN notes that animation cost varies by property and that excessive animation can create jank. Source: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate

## LOW-POWER MODE
Disable ambient loops, reduce object count and shorten choreography while preserving functional feedback.

## NETWORK
Critical content and checkout actions load before decorative assets. Do not make the hero dependent on a large video download.

## REJECTED DIRECTIONS
WebGL by default; giant autoplay video; maximal animation as a quality metric.

## LOCKED DECISIONS
Creative intensity scales down before product utility does.

## MEASURED APPENDIX 2026-10-04 (evidence, not rule changes)
- Transfer: 112.8KB raw / 34.5KB gzip for all 9 product files (220KB budget).
- DOM: 209–346 nodes per route; sprite 18 symbols / 84 elements.
- Runtime (full purchase + hero flight, Chromium desktop): 0ms long tasks, CLS 0,
  flight peak ≤10 concurrent animations, worst rAF gap 50ms (headless).
- Motion budgets verified per tier: desktop ≤12, mobile ≤6 running.
- No action taken on guesses: drop-shadow filters, full innerHTML re-renders, and
  localStorage writes all measured negligible at this scale; no framework, minifier,
  or lazy-loader introduced — the zero-build stack stands on evidence.

## NEXT PHASE
18 — Frontend Build Spec.
