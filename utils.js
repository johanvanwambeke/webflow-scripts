/**
 * Wambay — Shared Webflow Utilities
 * Beschikbaar voor alle clients via _shared/utils.js
 */

const Wambay = {
  /**
   * Wacht tot een element in de DOM bestaat
   */
  waitFor(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`waitFor: "${selector}" not found within ${timeout}ms`));
      }, timeout);
    });
  },

  /**
   * Voeg een class toe na X ms (handig voor intro-animaties)
   */
  delayedClass(selector, className, delay = 100) {
    setTimeout(() => {
      const el = document.querySelector(selector);
      if (el) el.classList.add(className);
    }, delay);
  },

  /**
   * Log alleen in development (Webflow preview / localhost)
   */
  log(...args) {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname.includes('.webflow.io')
    ) {
      console.log('[Wambay]', ...args);
    }
  },
};

window.Wambay = Wambay;
