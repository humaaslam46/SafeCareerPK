const LAYER_META = {
  overall: { label: "Overall Risk", color: null }, // color set dynamically by risk label
  rule: { label: "Rule Engine", color: "#4F7DFB" },
  legitimacy: { label: "Legitimacy", color: "#12D4A8" },
  ai: { label: "AI Analysis", color: "#FFB020" },
};

const RISK_COLOR = {
  "Low Risk": "#12D4A8",
  Caution: "#FFB020",
  "High Risk": "#FF4D6D",
};

function KpiCard({ label, score, color }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color }}>
        {score}
        <span className="kpi-max">/100</span>
      </div>
      <div className="kpi-bar-track">
        <div className="kpi-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export default function KpiRow({ riskScore, riskLabel, ruleScore, legitimacyScore, aiScore, aiAvailable }) {
  return (
    <div className="kpi-row">
      <KpiCard label={LAYER_META.overall.label} score={riskScore} color={RISK_COLOR[riskLabel]} />
      <KpiCard label={LAYER_META.rule.label} score={ruleScore} color={LAYER_META.rule.color} />
      <KpiCard label={LAYER_META.legitimacy.label} score={legitimacyScore} color={LAYER_META.legitimacy.color} />
      {aiAvailable && (
        <KpiCard label={LAYER_META.ai.label} score={aiScore} color={LAYER_META.ai.color} />
      )}
    </div>
  );
}