/* Living Kitchen — Order Assembly Choreography (10_HERO_INTERACTION).
   A functional visual representation of order state, NOT a loader:
   dish → lift → tray-expand → settle → pack → ticket → fly-to-tray → bump.
   - WAAPI only, transform/opacity, pointer-events none: never blocks input.
   - First flight ~1.5s; repeats compressed ~450ms; interrupts cancel cleanly.
   - Reduced motion: never plays (caller gates); meaning survives via toast+count. */
window.LKAssembly = (function () {
  "use strict";

  var EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
  var EASE_SETTLE = "cubic-bezier(0.34, 1.25, 0.64, 1)";
  var current = null; // { anims:[], node }

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function cancel() {
    if (!current) return;
    current.anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
    if (current.node) {
      current.node.setAttribute("data-dead", "1"); // backstop must not land a dead flight
      if (current.node.parentNode) current.node.parentNode.removeChild(current.node);
    }
    current = null;
  }

  function el(name, attrs, parent) {
    var n = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function use(parent, id, x, y, w, h, extra) {
    var u = el("use", { href: (window.LKDishes ? window.LKDishes.spr : "assets/kitchen.svg#") + id, x: x, y: y, width: w, height: h }, parent);
    if (extra) for (var k in extra) u.setAttribute(k, extra[k]);
    return u;
  }

  function play(opts) {
    if (reduced()) { if (opts.onLanded) opts.onLanded(); return; }
    cancel(); // interrupt: one flight at a time; the new one is compressed if not first
    var lib = window.LKDishes;
    if (!lib || !lib.parts[opts.kind]) { if (opts.onLanded) opts.onLanded(); return; }

    var first = !!opts.first;
    var r = opts.rect;
    var node = document.createElement("div");
    node.className = "asm-stage";
    node.setAttribute("aria-hidden", "true");
    node.style.left = r.left + "px";
    node.style.top = r.top + "px";
    node.style.width = r.width + "px";

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 120 84");
    svg.setAttribute("class", "asm-svg");
    node.appendChild(svg);

    var parts = lib.parts[opts.kind];
    var base = el("g", { "data-asm": "base" }, svg);
    var p0 = parts[0];
    use(base, p0[0], p0[1], p0[2], p0[3], p0[4]);
    var food = el("g", { "data-asm": "food" }, svg);
    parts.slice(1).forEach(function (pt) { use(food, pt[0], pt[1], pt[2], pt[3], pt[4]); });
    var pack = el("g", { "data-asm": "pack", opacity: "0" }, svg);
    use(pack, "box", 12, 12, 96, 50);

    var ticket = document.createElement("div");
    ticket.className = "asm-ticket";
    ticket.textContent = opts.qty + " × " + opts.name + (opts.variant ? " · " + opts.variant : "");
    node.appendChild(ticket);
    document.body.appendChild(node);

    var anims = [];
    function tw(target, frames, timing) {
      var a = target.animate(frames, timing);
      anims.push(a);
      return a;
    }
    var S = first ? 1 : 0.32; // compressed repeats: same beats, ~1/3 the time
    function ms(n) { return Math.round(n * S); }

    var done = false;
    var mark0 = performance.now();
    function finish() {
      if (done) return;
      done = true;
      api.lastMs = Math.round(performance.now() - mark0); // true flight time (no detection lag)
      if (node.parentNode) node.parentNode.removeChild(node);
      if (current && current.node === node) current = null;
      if (opts.onLanded && node.getAttribute("data-dead") !== "1") opts.onLanded();
    }
    current = { anims: anims, node: node };

    // 1. Dish lifts from its context (first flight only; repeats start settled).
    var t = 0;
    if (first) {
      tw(food, [{ transform: "translateY(0)" }, { transform: "translateY(-12px)" }],
        { duration: ms(220), easing: EASE_OUT, fill: "forwards" });
      t = 200;
    }
    // 2. Plate expands into a tray.
    tw(base, [{ transform: "scaleX(1)" }, { transform: "scaleX(1.14)" }],
      { duration: ms(300), delay: ms(t), easing: EASE_OUT, fill: "forwards" });
    // 3. Food/garnish settle into a composed meal (elastic, overshoot ≤6%).
    tw(food, [{ transform: first ? "translateY(-12px)" : "translateY(-4px)" }, { transform: "translateY(0)" }],
      { duration: ms(350), delay: ms(t + 120), easing: EASE_SETTLE, fill: "forwards" });
    var garnish = food.lastChild;
    if (garnish) {
      garnish.classList.add("asm-pop");
      tw(garnish, [{ transform: "scale(0.55)" }, { transform: "scale(1)" }],
        { duration: ms(320), delay: ms(t + 220), easing: EASE_SETTLE, fill: "forwards" });
    }
    // 4–5. Container slides in (meal dims away); ticket snaps crisp + readable.
    var tPack = t + 480;
    tw(pack, [{ opacity: "0", transform: "translateX(34px)" }, { opacity: "1", transform: "translateX(0)" }],
      { duration: ms(300), delay: ms(tPack), easing: EASE_OUT, fill: "forwards" });
    tw(food, [{ opacity: "1" }, { opacity: "0.25" }],
      { duration: ms(300), delay: ms(tPack), easing: EASE_OUT, fill: "forwards" });
    tw(ticket, [{ opacity: "0", transform: "scale(0.7)" }, { opacity: "1", transform: "scale(1)" }],
      { duration: ms(200), delay: ms(tPack + 180), easing: EASE_OUT, fill: "forwards" });
    // 6–7. Pack closes into the tray indicator; cart stamps packed state.
    var tFly = tPack + 420;
    var tray = document.querySelector('[data-nav="cart"]');
    var landed = false;
    function land() { if (!landed) { landed = true; finish(); } }
    if (tray) {
      var tr = tray.getBoundingClientRect();
      var dx = (tr.left + tr.width / 2) - (r.left + r.width / 2);
      var dy = (tr.top + tr.height / 2) - (r.top + r.height / 2);
      var fly = tw(node, [
        { transform: "translate(0, 0) scale(1)", opacity: "1" },
        { transform: "translate(" + Math.round(dx) + "px," + Math.round(dy) + "px) scale(0.12)", opacity: "0.9" }
      ], { duration: ms(400), delay: ms(tFly), easing: EASE_OUT, fill: "forwards" });
      fly.onfinish = land;
    }
    // Backstop: total budget first ~1500ms / repeat ~420ms; then land exactly once.
    var budget = first ? 1600 : 520;
    setTimeout(land, budget);
  }

  var api = { play: play, cancel: cancel, lastMs: null };
  return api;
})();
