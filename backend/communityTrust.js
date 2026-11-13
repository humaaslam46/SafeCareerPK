/**
 * communityTrust.js
 *
 * Crowdsourced trust layer: users report a platform/company name as
 * either a scam experience or a confirmed-legitimate experience. Reports
 * accumulate into a simple trust score per platform.
 *
 * For the hackathon build this uses in-memory storage (resets on
 * server restart) rather than a database — that's a deliberate scope
 * choice, not an oversight. See README for how this would move to
 * MongoDB for a production version.
 */

let reports = [
  { id: "seed-1", platformName: "Rozee.pk", type: "legit", comment: "Applied and got a real interview, legitimate company.", createdAt: "2026-08-10T09:00:00Z" },
  { id: "seed-2", platformName: "QuickEarnPK", type: "scam", comment: "Asked for a Rs 1500 registration fee before any work started, then stopped responding.", createdAt: "2026-08-12T14:30:00Z" },
  { id: "seed-3", platformName: "QuickEarnPK", type: "scam", comment: "Same experience — paid a fee, never heard back.", createdAt: "2026-08-14T11:15:00Z" },
  { id: "seed-4", platformName: "EasyWorkHome", type: "scam", comment: "Asked me to come alone to an apartment for the 'interview.' Did not go.", createdAt: "2026-08-15T16:45:00Z" },
  { id: "seed-5", platformName: "Systems Limited", type: "legit", comment: "Real onboarding process, proper office interview.", createdAt: "2026-08-16T10:00:00Z" },
  { id: "seed-6", platformName: "FastCashJobs", type: "scam", comment: "Certification fee requested for an 'internship' that never materialized.", createdAt: "2026-08-18T13:20:00Z" },
];

function addReport({ platformName, type, comment }) {
  const report = {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    platformName: platformName.trim(),
    type, // "scam" | "legit"
    comment: (comment || "").trim(),
    createdAt: new Date().toISOString(),
  };
  reports.push(report);
  return report;
}

function getAggregatedReports() {
  const byPlatform = {};

  for (const r of reports) {
    const key = r.platformName.toLowerCase();
    if (!byPlatform[key]) {
      byPlatform[key] = {
        platformName: r.platformName,
        scamReports: 0,
        legitReports: 0,
        recentComments: [],
      };
    }
    if (r.type === "scam") byPlatform[key].scamReports += 1;
    if (r.type === "legit") byPlatform[key].legitReports += 1;
    byPlatform[key].recentComments.push({ type: r.type, comment: r.comment, createdAt: r.createdAt });
  }

  const list = Object.values(byPlatform).map((p) => {
    const total = p.scamReports + p.legitReports;
    const trustScore = total === 0 ? 50 : Math.round((p.legitReports / total) * 100);
    return {
      ...p,
      totalReports: total,
      trustScore,
      recentComments: p.recentComments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3),
    };
  });

  return list.sort((a, b) => b.totalReports - a.totalReports);
}

module.exports = { addReport, getAggregatedReports };
