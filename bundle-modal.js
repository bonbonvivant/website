(function () {
    const openBtn        = document.getElementById("open-bundle-modal");
    const bundleModal    = document.getElementById("bundle-modal");
    const closeBundleBtn = document.getElementById("close-bundle-modal");

    const shippingModal    = document.getElementById("shipping-modal");
    const closeShippingBtn = document.getElementById("close-shipping-modal");
    const backBtn          = document.getElementById("back-to-bundles");

    if (!openBtn || !bundleModal || !shippingModal) return;

    let lastActiveEl      = null;
    let selectedBundleUrl = null;

    function getFocusables(modal) {
        return modal.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
    }

    function lockScroll()   { document.body.style.overflow = "hidden"; }
    function unlockScroll() { document.body.style.overflow = ""; }

    function openBundleModal() {
        lastActiveEl = document.activeElement;
        shippingModal.hidden = true;
        bundleModal.hidden   = false;
        lockScroll();
        const focusables = getFocusables(bundleModal);
        (focusables[0] || closeBundleBtn).focus();
    }

    function openShippingModal() {
        bundleModal.hidden   = true;
        shippingModal.hidden = false;
        const focusables = getFocusables(shippingModal);
        (focusables[0] || closeShippingBtn).focus();
    }

    function closeAll() {
        bundleModal.hidden   = true;
        shippingModal.hidden = true;
        selectedBundleUrl    = null;
        unlockScroll();
        if (lastActiveEl && typeof lastActiveEl.focus === "function") lastActiveEl.focus();
    }

    // Open bundle modal
    openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openBundleModal();
    });

    // Bundle card click → store URL, advance to shipping step
    bundleModal.querySelectorAll(".bundle-card").forEach((card) => {
        card.addEventListener("click", (e) => {
            e.preventDefault();
            selectedBundleUrl = card.getAttribute("href");
            openShippingModal();
        });
    });

    // Shipping card click → open Stripe URL, close both modals
    // To use per-region Stripe URLs later, add data-url-<region> attributes on each
    // .bundle-card and read card.dataset["url" + region] here instead.
    shippingModal.querySelectorAll(".shipping-card").forEach((card) => {
        card.addEventListener("click", () => {
            if (selectedBundleUrl) {
                window.open(selectedBundleUrl, "_blank", "noopener,noreferrer");
            }
            closeAll();
        });
    });

    closeBundleBtn?.addEventListener("click", closeAll);
    closeShippingBtn?.addEventListener("click", closeAll);
    backBtn?.addEventListener("click", openBundleModal);

    // Backdrop clicks
    bundleModal.addEventListener("click",   (e) => { if (e.target === bundleModal)   closeAll(); });
    shippingModal.addEventListener("click", (e) => { if (e.target === shippingModal) closeAll(); });

    // Escape key + focus trap for whichever modal is active
    document.addEventListener("keydown", (e) => {
        const active = !bundleModal.hidden   ? bundleModal
                     : !shippingModal.hidden ? shippingModal
                     : null;
        if (!active) return;

        if (e.key === "Escape") { e.preventDefault(); closeAll(); return; }

        if (e.key === "Tab") {
            const focusables = Array.from(getFocusables(active));
            if (!focusables.length) return;
            const first = focusables[0];
            const last  = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault(); first.focus();
            }
        }
    });
})();
