/**
 * ocr.js
 *
 * Extracts text from an uploaded job-posting screenshot using Tesseract.js
 * so the scanner works on images (Facebook/WhatsApp/OLX screenshots), not
 * just pasted text — most real scam postings are shared as images, not text.
 *
 * IMPORTANT: by default Tesseract.js downloads its English language data
 * from a public CDN (cdn.jsdelivr.net) the first time it runs. That's a
 * real risk for a live demo — if venue wifi is weak/blocked, OCR would
 * simply fail on stage. Instead, this points Tesseract at the
 * @tesseract.js-data/eng package, which ships the same trained-data file
 * locally inside node_modules, so OCR works fully offline after `npm
 * install` with no runtime dependency on an external CDN.
 */

const path = require("path");
const Tesseract = require("tesseract.js");

const LOCAL_LANG_PATH = path.join(
  __dirname,
  "node_modules",
  "@tesseract.js-data",
  "eng",
  "4.0.0_best_int"
);

/**
 * @param {Buffer} imageBuffer
 * @returns {Promise<{ text: string, confidence: number }>}
 */
async function extractTextFromImage(imageBuffer) {
  const { data } = await Tesseract.recognize(imageBuffer, "eng", {
    langPath: LOCAL_LANG_PATH,
    cacheMethod: "none",
    gzip: true,
    logger: () => {}, // silence per-tile progress logs
  });

  return {
    text: (data.text || "").trim(),
    confidence: data.confidence || 0,
  };
}

module.exports = { extractTextFromImage };
