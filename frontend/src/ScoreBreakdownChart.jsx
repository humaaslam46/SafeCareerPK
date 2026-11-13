import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";

const COLORS = {
  "Rule Engine": "#8b7cf6",
  Legitimacy: "#2dd4bf",
  "AI Analysis": "#fbbf24",
};

export default function ScoreBreakdownChart({ ruleScore, legitimacyScore, aiScore, aiAvailable }) {
  const data = [
    { name: "Rule Engine", value: ruleScore },
    { name: "Legitimacy", value: legitimacyScore },
  ];
  if (aiAvailable) {
    data.push({ name: "AI Analysis", value: aiScore });
  }

  return (
    <ResponsiveContainer width="100%" height={aiAvailable ? 150 : 120}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          tick={{ fill: "#b7c2cc", fontSize: 12, fontFamily: "IBM Plex Mono, monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{
            background: "rgba(13,27,46,0.95)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
            color: "#eef3f7",
          }}
          formatter={(value) => [`${value}/100`, "Score"]}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18} isAnimationActive animationDuration={700}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
