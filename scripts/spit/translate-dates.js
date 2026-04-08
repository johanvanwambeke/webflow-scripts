/**
 * Spit — Vertaal Engelse datums naar Nederlands
 * Dependencies (externe scripts in Webflow):
 *   - dayjs
 *   - dayjs/plugin/customParseFormat
 *   - dayjs/locale/nl
 */
dayjs.extend(dayjs_plugin_customParseFormat);

const dateElements = document.querySelectorAll(".blog-card__date, .article-date");

dateElements.forEach(function (el) {
  const originalText = el.innerText.trim();
  const parsedDate = dayjs(originalText, "MMMM D, YYYY", "en");

  if (parsedDate.isValid()) {
    el.innerText = parsedDate.locale("nl").format("MMMM YYYY");
  }
});
