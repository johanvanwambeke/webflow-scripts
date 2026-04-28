//this script belongs in the global <head> custom code and captures UTM params + click IDs into localStorage on first touch (30-day window). Downstream scripts (e.g. send-form.js) read 'utm_data' for attribution.

(function () {
  const STORAGE_KEY = "utm_data";
  const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;
  const TRACKED_PARAMS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "fbclid",
  ];

  const DEBUG = /[?&]debug=1/.test(window.location.search);
  const log = (...args) => DEBUG && console.log("utm-capture:", ...args);

  const params = new URLSearchParams(window.location.search);
  const captured = {};
  TRACKED_PARAMS.forEach((key) => {
    const value = params.get(key);
    if (value) captured[key] = value;
  });

  if (Object.keys(captured).length === 0) return;

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed && typeof parsed.expires_at === "number" && parsed.expires_at > Date.now()) {
        log("existing first-touch entry preserved", parsed);
        return;
      }
    }

    const now = Date.now();
    const entry = {
      params: captured,
      landing_page: window.location.href.split("?")[0],
      referrer: document.referrer || "(direct)",
      timestamp: now,
      expires_at: now + EXPIRY_MS,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    log("first-touch entry written", entry);
  } catch (e) {
    console.warn("utm-capture: localStorage unavailable", e);
  }
})();
