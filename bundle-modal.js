/**
 * File: bundle-modal.js
 */

(function () {
  const openBtn = document.getElementById("open-bundle-modal");
  const modal = document.getElementById("bundle-modal");
  const closeBtn = document.getElementById("close-bundle-modal");

  if (!openBtn || !modal || !closeBtn) return;

  let lastActiveEl = null;

  function getFocusableElements() {
    return modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  }

  function openModal() {
    lastActiveEl = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";

    const focusables = getFocusableElements();
    (focusables[0] || closeBtn).focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastActiveEl && typeof lastActiveEl.focus === "function") lastActiveEl.focus();
  }

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });

  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(); // backdrop click
  });

    // Close the modal after choosing any bundle (links open in a new tab)
    modal.querySelectorAll(".bundle-card").forEach((card) => {
    card.addEventListener("click", () => {
        // allow the browser to open the new tab first
        setTimeout(() => closeModal(), 0);
    });
    });

  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key === "Tab") {
      const focusables = Array.from(getFocusableElements());
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();