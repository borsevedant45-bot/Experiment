# 14 INTERFACE ARCHITECTURE

STATUS: LOCKED
DATE: 2026-10-04

## CORE ROUTE MODEL
`/` Home / discovery
`/search` Search/craving discovery
`/restaurant/:id` Restaurant + menu
`/cart` Packed collection
`/checkout` Checkout station
`/order/:id` Confirmation + tracking
`/orders` Past orders / reorder

Exact route syntax remains implementation-dependent.

## GLOBAL NAVIGATION
Stable semantic navigation contains brand, discovery/search, orders, cart/tray and account/address utilities. Spatial movement happens around it.

## HOME / DISCOVERY
Purpose: evoke appetite + route to choices.
Content: discovery, categories, key restaurant options.
Creative treatment: kitchen/ingredient field.

## SEARCH
Purpose: locate intent.
Content: input, filters, recent/search suggestions, results.
Creative treatment: field reorganizes around query.

## RESTAURANT
Purpose: establish identity and menu confidence.
Content: restaurant info, ETA/service, menu groups, dishes, prices, modifiers.
Creative treatment: counter world.

## CART
Purpose: verify order.
Content: items, quantity, modifiers, subtotal, fees, total, CTA.
Creative treatment: packed collection/tray.

## CHECKOUT
Purpose: complete safely.
Content: address, payment, contact, breakdown, place-order CTA.
Creative treatment: calm packing/sealing station.

## ORDER / TRACKING
Purpose: create confidence during wait.
Content: status, ETA, milestones, support/address context.
Creative treatment: ticket + journey line.

## ORDERS
Purpose: repeat quickly.
Creative treatment: visual archive/tray of prior packed orders.

## REJECTED DIRECTIONS
Replacing semantic nav with exploration-only UI; giant single-scroll app; hidden route/state changes.

## LOCKED DECISIONS
Creative spatial behavior augments stable product structure.

## NEXT PHASE
15 — Component Behavior Specification.
