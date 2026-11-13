/**
 * wageTheft.js
 *
 * A simpler report log for a different failure mode than the other
 * checks in this app: cases where the hiring itself was real and the
 * work was actually done, but payment never came. This isn't something
 * a scam-post scanner can catch in advance — it only becomes visible
 * after the fact, which is exactly why a shared, growing record of
 * reports is valuable: the next job-seeker can see the pattern before
 * they accept the job.
 *
 * In-memory storage for the hackathon build — see README for the
 * production-database note.
 */

let reports = [
  {
    id: "seed-1",
    companyName: "BrightLeaf Marketing",
    description: "Completed a 2-week content writing project, was told payment would come after 'final review,' never received it after repeated follow-ups.",
    amountOwed: "Rs 15,000",
    createdAt: "2026-08-09T08:00:00Z",
  },
  {
    id: "seed-2",
    companyName: "QuickEarnPK",
    description: "Delivered 30 data-entry tasks as instructed, account was 'suspended' right before the payout date with no explanation.",
    amountOwed: "Rs 6,000",
    createdAt: "2026-08-13T12:00:00Z",
  },
  {
    id: "seed-3",
    companyName: "Zenith Digital Solutions",
    description: "Worked as a freelance graphic designer for one month, employer stopped responding after the final deliverables were sent.",
    amountOwed: "Rs 22,000",
    createdAt: "2026-08-17T15:30:00Z",
  },
];

function addReport({ companyName, description, amountOwed }) {
  const report = {
    id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    companyName: companyName.trim(),
    description: (description || "").trim(),
    amountOwed: (amountOwed || "").trim(),
    createdAt: new Date().toISOString(),
  };
  reports.push(report);
  return report;
}

function getReports() {
  return [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = { addReport, getReports };
