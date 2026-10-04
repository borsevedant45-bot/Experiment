# 10 HERO INTERACTION

STATUS: LOCKED
DATE: 2026-10-04

## PURPOSE
Define the one interaction that makes the product worth showing to another person.

## HERO — ORDER ASSEMBLY CHOREOGRAPHY
**Trigger:** first meaningful add-to-cart action.

**Initial state:** chosen dish sits in the illustrated kitchen context; tray/package/ticket are idle.

**Sequence:**
1. Dish lifts from its context.
2. Plate expands into a tray.
3. Food/garnish settle into a composed meal.
4. Takeaway container slides into place.
5. Item label/quantity snap into a readable ticket position.
6. Tray/package closes into a packed order object.
7. Cart indicator becomes a small packed-bag/tray state.

**User interaction:** subsequent items repeat a compressed version of the sequence; repeated additions are faster than the first.

**Timing target:** 1.2–1.8s for the first full choreography; ~350–550ms for repeated item additions.

**Sound possibility:** optional soft tactile cues for contact/fold/confirmation.

**Final state:** stable cart state with all essential metadata visible.

**Fallback:** reduced-motion mode removes large translation/scale and settles directly into the final configuration; functionality and confirmation remain.

## SECONDARY HERO — TRACKING JOURNEY
The confirmation ticket becomes the journey line. Order status advances through named milestones: confirmed → preparing → picked up → arriving → delivered.

## IMPLEMENTATION NOTES
Use modular SVG/DOM parts and transform-oriented motion where practical. Functional confirmation must happen immediately; expressive motion follows without blocking the next action.

## REJECTED DIRECTIONS
Confetti overlays, 3D food physics, cursor-exclusive hero, full-screen blocking spectacle.

## LOCKED DECISIONS
Primary signature = order assembly. Secondary signature = order-as-journey.

## NEXT PHASE
11 — Visual DNA.
