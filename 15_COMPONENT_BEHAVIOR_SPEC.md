# 15 COMPONENT BEHAVIOR SPEC

STATUS: LOCKED
DATE: 2026-10-04

## NAVIGATION
Default: quiet semantic rail/header.
Hover/focus: local ink/label response.
Active: stable station marker.
Pressed: 1–2px tactile compression.
Accessibility: semantic nav + visible keyboard focus.

## FOOD CARD
Default: dish, name, price, metadata, add.
Hover/focus: dish lifts 2–6px.
Pressed: immediate feedback.
Loading: local skeleton/placeholder.
Error: explicit text/icon.
Success: dish moves toward tray.

## RESTAURANT COUNTER
Default: identity + key service data + hero dish.
Hover: local props react.
Active: expands into restaurant view.
Entry/exit: local environmental assembly.

## CATEGORY SELECTOR
Active: station/label anchored.
Hover: slight tilt/ink response.
Keyboard: focus ring independent of motion.

## SEARCH
Focus: environment quiets around the field.
Loading: small local indicator.
Results: field reorganizes.
Empty/error: explicit next action/recovery.

## MENU ITEM
Default: dish, price, modifiers, add.
Pressed: immediate control confirmation.
Success: item joins tray.
Responsive: modifiers stack below dish.

## QUANTITY CONTROL
Buttons are conventional and semantic. Count updates immediately; meal composition follows.

## CART
Default: packed collection + explicit totals.
Edit/remove: local repack animation.
Loading/error: no fake progress; explicit states.

## CHECKOUT
Calm visual surface. Field focus does not trigger decorative background motion. Validation is semantic.

## ORDER TRACKER
Ticket + named milestones + ETA. Active milestone moves gently. Tracking errors expose recovery/support.

## NOTIFICATION
Small note/label object. Short entry/settle, no infinite bounce.

## DRAWER / DIALOG
Physical tray/drawer metaphor; semantic dialog/drawer behavior, escape and focus management as appropriate.

## HERO
Immediate functional response → expressive choreography → stable result. Re-entry uses shorter choreography.

## REJECTED DIRECTIONS
Default-only component specs; hover-required flows; animation-delayed actions.

## LOCKED DECISIONS
Every major component is specified by state and behavior, not appearance alone.

## NEXT PHASE
16 — Asset Direction.
