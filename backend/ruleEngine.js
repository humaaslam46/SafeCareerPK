/**
 * ruleEngine.js
 *
 * Fast, deterministic, no-API-cost checks for common job-scam patterns
 * seen in Pakistani job postings. This runs alongside (not instead of)
 * the LLM tone-analysis layer added later — this file is the reliable
 * fallback that always works, even if the AI call is slow or fails.
 *
 * Each check returns a flag object if triggered:
 *   { id, category, severity, reason }
 * severity: "high" | "medium" | "low" — used to weight the final score.
 */

// ---- Pattern groups -------------------------------------------------

const FEE_PATTERNS = [
  /registration\s*fee/i,
  /security\s*(fee|deposit)/i,
  /processing\s*fee/i,
  /confirmation\s*fee/i,
  /certification\s*fee/i,
  /training\s*fee/i,
  /advance\s*(amount|payment|fee)/i,
  /send\s*(money|amount|rs\.?|pkr)/i,
  /pay\s*(before|first|to\s*confirm|to\s*proceed)/i,
  /joining\s*fee/i,
  /deposit\s*required/i,
];

const URGENCY_NO_INVESTMENT_PATTERNS = [
  /urgent(ly)?\s*hiring/i,
  /no\s*investment/i,
  /no\s*experience\s*(required|needed)/i,
  /limited\s*seats?/i,
  /apply\s*(now|today)\s*only/i,
  /hurry\s*up/i,
  /only\s*\d+\s*(seats?|positions?)\s*(left|available)/i,
  /females?\s*(only|required|needed)/i, // flagged as a pattern common in this specific scam type; NOT a judgment on genuinely legitimate women-focused hiring, see note in README
];

const UNREALISTIC_SALARY_PATTERNS = [
  /earn\s*(rs\.?|pkr)?\s*\d{3,}\s*(daily|per\s*day)/i,
  /guaranteed\s*income/i,
  /earn\s*(rs\.?|pkr)?\s*\d{4,}\s*(weekly|per\s*week)/i,
  /easy\s*money/i,
  /work\s*\d\s*hours?.*earn.*\d{4,}/i,
];

const GENERIC_CONTACT_PATTERNS = [
  /whatsapp\s*only/i,
  /contact\s*(on|via)?\s*whatsapp/i,
  /@gmail\.com/i,
  /@yahoo\.com/i,
  /@hotmail\.com/i,
];

const NO_COMPANY_INFO_PATTERNS = [
  /no\s*company\s*name/i, // rarely literal, but kept for completeness
];

const INTERVIEW_SAFETY_PATTERNS = [
  /come\s*alone/i,
  /meet\s*(at|near)\s*(my|our)?\s*(house|home|apartment|flat)/i,
  /video\s*call\s*not\s*(allowed|possible|available)/i,
  /interview\s*(only\s*)?in\s*person/i,
  /bring\s*cash/i,
  /no\s*office\s*address/i,
  /personal\s*(residence|address)/i,
  /late\s*(night|evening)\s*interview/i,
  /don'?t\s*(tell|inform)\s*(anyone|family|parents)/i,
  /keep\s*this\s*confidential/i,
  /unmarked\s*(location|building|office)/i,
  /no\s*(landmark|signboard)/i,
  /isolated\s*(area|location|place)/i,
  /meet\s*(outside|at)\s*(a\s*)?parking/i,
  /guest\s*house/i,
  /hotel\s*room/i,
  /no\s*female\s*staff/i,
  /come\s*(without|alone,?\s*without)\s*(family|friends|anyone)/i,
  /avoid\s*bringing\s*(anyone|family)/i,
  /interview\s*(after|past)\s*\d{1,2}\s*(pm|p\.m)/i,
  /share\s*(your\s*)?(live\s*)?location/i,
];

// ---- Helper -----------------------------------------------------------

function scanPatterns(text, patterns, category, severity, reasonTemplate) {
  const flags = [];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      flags.push({
        id: `${category}:${pattern.source}`,
        category,
        severity,
        reason: reasonTemplate(match[0]),
      });
    }
  }
  return flags;
}

// ---- Main entry point ---------------------------------------------------

/**
 * Runs all rule-based checks against a job posting's text.
 * @param {string} rawText
 * @returns {{ flags: Array, ruleScore: number }}
 */
function runRuleEngine(rawText) {
  const text = (rawText || "").toString();

  let flags = [];

  flags = flags.concat(
    scanPatterns(
      text,
      FEE_PATTERNS,
      "fee_extraction",
      "high",
      (m) =>
        `Mentions "${m}" — legitimate employers never ask you to pay before, during, or after hiring.`
    )
  );

  flags = flags.concat(
    scanPatterns(
      text,
      URGENCY_NO_INVESTMENT_PATTERNS,
      "urgency_language",
      "medium",
      (m) =>
        `Uses "${m}" — urgency and "no investment" phrasing is a common lure in fee-extraction and low-value work scams.`
    )
  );

  flags = flags.concat(
    scanPatterns(
      text,
      UNREALISTIC_SALARY_PATTERNS,
      "unrealistic_salary",
      "medium",
      (m) =>
        `Mentions "${m}" — unusually high pay for vague or unspecified work is a common scam signal.`
    )
  );

  flags = flags.concat(
    scanPatterns(
      text,
      GENERIC_CONTACT_PATTERNS,
      "generic_contact",
      "low",
      (m) =>
        `Contact method "${m}" — legitimate companies usually list a company-domain email or official channel, not only a personal WhatsApp/free email address.`
    )
  );

  flags = flags.concat(
    scanPatterns(
      text,
      INTERVIEW_SAFETY_PATTERNS,
      "interview_safety",
      "high",
      (m) =>
        `Mentions "${m}" — this is a pattern seen in cases where applicants (often women) were lured to unsafe, unverifiable locations. Never attend an interview alone at a non-office address.`
    )
  );

  // ---- Score calculation ----
  // high severity flags weigh the most since fee-extraction and
  // interview-safety risks are the most serious real-world outcomes.
  const weights = { high: 30, medium: 15, low: 7 };
  let ruleScore = 0;
  for (const flag of flags) {
    ruleScore += weights[flag.severity] || 0;
  }
  ruleScore = Math.min(ruleScore, 100);

  return { flags, ruleScore };
}

module.exports = { runRuleEngine };
