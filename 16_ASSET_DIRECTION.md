# 16 ASSET DIRECTION

STATUS: LOCKED
DATE: 2026-10-04

## PURPOSE
Build a modular visual asset system that can animate without flattening the entire world.

## ASSET INVENTORY
| Asset family | Type | Purpose | Animation | Priority |
|---|---|---|---|---|
| kitchen environment | SVG | home/discovery | yes | P0 |
| plates/bowls/trays | SVG | menu/cart/hero | yes | P0 |
| dish family | modular SVG | discovery/menu | yes | P0 |
| ingredient family | modular SVG | search/discovery | yes | P0 |
| steam/heat marks | SVG | ambience | yes | P1 |
| takeaway box/bag | SVG | cart/checkout | yes | P0 |
| ticket/receipt | SVG/HTML | confirmation/tracking | yes | P0 |
| journey marks | SVG | tracking | yes | P0 |
| restaurant sign modules | SVG | restaurant/discovery | yes | P1 |
| utensils | SVG | props/state | optional | P1 |
| accent ink marks | SVG | transitions | yes | P1 |
| semantic icons | SVG | controls | minimal | P0 |
| texture | SVG/raster | optional material cue | no | P2 |

## MODULAR CONSTRUCTION
Prefer:
`plate/base → food → garnish → steam → shadow`
`package/base → label → sticker/seal → ticket`

Keep visual centers stable and leave transparent padding around independently moving parts.

## STYLE
Flat vector; human-drawn contour; controlled charcoal outlines; opaque food colors; no photoreal or glossy 3D treatment.

## PERFORMANCE RULES
Avoid giant flattened scene files and unnecessarily complex paths. Reuse families; parameterize variants where possible.

## SOURCE POLICY
Use original/custom or properly licensed assets. Reference images are mechanics inspiration only.

## REJECTED DIRECTIONS
Flattened mega-SVG scenes; stock food-photo dependency; 3D food render pipeline.

## LOCKED DECISIONS
Modularity is the default authoring model.

## NEXT PHASE
17 — Responsive, Accessibility and Performance.
