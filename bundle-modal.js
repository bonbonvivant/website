(function () {
    // ── Stripe payment links: STRIPE_URLS[bundle size][shipping region] ──────
    const STRIPE_URLS = {
        "5": {
            "nl":       "https://buy.stripe.com/8x2bIU3Rwa3B5YiaDy2sM02",
            "uk":       "https://buy.stripe.com/dRmeV65ZEgrZ0DY12Y2sM06",
            "de":       "https://buy.stripe.com/dRm3coco27VtfyS9zu2sM0a",
            "fr-be-lu": "https://buy.stripe.com/6oUcMY2Ns2B9aey9zu2sM0e",
            "eu-rest":  "https://buy.stripe.com/8x28wIds60t1euO3b62sM0i",
        },
        "10": {
            "nl":       "https://buy.stripe.com/3cIdR20FkgrZfySeTO2sM03",
            "uk":       "https://buy.stripe.com/8x214g1JoejR4Ue12Y2sM07",
            "de":       "https://buy.stripe.com/5kQ00cafUcbJ2M62722sM0b",
            "fr-be-lu": "https://buy.stripe.com/8x27sEafU2B9euOdPK2sM0f",
            "eu-rest":  "https://buy.stripe.com/8x26oA4VA8Zx1I2aDy2sM0j",
        },
        "30": {
            "nl":       "https://buy.stripe.com/7sY14g87Ma3B9au8vq2sM04",
            "uk":       "https://buy.stripe.com/5kQ6oAds6grZ4Ue2722sM08",
            "de":       "https://buy.stripe.com/5kQbIU73I1x5biCh1W2sM0c",
            "fr-be-lu": "https://buy.stripe.com/7sY8wIafUa3BcmG4fa2sM0g",
            "eu-rest":  "https://buy.stripe.com/eVq4gs5ZE6Rp4Ue9zu2sM0k",
        },
        "50": {
            "nl":       "https://buy.stripe.com/5kQ28k2NsdfN2M6bHC2sM05",
            "uk":       "https://buy.stripe.com/00w14gco24JhcmGaDy2sM09",
            "de":       "https://buy.stripe.com/6oU9AM3RwcbJaey2722sM0d",
            "fr-be-lu": "https://buy.stripe.com/bJe4gsbjYa3B1I22722sM0h",
            "eu-rest":  "https://buy.stripe.com/bJedR20FkdfNgCW4fa2sM0l",
        },
    };

    const openBtn        = document.getElementById("open-bundle-modal");
    const bundleModal    = document.getElementById("bundle-modal");
    const closeBundleBtn = document.getElementById("close-bundle-modal");

    const shippingModal    = document.getElementById("shipping-modal");
    const closeShippingBtn = document.getElementById("close-shipping-modal");
    const backBtn          = document.getElementById("back-to-bundles");

    if (!openBtn || !bundleModal || !shippingModal) return;

    let lastActiveEl   = null;
    let selectedBundle = null;

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
        selectedBundle       = null;
        unlockScroll();
        if (lastActiveEl && typeof lastActiveEl.focus === "function") lastActiveEl.focus();
    }

    openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openBundleModal();
    });

    // Bundle card → store the size key, advance to shipping step
    bundleModal.querySelectorAll(".bundle-card").forEach((card) => {
        card.addEventListener("click", (e) => {
            e.preventDefault();
            selectedBundle = card.dataset.bundle;
            openShippingModal();
        });
    });

    // Shipping card → look up the correct Stripe URL and open it
    shippingModal.querySelectorAll(".shipping-card").forEach((card) => {
        card.addEventListener("click", () => {
            const url = STRIPE_URLS[selectedBundle]?.[card.dataset.region];
            if (url) window.open(url, "_blank", "noopener,noreferrer");
            closeAll();
        });
    });

    closeBundleBtn?.addEventListener("click", closeAll);
    closeShippingBtn?.addEventListener("click", closeAll);
    backBtn?.addEventListener("click", openBundleModal);

    bundleModal.addEventListener("click",   (e) => { if (e.target === bundleModal)   closeAll(); });
    shippingModal.addEventListener("click", (e) => { if (e.target === shippingModal) closeAll(); });

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
