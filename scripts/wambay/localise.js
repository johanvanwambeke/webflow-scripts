/**
 * Wambay — Localise Script
 * Redirect gebruikers naar NL of EN versie op basis van browsertaal
 */
const userLang = navigator.language || navigator.userLanguage;
const isDutch = userLang.startsWith("nl");
const currentURL = window.location.href;
const domain = window.location.origin;
const path = window.location.pathname;

const isDutchPage = currentURL.includes("/nl");
const shouldRedirectToDutch = isDutch && !isDutchPage;
const shouldRedirectToEnglish = !isDutch && isDutchPage;

if (shouldRedirectToDutch) {
  window.location.href = `${domain}/nl${path}`;
} else if (shouldRedirectToEnglish) {
  window.location.href = `${domain}${path.replace("/nl", "")}`;
}
