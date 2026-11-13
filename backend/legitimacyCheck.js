/**
 * legitimacyCheck.js
 *
 * Checks whether the company/platform behind a job posting shows real
 * signals of being a legitimate, verifiable entity — or shows the
 * opposite: no verifiable domain, a known scam platform name, or only
 * free-email contact with no company presence at all.
 *
 * This module produces BOTH negative flags (red flags) and positive
 * signals (green flags) — most scam detectors only ever tell you what's
 * wrong. Showing "this looks legitimate because X" is symmetrical,
 * honest, and mirrors the same "assist, don't just alarm" principle
 * used throughout this project.
 */

const dns = require("dns").promises;

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "rocketmail.com",
  "aol.com",
]);

// Small manually-curated list of platforms previously reported for
// scam-like behavior. Intended to grow — see README for how to extend it.
const KNOWN_SCAM_PLATFORMS = [
  "quickearnpk",
  "easyworkhome",
  "fastcashjobs",
  "homebasedearningpk",
  "onlinejobspk247",
];

// Small manually-curated list of widely-recognized, genuinely legitimate
// Pakistani employers/platforms, used only to generate a positive signal
// when a posting plausibly references one — never used to auto-clear
// a posting on its own, since scammers can also just type a real name.
const KNOWN_LEGIT_PLATFORMS = [
  "rozee.pk",
  "systemsltd.com",
  "netsolgroup.com",
  "careem.com",
  "bykea.com",
  "daraz.pk",
  "jazz.com.pk",
  "engro.com",
];

function extractEmailAddresses(text) {
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  return matches || [];
}

function extractDomainFromEmail(email) {
  return email.split("@")[1]?.toLowerCase();
}

async function domainResolves(domain) {
  try {
    // Try MX first (mail-capable), fall back to A record (site exists)
    await dns.resolveMx(domain);
    return true;
  } catch {
    try {
      await dns.resolve4(domain);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * @param {string} text - job posting text
 * @returns {Promise<{ flags: Array, positiveSignals: Array, legitimacyScore: number, checked: boolean }>}
 */
async function runLegitimacyCheck(text) {
  const flags = [];
  const positiveSignals = [];
  const lowerText = text.toLowerCase();
  let checked = false; // did this layer actually have anything to evaluate?

  // ---- Known scam platform check ----
  const scamMatch = KNOWN_SCAM_PLATFORMS.find((name) => lowerText.includes(name));
  if (scamMatch) {
    checked = true;
    flags.push({
      id: `legitimacy:known_scam:${scamMatch}`,
      category: "legitimacy",
      severity: "high",
      reason: `"${scamMatch}" matches a platform name previously reported for scam-like behavior.`,
    });
  }

  // ---- Known legitimate platform mention (positive signal only) ----
  const legitMatch = KNOWN_LEGIT_PLATFORMS.find((name) => lowerText.includes(name));
  if (legitMatch) {
    checked = true;
    positiveSignals.push({
      id: `legitimacy:known_legit:${legitMatch}`,
      reason: `Mentions "${legitMatch}", a recognized platform/employer — worth noting, but always verify independently rather than relying on a name match alone.`,
    });
  }

  // ---- Email domain checks ----
  const emails = extractEmailAddresses(text);
  let anyCompanyDomainVerified = false;

  for (const email of emails.slice(0, 3)) {
    // cap to avoid excessive DNS calls on long/spammy text
    const domain = extractDomainFromEmail(email);
    if (!domain) continue;

    if (FREE_EMAIL_DOMAINS.has(domain)) {
      continue; // already covered by the rule engine's generic-contact check
    }

    checked = true;
    const resolves = await domainResolves(domain);
    if (resolves) {
      anyCompanyDomainVerified = true;
    } else {
      flags.push({
        id: `legitimacy:unresolvable_domain:${domain}`,
        category: "legitimacy",
        severity: "high",
        reason: `The email domain "${domain}" doesn't appear to be a real, active domain — this is a strong sign the company may not actually exist.`,
      });
    }
  }

  if (anyCompanyDomainVerified) {
    positiveSignals.push({
      id: "legitimacy:domain_verified",
      reason: "The company's email domain is a real, active domain — a good basic sign, though not proof on its own.",
    });
  }

  // ---- Score ----
  let legitimacyScore = 0;
  for (const flag of flags) {
    legitimacyScore += flag.severity === "high" ? 30 : 15;
  }
  legitimacyScore = Math.min(legitimacyScore, 100);

  return { flags, positiveSignals, legitimacyScore, checked };
}

module.exports = { runLegitimacyCheck, KNOWN_SCAM_PLATFORMS, KNOWN_LEGIT_PLATFORMS };
