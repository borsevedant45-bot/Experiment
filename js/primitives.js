/* Living Kitchen — reusable primitive controllers (15/17).
   LKDrawer: physical tray metaphor over semantic dialog behavior.
   No auto-init and no product wiring here; callers opt in. */
window.LKDrawer = (function () {
  "use strict";

  var openId = null;
  var lastFocus = null;

  function focusables(root) {
    return Array.prototype.slice.call(
      root.querySelectorAll('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  function show(id) {
    var drawer = document.getElementById(id);
    if (!drawer || !drawer.classList.contains("drawer")) return false;
    lastFocus = document.activeElement;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    var backdrop = document.querySelector("[data-drawer-backdrop]");
    if (backdrop) backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
    var targets = focusables(drawer);
    (targets[0] || drawer).focus();
    openId = id;
    return true;
  }

  function hide() {
    if (!openId) return false;
    var drawer = document.getElementById(openId);
    if (drawer) {
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
    }
    var backdrop = document.querySelector("[data-drawer-backdrop]");
    if (backdrop) backdrop.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus(); // return focus (17)
    openId = null;
    return true;
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hide();
    // Lightweight focus containment while a drawer is open (17).
    if (e.key === "Tab" && openId) {
      var drawer = document.getElementById(openId);
      var targets = drawer ? focusables(drawer) : [];
      if (!targets.length) return;
      var first = targets[0], last = targets[targets.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-drawer-backdrop]")) hide();
    var closer = e.target.closest("[data-drawer-close]");
    if (closer) hide();
  });

  return { open: show, close: hide, get openId() { return openId; } };
})();
