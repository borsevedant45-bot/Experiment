/* Living Kitchen — foundation JS (18_BUILD_SPEC state map + 15 behavior spec).
   Zero dependencies. MotionGate: all expressive motion checks prefers-reduced-motion.
   Functional confirmation happens immediately; expressive motion never blocks. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Data model (18): sections group the menu; mods attach where supported ---------- */
  var RESTAURANTS = [
    {
      id: "r1", name: "Meera's Thali Counter", cuisine: "North Indian · Thali",
      eta: "25–35 min", station: "thali",
      blurb: "Composed plates, dal, breads, seasonal sides.",
      sections: [
        { title: "Thali & Plates", items: ["m1", "m2"] },
        { title: "Comfort Bowls", items: ["m3"] }
      ],
      menu: [
        { id: "m1", name: "Classic Veg Thali", price: 249, desc: "Dal, paneer, 2 breads, rice, salad.", art: "thali" },
        { id: "m2", name: "Paneer Butter Plate", price: 199, desc: "Paneer makhani + 2 tandoori rotis.", art: "paneer" },
        { id: "m3", name: "Dal Khichdi Bowl", price: 149, desc: "Comfort bowl with ghee tadka.", art: "khichdi" }
      ]
    },
    {
      id: "r2", name: "Galli Chaat Counter", cuisine: "Street · Chaat",
      eta: "15–25 min", station: "street",
      blurb: "Crisp, tangy, assembled to order.",
      sections: [
        { title: "Chaat Counter", items: ["m4", "m5"] }
      ],
      menu: [
        { id: "m4", name: "Samosa Chaat Plate", price: 129, desc: "Crushed samosa, chole, imli, sev.", art: "chaat",
          mods: { name: "Spice level", required: true, options: [
            { label: "Mild", delta: 0 }, { label: "Medium", delta: 0 }, { label: "Hot", delta: 0 }
          ] } },
        { id: "m5", name: "Pani Puri Flight (8 pc)", price: 99, desc: "Three waters: pudina, imli, hing.", art: "puris" }
      ]
    },
    {
      id: "r3", name: "Tandoor & Crumb", cuisine: "Bakery · Breads",
      eta: "20–30 min", station: "bakery",
      blurb: "Slow-ferment breads and buns, baked hourly.",
      sections: [
        { title: "Breads & Buns", items: ["m6", "m7"] }
      ],
      menu: [
        { id: "m6", name: "Butter Naan Basket (4 pc)", price: 119, desc: "Tandoor-fresh, brushed with butter.", art: "naan",
          mods: { name: "Butter", required: false, options: [
            { label: "Light", delta: 0 }, { label: "Extra", delta: 10 }
          ] } },
        { id: "m7", name: "Masala Bun Pair", price: 89, desc: "Soft buns, spiced onion-tomato masala.", art: "buns" }
      ]
    }
  ];

  var MENU_INDEX = {};
  RESTAURANTS.forEach(function (r) {
    r.menu.forEach(function (m) { MENU_INDEX[m.id] = Object.assign({ restaurantId: r.id, restaurantName: r.name }, m); });
  });

  /* ---------- Dish art: sprite-composed food visuals (16). Base + 2 ingredients.
     Evocative, never semantic — names/prices stay in text (06 law 6). */
  var SPR = "assets/kitchen.svg#";
  var DISH_PARTS = {
    thali: [["plate", 8, 24, 104, 54], ["tomato", 20, 30, 30, 22], ["herb-sprig", 72, 28, 28, 22]],
    paneer: [["plate", 8, 24, 104, 54], ["bowl", 38, 30, 44, 24], ["chili", 72, 40, 26, 18]],
    khichdi: [["bowl", 26, 22, 68, 38], ["lemon", 62, 44, 30, 14]],
    chaat: [["bowl", 26, 22, 68, 38], ["onion", 28, 30, 28, 22], ["chili", 66, 32, 26, 18]],
    puris: [["bowl", 26, 22, 68, 38], ["lemon", 30, 32, 28, 13], ["herb-sprig", 66, 30, 26, 21]],
    naan: [["tray", 10, 42, 100, 40], ["herb-sprig", 24, 24, 24, 19], ["tomato", 72, 24, 26, 19]],
    buns: [["plate", 8, 24, 104, 54], ["tomato", 26, 32, 28, 20], ["chili", 68, 34, 26, 18]]
  };
  function dishArt(kind) {
    var parts = DISH_PARTS[kind] || DISH_PARTS.thali;
    return '<svg class="dish-svg" viewBox="0 0 120 84" aria-hidden="true" focusable="false">' +
      parts.map(function (pt) {
        return '<use href="' + SPR + pt[0] + '" x="' + pt[1] + '" y="' + pt[2] + '" width="' + pt[3] + '" height="' + pt[4] + '"/>';
      }).join("") + "</svg>";
  }
  function dishFrame(m) {
    return '<span class="dish-frame">' + dishArt(m.art) + "</span>";
  }
  // Modular layers shared with the hero assembly stage (10): base + food parts.
  window.LKDishes = { parts: DISH_PARTS, spr: SPR };

  /* ---------- Cart store: empty/adding/packed/editing/checking-out/confirmed (18) ---------- */
  var cart = {}; // itemId -> qty
  var cartState = "empty";
  try {
    var saved = localStorage.getItem("lk-cart");
    if (saved) cart = JSON.parse(saved) || {};
  } catch (e) { cart = {}; }

  function persist() {
    try { localStorage.setItem("lk-cart", JSON.stringify(cart)); } catch (e) {}
  }
  function cartCount() {
    return Object.keys(cart).reduce(function (n, k) { return n + cart[k]; }, 0);
  }
  /* Variant-aware lines: key = itemId, or itemId|Variant. Old keys stay valid. */
  function lineInfo(key) {
    var parts = String(key).split("|");
    var m = MENU_INDEX[parts[0]];
    if (!m) return null;
    var variant = parts[1] || "";
    var delta = 0;
    if (variant && m.mods) {
      var opt = m.mods.options.filter(function (o) { return o.label === variant; })[0];
      if (opt) delta = opt.delta;
    }
    return { m: m, variant: variant, unit: m.price + delta };
  }
  function trayLines(id) {
    return Object.keys(cart).filter(function (k) {
      return cart[k] > 0 && (k === id || k.indexOf(id + "|") === 0);
    });
  }
  function cartSubtotal() {
    return Object.keys(cart).reduce(function (s, k) {
      var li = lineInfo(k);
      return s + (li ? li.unit * cart[k] : 0);
    }, 0);
  }
  function money(n) { return "\u20B9" + n; }

  /* ---------- Toast (small note object, short settle — 15) ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- Router (14 route model via hash) ---------- */
  var routes = ["home", "search", "restaurant", "cart", "checkout", "order", "orders"];
  var firstRender = true;
  var lastFocusRoute = null;
  function currentRoute() {
    var h = location.hash || "#/";
    if (h.indexOf("#/search") === 0) return "search";
    if (h.indexOf("#/restaurant/") === 0) return "restaurant";
    if (h === "#/cart") return "cart";
    if (h === "#/checkout") return "checkout";
    if (h.indexOf("#/order/") === 0) return "order";
    if (h === "#/orders") return "orders";
    return "home";
  }
  function render() {
    var r = currentRoute();
    if (window.LKAssembly) window.LKAssembly.cancel(); // flights never outlive their route
    // Focus keeper: re-renders rebuild DOM, so remember the focused control and
    // restore its equivalent afterwards (keyboard users must not lose position).
    // Same helper serves render() and the direct renderOrder() calls below.
    var ae = captureFocus();
    var changed = (r !== lastFocusRoute) || location.hash === "#route-home";
    routes.forEach(function (name) {
      var el = document.getElementById("route-" + name);
      if (el) el.classList.toggle("active", name === r);
    });
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      var on = (a.getAttribute("data-nav") === r) || (r === "restaurant" && a.getAttribute("data-nav") === "home");
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    if (r === "home") renderCounters();
    if (r === "search") renderSearch();
    if (r === "restaurant") { renderRestaurant(lastRoute !== "restaurant"); }
    if (r === "cart") renderCart();
    if (r === "checkout") renderCheckout();
    if (r === "order") renderOrder();
    if (r === "orders") renderOrders();
    lastRoute = r;
    document.getElementById("nav-count").textContent = String(cartCount());
    var peek = document.getElementById("tray-peek");
    if (peek) peek.hidden = cartCount() === 0;
    // Managed focus (17): a route change (or the in-page shortcut) moves the
    // screen-reader cursor to the new heading; same-route re-renders restore the
    // focused control instead. Runs BEFORE scroll discipline so the instant
    // landing below cancels any focus-initiated smooth scroll (CSS smooth would
    // otherwise drag the viewport toward the heading afterwards).
    if (!firstRender && changed) focusHead(r);
    else if (!firstRender && !changed) focusRestore(ae, r);
    // Conventional SPA position: browse routes start at top (the stage is the entry);
    // task routes (tray/checkout/ticket) land directly on their content, since the
    // confirmation must be the first thing seen — the world stays above as context.
    // Only on route change: same-route re-renders must never yank scroll.
    // The in-page "#route-home" shortcut scrolls to its section instead.
    if (location.hash === "#route-home") {
      var tgt = document.getElementById("route-home");
      if (tgt) tgt.scrollIntoView();
    } else if (changed) {
      if (r === "cart" || r === "checkout" || r === "order") {
        var sec = document.getElementById("route-" + r);
        if (sec) landOn(sec);
      } else {
        window.scrollTo(0, 0);
      }
    }
    lastFocusRoute = r;
    firstRender = false;
    var main = document.getElementById("main");
    if (main && !reduceMotion) { /* keep focus stable; no forced scroll animation */ }
  }
  window.addEventListener("hashchange", render);

  /* ---------- Discovery ---------- */
  var activeStation = "all";
  document.getElementById("stations").addEventListener("click", function (e) {
    var b = e.target.closest(".station");
    if (!b) return;
    activeStation = b.getAttribute("data-station");
    document.querySelectorAll(".station").forEach(function (s) {
      s.setAttribute("aria-pressed", s === b ? "true" : "false");
    });
    renderCounters();
    // Station change re-composes the field: replay a compressed entry (08 rule 8).
    var box = document.getElementById("restaurant-counters");
    box.classList.remove("enter");
    void box.offsetWidth;
    box.classList.add("enter");
  });

  function restaurantCard(r) {
    var hero = r.menu[0];
    var heroAction = (hero.mods && hero.mods.required)
      ? '<a class="btn" href="#/restaurant/' + r.id + '">Choose ' + esc(hero.mods.name.toLowerCase()) + " →</a>"
      : '<button class="btn" data-add="' + hero.id + '">Add ' + esc(hero.name) + "</button>";
    return '<article class="counter" data-station="' + r.station + '">' +
      dishFrame(hero) +
      "<h3>" + esc(r.name) + "</h3>" +
      '<p class="meta">' + esc(r.cuisine) + " · " + esc(r.eta) + "</p>" +
      '<p class="meta">' + esc(r.blurb) + "</p>" +
      '<p class="row"><span class="price">' + money(hero.price) + '</span><span class="meta">from · ' + esc(hero.name) + "</span></p>" +
      '<p class="row"><a class="btn secondary" href="#/restaurant/' + r.id + '">Open counter</a> ' +
      heroAction + "</p>" +
      "</article>";
  }

  function renderCounters() {
    var box = document.getElementById("restaurant-counters");
    var list = RESTAURANTS.filter(function (r) { return activeStation === "all" || r.station === activeStation; });
    box.innerHTML = list.map(restaurantCard).join("") ||
      '<p class="meta">No counters at this station yet.</p>';
  }

  /* ---------- Search (craving lens): idle/focused/searching/loading/results/empty/error (15) ---------- */
  var searchInput = document.getElementById("search-input");
  var sortSelect = document.getElementById("sort-select");
  var searchCount = document.getElementById("search-count");
  var searchTimer = null;
  var searchSort = "relevance";

  searchInput.addEventListener("focus", function () {
    document.body.classList.add("is-searching"); // environment quiets around the field (15)
    renderSearch();
  });
  searchInput.addEventListener("blur", function () {
    document.body.classList.remove("is-searching");
  });
  searchInput.addEventListener("input", function () {
    var box = document.getElementById("search-results");
    box.innerHTML = skeletonCards(3); // honest loading: real 250ms debounce gap, reserved layout
    searchCount.textContent = "Searching the kitchen…";
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderSearch, 250);
  });
  sortSelect.addEventListener("change", function () {
    searchSort = sortSelect.value;
    renderSearch();
  });

  function skeletonCards(n) {
    var out = "";
    for (var i = 0; i < n; i++) {
      out += '<article class="food-card skel" aria-hidden="true"><span class="dish-frame"><span class="skel-img"></span></span>' +
        '<p class="skel-line" style="width:62%"></p><p class="skel-line" style="width:88%"></p>' +
        '<p class="skel-line" style="width:40%"></p></article>';
    }
    return out;
  }

  function collectDishes(q) {
    var dishes = [];
    RESTAURANTS.forEach(function (r) {
      r.menu.forEach(function (m) {
        if (!q || m.name.toLowerCase().indexOf(q) !== -1 || r.name.toLowerCase().indexOf(q) !== -1 || r.cuisine.toLowerCase().indexOf(q) !== -1) {
          dishes.push({ r: r, m: m });
        }
      });
    });
    if (searchSort === "price-asc") dishes.sort(function (a, b) { return a.m.price - b.m.price; });
    if (searchSort === "price-desc") dishes.sort(function (a, b) { return b.m.price - a.m.price; });
    return dishes;
  }

  function renderSearch() {
    var q = (searchInput.value || "").trim().toLowerCase();
    var box = document.getElementById("search-results");
    var dishes;
    try {
      dishes = collectDishes(q);
    } catch (e) {
      searchCount.textContent = "";
      box.innerHTML = '<div class="tray-empty"><p><strong>The lens fogged up.</strong></p>' +
        '<p class="meta">Something interrupted search. Your tray is untouched.</p>' +
        '<p><button class="btn secondary" data-retry-search>Wipe the lens</button></p></div>';
      return;
    }
    if (!dishes.length) {
      searchCount.textContent = "No matches.";
      box.innerHTML = '<div class="tray-empty"><p><strong>Nothing smells like “' + esc(searchInput.value.trim()) + '” yet.</strong></p>' +
        '<p class="meta">Try “thali”, “chaat”, or “naan”.</p>' +
        '<p><a class="btn secondary" href="#/">Back to discovery</a></p></div>';
      return;
    }
    searchCount.textContent = dishes.length + (dishes.length === 1 ? " craving found." : " cravings found.");
    box.innerHTML = dishes.map(function (d) {
      var action = (d.m.mods && d.m.mods.required)
        ? '<a class="btn" href="#/restaurant/' + d.r.id + '">Choose ' + esc(d.m.mods.name.toLowerCase()) + " →</a>"
        : '<button class="btn" data-add="' + d.m.id + '">Place on tray</button>';
      return '<article class="food-card">' + dishFrame(d.m) + "<h3>" + esc(d.m.name) + "</h3>" +
        '<p class="meta">' + esc(d.r.name) + " · " + esc(d.m.desc) + "</p>" +
        '<p class="row spread"><span class="price">' + money(d.m.price) + "</span>" + action + "</p></article>";
    }).join("");
  }

  /* ---------- Restaurant (selected counter): entry assembly runs once per visit (08/15) ---------- */
  var lastRoute = null;

  /* Counter hero: same kitchen, distinct zone — station tableau, not a dashboard (08/14) */
  var COUNTER_PARTS = {
    thali: [["jar", 6, 8, 30, 30], ["plate", 32, 22, 82, 43], ["tomato", 44, 28, 26, 19]],
    street: [["bowl", 30, 22, 62, 34], ["chili", 66, 26, 30, 21], ["onion", 12, 30, 26, 20]],
    bakery: [["tray", 28, 34, 86, 34], ["herb-sprig", 12, 22, 26, 21], ["lemon", 84, 30, 28, 13]]
  };
  function counterArt(station) {
    var parts = COUNTER_PARTS[station] || COUNTER_PARTS.thali;
    return '<svg class="dish-svg" viewBox="0 0 120 84" aria-hidden="true" focusable="false">' +
      parts.map(function (pt) {
        return '<use href="' + SPR + pt[0] + '" x="' + pt[1] + '" y="' + pt[2] + '" width="' + pt[3] + '" height="' + pt[4] + '"/>';
      }).join("") + "</svg>";
  }

  function modField(m) {
    if (!m.mods) return "";
    var opts = m.mods.options.map(function (o, i) {
      var price = o.delta ? " · +" + money(o.delta) : "";
      var checked = (lastMod[m.id] === o.label || (!m.mods.required && i === 0 && !lastMod[m.id])) ? " checked" : "";
      return '<label class="mod"><input type="radio" name="mod-' + m.id + '" value="' + esc(o.label) + '"' + checked + ">" +
        "<span>" + esc(o.label) + price + "</span></label>";
    }).join("");
    return '<fieldset class="mods" data-mods="' + m.id + '"><legend>' + esc(m.mods.name) +
      (m.mods.required ? ' <span class="badge">Required</span>' : "") + "</legend>" +
      '<div class="mod-row">' + opts + "</div>" +
      '<p class="form-error" role="alert" data-mod-error="' + m.id + '" hidden></p></fieldset>';
  }

  function trayVariantRows(m) {
    var lines = trayLines(m.id);
    if (!lines.length) return "";
    return '<div class="on-tray"><p class="meta tray-note">On your tray — <a href="#/cart">review →</a></p>' +
      lines.map(function (k) {
        var li = lineInfo(k);
        var tag = li.variant ? " · " + esc(li.variant) : "";
        return '<p class="row"><span class="qty" role="group" aria-label="Quantity for ' + esc(m.name + tag) + '">' +
          '<button data-dec="' + esc(k) + '" aria-label="Remove one ' + esc(m.name + tag) + '">−</button>' +
          "<output aria-live=\"polite\">" + cart[k] + "</output>" +
          '<button data-inc="' + esc(k) + '" aria-label="Add one more ' + esc(m.name + tag) + '">+</button></span>' +
          '<span class="meta">' + cart[k] + " × " + esc(m.name) + tag + "</span></p>";
      }).join("") + "</div>";
  }

  /* Remembers the last chosen variant per dish so repeats stay fast (08 rule 8) */
  var lastMod = {};

  function menuRow(m) {
    var total = trayLines(m.id).reduce(function (n, k) { return n + cart[k]; }, 0);
    var needChoice = m.mods && m.mods.required && !lastMod[m.id];
    var disabled = needChoice ? " disabled" : "";
    return '<article class="menu-item">' + dishFrame(m) +
      "<div><h3>" + esc(m.name) + "</h3>" +
      '<p class="meta">' + esc(m.desc) + "</p>" +
      modField(m) +
      '<p class="row spread"><span class="price">' + money(m.price) +
      (m.mods ? ' <span class="meta">base</span>' : "") + "</span>" +
      '<button class="btn" data-add="' + m.id + '"' + disabled + ">" +
      (total ? "Add another · Place on tray" : "Add · Place on tray") + "</button></p>" +
      trayVariantRows(m) +
      "</div></article>";
  }

  function renderRestaurant(fresh) {
    var id = (location.hash.split("/")[2] || "").split("?")[0];
    var found = RESTAURANTS.filter(function (x) { return x.id === id; });
    var box = document.getElementById("restaurant-detail");
    if (!found.length) {
      box.classList.remove("enter");
      box.innerHTML = '<div class="tray-empty"><p><strong>This counter is closed.</strong></p>' +
        '<p class="meta">No kitchen matches “' + esc(id) + '”. It may have moved stations.</p>' +
        '<p><a class="btn secondary" href="#/">Back to discovery</a></p></div>';
      return;
    }
    var r = found[0];
    if (fresh) box.classList.add("enter"); else box.classList.remove("enter");
    var byId = {};
    r.menu.forEach(function (m) { byId[m.id] = m; });
    box.innerHTML =
      '<p class="meta"><a href="#/">← All counters</a> <span class="badge">Selected counter</span></p>' +
      '<div class="counter-hero"><span class="dish-frame">' + counterArt(r.station) + "</span>" +
      '<div><h2 class="section-title">' + esc(r.name) + "</h2>" +
      '<p class="section-note">' + esc(r.cuisine) + " · " + esc(r.eta) + " · " + esc(r.blurb) + "</p></div></div>" +
      r.sections.map(function (s) {
        return '<h3 class="menu-section"><span class="label">' + esc(s.title) + '</span> ' +
          '<span class="badge">' + s.items.length + (s.items.length === 1 ? " dish" : " dishes") + "</span></h3>" +
          s.items.map(function (mid) { return menuRow(byId[mid]); }).join("");
      }).join("");
  }

  /* ---------- Cart (packed collection): empty/editing/packed repack locally (15) ---------- */
  var editingFlash = false;
  function cartPageState(ids) {
    if (!ids.length) return "empty";
    return editingFlash ? "editing" : "packed";
  }
  function renderCart() {
    var box = document.getElementById("cart-detail");
    var ids = Object.keys(cart).filter(function (k) { return cart[k] > 0 && lineInfo(k); });
    var section = document.getElementById("route-cart");
    var pill = document.getElementById("cart-state");
    var state = cartPageState(ids);
    cartState = state === "editing" ? "editing" : state;
    if (section) section.setAttribute("data-cart-state", cartState);
    if (pill) {
      pill.textContent = cartState === "empty" ? "Empty tray"
        : cartState === "editing" ? "Editing…"
        : "Packed · " + cartCount() + (cartCount() === 1 ? " item" : " items");
      pill.className = "badge" + (cartState === "packed" ? " badge--success" : "");
    }
    if (!ids.length) {
      box.innerHTML = '<div class="tray-empty"><p><strong>Your tray is empty.</strong></p><p><a class="btn secondary" href="#/">Find something craving-worthy</a></p></div>';
      return;
    }
    var sub = cartSubtotal();
    var fee = 29;
    box.innerHTML = ids.map(function (k) {
      var li = lineInfo(k);
      var tag = li.variant ? " · " + esc(li.variant) : "";
      var deltaNote = (li.variant && li.unit !== li.m.price)
        ? ' <span class="meta">includes +' + money(li.unit - li.m.price) + " " + esc(li.variant.toLowerCase()) + "</span>" : "";
      var variantEdit = "";
      if (li.m.mods) {
        variantEdit = '<label class="meta variant-pick">Change ' + esc(li.m.mods.name.toLowerCase()) + ' <select data-variant-for="' + esc(k) + '" aria-label="Change ' + esc(li.m.mods.name) + " for " + esc(li.m.name) + '">' +
          li.m.mods.options.map(function (o) {
            return '<option value="' + esc(o.label) + '"' + (o.label === li.variant ? " selected" : "") + ">" + esc(o.label) + (o.delta ? " · +" + money(o.delta) : "") + "</option>";
          }).join("") + "</select></label>";
      }
      return '<article class="menu-item">' +
        '<div class="spread"><h3>' + esc(li.m.name) + tag + '</h3><span class="price">' + money(li.unit * cart[k]) + "</span></div>" +
        '<p class="meta">' + esc(li.m.restaurantName) + " · " + money(li.unit) + " each" + deltaNote + "</p>" +
        '<p class="row"><span class="qty" role="group" aria-label="Quantity for ' + esc(li.m.name + tag) + '">' +
        '<button data-dec="' + esc(k) + '" aria-label="Remove one">−</button><output aria-live="polite">' + cart[k] + "</output>" +
        '<button data-inc="' + esc(k) + '" aria-label="Add one more">+</button></span>' +
        '<button class="btn secondary" data-remove="' + esc(k) + '">Lift off tray</button></p>' +
        (variantEdit ? '<p class="row">' + variantEdit + "</p>" : "") + "</article>";
    }).join("") +
      '<div class="panel"><dl class="totals">' +
      "<div class=\"spread\"><dt>Subtotal</dt><dd>" + money(sub) + "</dd></div>" +
      "<div class=\"spread\"><dt>Delivery fee</dt><dd>" + money(fee) + "</dd></div>" +
      "<div class=\"spread\"><dt>Total</dt><dd>" + money(sub + fee) + "</dd></div>" +
      '</dl><p><a class="btn" href="#/checkout">Pack &amp; continue →</a></p></div>';
  }

  /* ---------- Checkout (calm station): checking-out state, fulfillment-aware (09) ---------- */
  var orderType = "delivery";
  function checkoutFee(ids) {
    if (!ids.length) return 0;
    return orderType === "pickup" ? 0 : 29;
  }
  function renderCheckout() {
    cartState = "checking-out";
    var section = document.getElementById("route-checkout");
    if (section) section.setAttribute("data-checkout-state", "checking-out");
    var ids = Object.keys(cart).filter(function (k) { return cart[k] > 0; });
    var sub = cartSubtotal(), fee = checkoutFee(ids);
    document.getElementById("checkout-total").textContent = money(sub + fee);
    var addr = document.getElementById("f-address");
    var note = document.getElementById("fulfill-note");
    addr.disabled = (orderType === "pickup");
    if (orderType === "pickup") addr.removeAttribute("required"); else addr.setAttribute("required", "required");
    note.textContent = orderType === "pickup"
      ? "Pickup at the counter · ready in ~25 min · no fee."
      : "Delivery to your door · arrives in ~35–45 min · ₹29 fee.";
    document.getElementById("checkout-summary").innerHTML = ids.length
      ? ids.map(function (k) {
          var li = lineInfo(k);
          if (!li) return "";
          var tag = li.variant ? " · " + esc(li.variant) : "";
          return '<p class="spread"><span>' + cart[k] + " × " + esc(li.m.name) + tag + "</span><strong>" + money(li.unit * cart[k]) + "</strong></p>";
        }).join("") + '<p class="spread"><span>Fee</span><strong>' + money(fee) + '</strong></p><p class="spread"><span>Total</span><strong>' + money(sub + fee) + "</strong></p>"
      : '<p class="meta">Tray is empty. <a href="#/">Add dishes first.</a></p>';
  }

  document.getElementById("checkout-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("f-name").value.trim();
    var addr = document.getElementById("f-address").value.trim();
    var pay = document.getElementById("f-pay").value;
    var err = document.getElementById("checkout-error");
    if (!name || !pay || (orderType === "delivery" && !addr)) {
      err.hidden = false;
      err.textContent = orderType === "delivery"
        ? "Blocked station: please add your name, address and payment to seal the order."
        : "Blocked station: please add your name and payment to seal the order.";
      err.focus();
      return;
    }
    if (!Object.keys(cart).filter(function (k) { return cart[k] > 0; }).length) {
      err.hidden = false;
      err.textContent = "Your tray is empty — add a dish before placing the order.";
      err.focus();
      return;
    }
    err.hidden = true;
    var orderId = "o" + Date.now().toString(36);
    var orders = loadOrders();
    var ids = Object.keys(cart).filter(function (k) { return cart[k] > 0; });
    orders.unshift({
      id: orderId, items: JSON.parse(JSON.stringify(cart)),
      total: cartSubtotal() + checkoutFee(ids), name: name, address: addr, pay: pay,
      fulfillment: orderType, status: 0, placedAt: new Date().toISOString()
    });
    try { localStorage.setItem("lk-orders", JSON.stringify(orders)); } catch (e2) {}
    cart = {}; persist();
    cartState = "confirmed";
    try { sessionStorage.setItem("lk-fresh", orderId); } catch (e2) {}
    location.hash = "#/order/" + orderId;
    toast("Ticket issued — order sealed.");
  });

  /* ---------- Shared focus helpers (17): capture before rebuild, resolve after ---------- */
  function captureFocus() {
    var ae = document.activeElement;
    if (!ae || !ae.closest || !ae.closest("#main")) return null;
    var attrs = ["id", "data-add", "data-inc", "data-dec", "data-remove", "data-reorder", "data-variant-for", "name"];
    for (var i = 0; i < attrs.length; i++) {
      var v = attrs[i] === "id" ? ae.id : ae.getAttribute(attrs[i]);
      if (v) return { attr: attrs[i] === "id" ? "id" : attrs[i], val: v };
    }
    return null;
  }
  function focusHead(r) {
    var head = document.querySelector("#route-" + r + " h1, #route-" + r + " h2");
    if (head) {
      head.setAttribute("tabindex", "-1");
      try { head.focus({ preventScroll: true }); } catch (e) { head.focus(); }
      return true;
    }
    return false;
  }
  function focusRestore(fd, r) {
    if (fd) {
      var sel = fd.attr === "id" ? "#" + fd.val : ".route.active [" + fd.attr + '="' + fd.val + '"]';
      var t = null;
      try { t = document.querySelector(sel); } catch (e) {}
      if (!t && fd.attr !== "id") {
        // Add morphs into a stepper: fall back to the same dish's new controls.
        var base = fd.val.split("|")[0];
        try {
          t = document.querySelector('.route.active [data-inc^="' + base + '"]') ||
              document.querySelector('.route.active [data-dec^="' + base + '"]');
        } catch (e2) {}
      }
      if (t && t.focus && !t.disabled) {
        try { t.focus({ preventScroll: true }); } catch (e3) { t.focus(); }
        return true;
      }
    }
    return focusHead(r);
  }

  /* Landing discipline: instant (not smooth) so fresh loads can't strand the
     scroll mid-flight; re-asserted once loading settles unless the user drove. */
  var userScrolled = false;
  ["wheel", "touchmove"].forEach(function (ev) {
    window.addEventListener(ev, function () { userScrolled = true; }, { passive: true });
  });
  function landOn(sec) {
    try {
      // Clamp-aware: short pages max out above the 76px ideal; instant so the
      // scroll can't strand mid-flight ("instant", not "auto", which inherits
      // CSS smooth and gets cancelled around navigation).
      var target = sec.getBoundingClientRect().top + window.scrollY - 76;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: Math.max(0, Math.min(target, max)), behavior: "instant" });
    } catch (e) { window.scrollTo(0, 0); }
  }
  window.addEventListener("load", function () {
    var r = currentRoute();
    if (!userScrolled && (r === "cart" || r === "checkout" || r === "order")) {
      var sec = document.getElementById("route-" + r);
      if (sec) landOn(sec);
    }
  });

  /* ---------- Tracking: the packed order becomes the traveler (08/10) ---------- */
  var MILESTONES = ["Confirmed", "Preparing", "Picked up", "Arriving", "Delivered"];
  var MILESTONE_ETAS = ["35–45 min", "30–40 min", "15–20 min", "5–10 min", "Arrived"];
  var JOURNEY_NODES = [[20, 70], [100, 45], [180, 62], [255, 64], [320, 50]];
  function loadOrders() {
    try { return JSON.parse(localStorage.getItem("lk-orders") || "[]"); } catch (e) { return []; }
  }
  function saveOrders(orders) {
    try { localStorage.setItem("lk-orders", JSON.stringify(orders)); } catch (e) {}
  }
  function journeySvg(order) {
    var nodes = JOURNEY_NODES.map(function (pt, i) {
      var cls = i < order.status ? "jnode done" : (i === order.status ? "jnode now" : "jnode");
      return '<circle class="' + cls + '" cx="' + pt[0] + '" cy="' + pt[1] + '" r="9"/>';
    }).join("");
    var at = JOURNEY_NODES[order.status];
    return '<svg class="journey-line" viewBox="0 0 340 120" role="img" aria-label="Journey map: order is ' +
      esc(MILESTONES[order.status]) + '">' +
      '<path d="M20 70 C100 20 260 110 320 50" fill="none" stroke="#D8CBA6" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/>' +
      nodes +
      '<g class="journey-pack" data-node="' + order.status + '" transform="translate(' + at[0] + "," + at[1] + ')">' +
      '<use href="assets/kitchen.svg#box" x="-15" y="-34" width="30" height="26"/></g></svg>';
  }
  function etaLine(order) {
    if (order.exception) return "Delayed — " + order.exception.eta + " (was " + MILESTONE_ETAS[order.status] + ")";
    var when = "";
    try { when = "Ordered " + new Date(order.placedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) + " · "; } catch (e) {}
    return when + (order.status >= 4 ? "Arrived — enjoy your meal" : "About " + MILESTONE_ETAS[order.status] + " away");
  }
  function renderOrder(animateFrom) {
    var id = (location.hash.split("/")[2] || "").split("?")[0];
    var order = loadOrders().filter(function (o) { return o.id === id; })[0];
    var box = document.getElementById("order-detail");
    if (!order) {
      box.innerHTML = '<h2 class="section-title">No ticket found</h2><p class="meta"><a href="#/">Back to discovery</a></p>';
      return;
    }
    // Packed → journey continuity: the fresh ticket prints in once, then rests (09).
    var fresh = false;
    try {
      if (sessionStorage.getItem("lk-fresh") === id) { fresh = true; sessionStorage.removeItem("lk-fresh"); }
    } catch (e) {}
    var items = Object.keys(order.items).map(function (k) {
      var li = lineInfo(k);
      var name = li ? li.m.name + (li.variant ? " · " + li.variant : "") : k;
      return "<li>" + order.items[k] + " × " + esc(name) + "</li>";
    }).join("");
    var exception = order.exception
      ? '<div class="exception" role="alert"><p><span class="badge">Kitchen issue</span> <strong>' + esc(order.exception.msg) + "</strong></p>" +
        '<p class="meta">New estimate: ' + esc(order.exception.eta) + ". Your pack is safe at the counter.</p>" +
        '<p class="row"><a class="btn secondary" href="tel:+911800123456">Call support</a>' +
        '<button class="btn secondary" id="resolve-btn">Back on track (demo)</button></p></div>'
      : "";
    box.innerHTML =
      '<p class="meta"><a href="#/orders">← All packs</a></p>' +
      '<h2 class="section-title">Ticket #' + esc(order.id) + '</h2>' +
      '<p><span class="status-pill' + (order.status >= 4 ? " ok" : "") + (order.exception ? " warn" : "") + '">' +
      (order.exception ? "Delayed · " : "") + esc(MILESTONES[order.status]) + '</span> ' +
      '<span class="meta" id="order-eta">' + esc(etaLine(order)) + "</span></p>" +
      '<p class="meta">Total ' + money(order.total) + " · " +
      (order.fulfillment === "pickup" ? "Pickup at the counter" : esc(order.address)) + "</p>" +
      exception +
      '<div class="ticket' + (fresh ? " print-in" : "") + '"><p class="ticket-head">Journey line — ' + esc(order.name) + "</p>" +
      journeySvg(order) +
      '<ol class="milestones">' + MILESTONES.map(function (m, i) {
        var cls = i < order.status ? "done" : (i === order.status ? "now" : "");
        var label = m + (i === order.status ? " — current" : (i < order.status ? " — done" : ""));
        return '<li class="' + cls + '" aria-current="' + (i === order.status ? "step" : "false") + '">' + esc(label) + "</li>";
      }).join("") + "</ol>" +
      "<ul class=\"meta\">" + items + "</ul>" +
      (order.status < 4
        ? '<p class="row"><button class="btn secondary" id="advance-btn">Simulate next milestone (demo)</button>' +
          (order.exception ? "" : '<button class="btn secondary" id="delay-btn">Simulate a delay (demo)</button>') + "</p>"
        : '<p class="notice">Arrived — package settled. Enjoy your meal.</p>') +
      "</div>";
    // The pack travels: marker glides old node → new node on advance (RM: jumps, 13).
    if (typeof animateFrom === "number" && animateFrom !== order.status && !reduceMotion) {
      var mark = box.querySelector(".journey-pack");
      var a = JOURNEY_NODES[animateFrom], b2 = JOURNEY_NODES[order.status];
      if (mark && a && b2) {
        mark.animate(
          [{ transform: "translate(" + a[0] + "px," + a[1] + "px)" }, { transform: "translate(" + b2[0] + "px," + b2[1] + "px)" }],
          { duration: 600, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" });
      }
    }
    var adv = document.getElementById("advance-btn");
    if (adv) adv.addEventListener("click", function () {
      var orders = loadOrders();
      var o = orders.filter(function (x) { return x.id === id; })[0];
      if (o && o.status < 4) {
        var from = o.status;
        var fd = captureFocus();
        o.status += 1;
        saveOrders(orders);
        renderOrder(from);
        focusRestore(fd, "order");
      }
    });
    var delay = document.getElementById("delay-btn");
    if (delay) delay.addEventListener("click", function () {
      var orders = loadOrders();
      var o = orders.filter(function (x) { return x.id === id; })[0];
      if (o && !o.exception) {
        var fd = captureFocus();
        o.exception = { msg: "Tandoor backup — your naan needs a fresh batch.", eta: "50–60 min" };
        saveOrders(orders);
        renderOrder();
        focusRestore(fd, "order");
      }
    });
    var resolve = document.getElementById("resolve-btn");
    if (resolve) resolve.addEventListener("click", function () {
      var orders = loadOrders();
      var o = orders.filter(function (x) { return x.id === id; })[0];
      if (o && o.exception) {
        var fd = captureFocus();
        o.exception = null;
        saveOrders(orders);
        renderOrder();
        focusRestore(fd, "order");
        toast("Kitchen recovered — journey resumed.");
      }
    });
  }

  function renderOrders() {
    var orders = loadOrders();
    var box = document.getElementById("orders-list");
    box.innerHTML = orders.map(function (o) {
      var n = Object.keys(o.items).reduce(function (a, k) { return a + o.items[k]; }, 0);
      return '<article class="counter"><h3>Pack #' + esc(o.id) + "</h3>" +
        '<p class="meta">' + n + " items · " + money(o.total) + " · " + esc(MILESTONES[o.status]) + "</p>" +
        '<p class="row"><a class="btn secondary" href="#/order/' + o.id + '">Track</a>' +
        '<button class="btn" data-reorder="' + o.id + '">Reconstruct in tray</button></p></article>';
    }).join("") || '<p class="meta">No prior packs yet. Place your first order to start the archive.</p>';
  }

  /* ---------- Global add/inc/dec/remove/reorder/retry (delegated) ---------- */
  /* Modifier choice enables the row's Add immediately (no animation, just state).
     Cart variant selects move a line to its new variant (editing, 15). */
  document.addEventListener("change", function (e) {
    var ful = e.target.closest ? e.target.closest('input[name="fulfill"]') : null;
    if (ful) {
      orderType = ful.value;
      renderCheckout();
      return;
    }
    var sel = e.target.closest ? e.target.closest("select[data-variant-for]") : null;
    if (sel) {
      var from = sel.getAttribute("data-variant-for");
      var li = lineInfo(from);
      if (li) {
        var to = li.m.id + (sel.value ? "|" + sel.value : "");
        if (to !== from) {
          cart[to] = (cart[to] || 0) + cart[from];
          delete cart[from];
          flagEdited();
          persist(); render();
          toast(li.m.name + " re-fired · " + sel.value);
        }
      }
      return;
    }
    var radio = e.target.closest ? e.target.closest('input[name^="mod-"]') : null;
    if (!radio) return;
    var id = radio.name.slice(4);
    var row = radio.closest(".menu-item");
    var add = row ? row.querySelector('[data-add="' + id + '"]') : null;
    var err = row ? row.querySelector('[data-mod-error="' + id + '"]') : null;
    if (add) add.disabled = false;
    if (err) err.hidden = true;
  });

  /* Assembly handoff: toast is immediate (functional confirmation first, 10);
     the tray stamp lands when the choreography's flight completes — or at once
     when motion is reduced / the stage is unavailable. */
  var assemblySeen = false;
  function toastAdded(key) {
    var li = lineInfo(key);
    if (li) toast(li.m.name + (li.variant ? " · " + li.variant : "") + " placed on tray · " + cart[key] + " ×");
  }
  function bumpTray() {
    var tray = document.querySelector('[data-nav="cart"]');
    if (tray && !reduceMotion) {
      tray.classList.remove("bump");
      void tray.offsetWidth;
      tray.classList.add("bump");
    }
  }
  function celebrateAdd(key) {
    // Success physics on the source card (15). Never blocks.
    // NOTE: runs after render(), so re-query the live DOM (the clicked node is detached).
    if (!reduceMotion) {
      var base = key.split("|")[0];
      var btn = document.querySelector('.route.active [data-add="' + base + '"], .route.active [data-inc="' + key + '"]');
      var card = btn ? btn.closest(".counter,.food-card,.menu-item") : null;
      if (card) {
        card.classList.remove("just-added");
        void card.offsetWidth;
        card.classList.add("just-added");
        setTimeout(function () { card.classList.remove("just-added"); }, 600);
      }
    }
    toastAdded(key);
    if (!reduceMotion && window.LKAssembly) {
      var live = document.querySelector('.route.active [data-add="' + key.split("|")[0] + '"], .route.active [data-inc="' + key + '"]');
      var frame = live ? live.closest(".counter,.food-card,.menu-item") : null;
      var dish = frame ? frame.querySelector(".dish-frame") : null;
      var li = lineInfo(key);
      if (dish && li) {
        window.LKAssembly.play({
          kind: li.m.art, name: li.m.name, variant: li.variant, qty: cart[key],
          first: !assemblySeen, rect: dish.getBoundingClientRect(), onLanded: bumpTray
        });
        assemblySeen = true;
        return;
      }
    }
    bumpTray();
  }

  /* Editing flash + local repack: the collection visibly re-settles (15) */
  function flagEdited() {
    if (currentRoute() !== "cart") return;
    editingFlash = true;
    setTimeout(function () {
      editingFlash = false;
      if (currentRoute() !== "cart") return;
      var pill = document.getElementById("cart-state");
      var section = document.getElementById("route-cart");
      if (pill) { pill.textContent = "Packed · " + cartCount() + (cartCount() === 1 ? " item" : " items"); pill.className = "badge badge--success"; }
      if (section) section.setAttribute("data-cart-state", "packed");
      cartState = "packed";
    }, 1500);
  }
  function repack() {
    if (currentRoute() !== "cart" || reduceMotion) return;
    var box = document.getElementById("cart-detail");
    box.classList.remove("enter");
    void box.offsetWidth;
    box.classList.add("enter");
  }

  /* ---------- Quick tray drawer: peek without leaving context (15) ---------- */
  function renderQuickTray() {
    var body = document.getElementById("quick-tray-body");
    var ids = Object.keys(cart).filter(function (k) { return cart[k] > 0 && lineInfo(k); });
    body.innerHTML = ids.length
      ? ids.map(function (k) {
          var li = lineInfo(k);
          var tag = li.variant ? " · " + esc(li.variant) : "";
          return '<p class="spread"><span>' + cart[k] + " × " + esc(li.m.name) + tag + "</span><strong>" + money(li.unit * cart[k]) + "</strong></p>";
        }).join("") +
        '<hr class="divider divider--dashed">' +
        '<p class="spread"><span>Subtotal' + (orderType === "pickup" ? " · pickup, no fee" : "") + "</span><strong>" + money(cartSubtotal() + checkoutFee(ids)) + "</strong></p>"
      : '<p class="meta">Tray is empty.</p>';
  }
  document.getElementById("tray-peek").addEventListener("click", function () {
    renderQuickTray();
    if (window.LKDrawer) window.LKDrawer.open("quick-tray");
  });
  // Keep the trigger's expanded state truthful across every close path (17).
  (function () {
    var peekBtn = document.getElementById("tray-peek");
    var drawer = document.getElementById("quick-tray");
    if (!peekBtn || !drawer || !window.MutationObserver) return;
    new MutationObserver(function () {
      peekBtn.setAttribute("aria-expanded", drawer.classList.contains("open") ? "true" : "false");
    }).observe(drawer, { attributes: true, attributeFilter: ["class"] });
  })();
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-drawer-nav]") && window.LKDrawer) {
      window.LKDrawer.close(); // let the hash navigation carry the user onward
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-retry-search]")) { renderSearch(); searchInput.focus(); return; }
    var t = e.target.closest("[data-add],[data-inc],[data-dec],[data-remove],[data-reorder]");
    if (!t) return;
    if (t.hasAttribute("data-add") || t.hasAttribute("data-inc")) {
      var base = t.getAttribute("data-add") || t.getAttribute("data-inc").split("|")[0];
      var m = MENU_INDEX[base];
      var key = t.hasAttribute("data-inc") ? t.getAttribute("data-inc") : base;
      if (t.hasAttribute("data-add") && m && m.mods) {
        // Physical choice first: required modifiers gate the add (13), validated semantically.
        var row = t.closest(".menu-item");
        var picked = row ? row.querySelector('input[name="mod-' + base + '"]:checked') : null;
        var choice = picked ? picked.value : "";
        if (m.mods.required && !choice) {
          var err = row ? row.querySelector('[data-mod-error="' + base + '"]') : null;
          if (err) {
            err.hidden = false;
            err.textContent = "Pick a " + m.mods.name.toLowerCase() + " first — the kitchen fires it to order.";
          }
          var first = row ? row.querySelector('input[name="mod-' + base + '"]') : null;
          if (first) first.focus();
          return;
        }
        if (choice && (m.mods.required || choice !== m.mods.options[0].label)) {
          key = base + "|" + choice;
          lastMod[base] = choice;
        }
      }
      cart[key] = (cart[key] || 0) + 1; // immediate functional confirmation (10)
      cartState = "adding";
      flagEdited();
      persist(); render();
      celebrateAdd(key);
      cartState = currentRoute() === "cart" ? cartState : "packed";
    } else if (t.hasAttribute("data-dec")) {
      var d = t.getAttribute("data-dec");
      cart[d] = Math.max(0, (cart[d] || 0) - 1);
      if (!cart[d]) delete cart[d];
      flagEdited();
      persist(); render();
      repack();
    } else if (t.hasAttribute("data-remove")) {
      delete cart[t.getAttribute("data-remove")];
      flagEdited();
      persist(); render(); toast("Lifted off the tray.");
      repack();
    } else if (t.hasAttribute("data-reorder")) {
      var orders = loadOrders();
      var o = orders.filter(function (x) { return x.id === t.getAttribute("data-reorder"); })[0];
      if (o) { cart = JSON.parse(JSON.stringify(o.items)); persist(); location.hash = "#/cart"; render(); toast("Prior pack reconstructed."); }
    }
  });

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  render();
})();
