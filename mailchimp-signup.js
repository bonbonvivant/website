/**
 * File: mailchimp-signup.js
 *
 * Mailchimp client-side submit: JSONP (post-json + c=callback) to avoid CORS.
 */

(function () {
  const form = document.getElementById("mc-form");
  if (!form) return;

  const emailInput = form.querySelector('input[name="EMAIL"]');
  const honeypot = form.querySelector('input[name^="b_"]');
  const submitBtn = document.getElementById("mc-submit");

  const successEl = document.getElementById("mc-success");
  const errorEl = document.getElementById("mc-error");

  const originalBtnText = submitBtn ? submitBtn.textContent : "";

  function clearMessages() {
    if (successEl) successEl.hidden = true;
    if (errorEl) errorEl.hidden = true;
    form.classList.remove("is-error");
    form.classList.remove("is-success");
  }

  function showSuccess(message) {
    if (errorEl) errorEl.hidden = true;
    if (successEl) {
      successEl.textContent = message;
      successEl.hidden = false;
    }
    form.classList.remove("is-error");
    form.classList.add("is-success");
  }

  function showError(message) {
    if (successEl) successEl.hidden = true;
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
    form.classList.remove("is-success");
    form.classList.add("is-error");
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;

    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("is-loading", isLoading);
    submitBtn.setAttribute("aria-busy", String(isLoading));
    submitBtn.textContent = isLoading ? "joining..." : originalBtnText;
  }

  function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || div.innerText || "").trim();
  }

  function toPostJsonUrl(actionUrl) {
    const decoded = actionUrl.replace(/&amp;/g, "&");
    const postJson = decoded.replace("/subscribe/post?", "/subscribe/post-json?");
    return postJson.includes("c=") ? postJson : `${postJson}&c=__CALLBACK__`;
  }

  function buildQuery(params) {
    return Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");
  }

  function jsonp(urlWithPlaceholder) {
    return new Promise((resolve, reject) => {
      const callbackName = "mc_cb_" + Math.random().toString(36).slice(2);

      const script = document.createElement("script");
      const cleanup = () => {
        try {
          delete window[callbackName];
        } catch (_) {
          window[callbackName] = undefined;
        }
        script.remove();
      };

      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error("JSONP request failed"));
      };

      script.src = urlWithPlaceholder.replace("__CALLBACK__", callbackName);
      document.body.appendChild(script);
    });
  }

  // NEW: clear error state as user starts typing
  if (emailInput) {
    emailInput.addEventListener("input", () => {
      if (form.classList.contains("is-error")) clearMessages();
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearMessages();

    const action = form.getAttribute("data-mailchimp-action") || "";
    const email = (emailInput?.value || "").trim();
    const trap = (honeypot?.value || "").trim();

    if (!email) {
      showError("Please enter your email address.");
      emailInput?.focus();
      return;
    }

    if (emailInput && !emailInput.checkValidity()) {
      showError("Please enter a valid email address.");
      emailInput.focus();
      return;
    }

    if (trap) {
      showSuccess("Thanks! You're on the list.");
      form.reset();
      return;
    }

    setLoading(true);

    try {
      const base = toPostJsonUrl(action);

      const params = { EMAIL: email };
      if (honeypot?.name) params[honeypot.name] = "";

      const glue = base.includes("?") ? "&" : "?";
      const url = `${base}${glue}${buildQuery(params)}`;

      const data = await jsonp(url);

      const result = (data?.result || "").toLowerCase();
      const msg = stripHtml(data?.msg || "");

      if (result === "success") {
        showSuccess("Thanks! You're on the list.");
        form.reset();
        return;
      }

      const lower = msg.toLowerCase();

      if (lower.includes("already subscribed")) {
        showSuccess("You're already on the list — welcome back!");
        return;
      }

      if (lower.includes("too many subscribe attempts")) {
        showError("Too many attempts. Please try again in a little bit.");
        return;
      }

      if (lower.includes("not a valid email")) {
        showError("That email address doesn’t look valid.");
        emailInput?.focus();
        return;
      }

      showError(msg || "Something went wrong. Please try again.");
    } catch (err) {
      showError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  });
})();