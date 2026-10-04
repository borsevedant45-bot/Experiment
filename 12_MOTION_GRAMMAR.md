# 12 MOTION GRAMMAR

STATUS: LOCKED
DATE: 2026-10-04

## PERSONALITY
Playful, tactile, hand-drawn, slightly elastic, editorially paced. Controls remain crisp; food objects are expressive.

## TIMING
| Level | Target |
|---|---:|
| Micro | 90–160ms |
| Hover/focus | 120–220ms |
| Button response | 140–240ms |
| Object/card | 240–500ms |
| Section | 450–800ms |
| Hero | 1200–1800ms |
| Major state | 500–900ms |

## EASING
Default: approximately `cubic-bezier(0.22, 1, 0.36, 1)`.

Object settle: mild overshoot then stable rest.

## PHYSICS
Bounce once at most. Scale distortion ≤ ~6%. Overshoot 2–6% of travel. Wobble 1–3°. No uncontrolled collision systems for UI text.

## HIERARCHY
**MICRO → COMPONENT → SECTION → PAGE → HERO**.

## PURPOSE CATEGORIES
Every meaningful animation should primarily serve feedback, orientation, discovery, storytelling, delight, state change or emphasis.

## MOTION TOKENS
`snap` 120–180ms; `settle` 280–420ms; `assemble` 450–700ms; `reveal` 500–800ms; `journey` low-amplitude continuous; `celebrate` 700–1200ms non-blocking.

## SCROLL
Use scroll to reveal/recompose the environment, not constant parallax. Text should remain predictable.

## REDUCED MOTION
Implement a complementary reduced-motion experience using `prefers-reduced-motion`. MDN documents that the feature is intended to reduce/remove non-essential motion and warns that large scaling/panning can be problematic for some users. Source: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion

## PERFORMANCE
Prefer transform/opacity/SVG/CSS where appropriate; avoid large simultaneous animations. MDN notes animation cost varies by property and excessive animation can cause jank. Source: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate

## REJECTED DIRECTIONS
Permanent particle fields; infinite floating food; giant looping motion; hover effects that dominate the page.

## LOCKED DECISIONS
Motion is a grammar with timing, physicality, hierarchy and purpose—not a decorative layer.

## NEXT PHASE
13 — Physical Interaction.
