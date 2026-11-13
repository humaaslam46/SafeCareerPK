import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTheme } from "./ThemeContext.jsx";

const COLORS = {
  "Rule Engine": "#4F7DFB",
  Legitimacy: "#12D4A8",
  "AI Analysis": "#FFB020",
};

export default function LayerDonut({ ruleScore, legitimacyScore, aiScore, aiAvailable }) {
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "#C7D0DA" : "#334155";
  const tooltipBg = theme === "dark" ? "#1B2433" : "#FFFFFF";
  const tooltipBorder = theme === "dark" ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.12)";

  const raw = [
    { name: "Rule Engine", value: ruleScore },
    { name: "Legitimacy", value: legitimacyScore },
  ];
  if (aiAvailable) raw.push({ name: "AI Analysis", value: aiScore });

  const total = raw.reduce((sum, d) => sum + d.value, 0);
  const data = total === 0 ? raw.map((d) => ({ ...d, value: 1 })) : raw;
  const isEmpty = total === 0;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="46%"
          innerRadius={52}
          outerRadius={72}
          paddingAngle={3}
          stroke="none"
          isAnimationActive
          animationDuration={700}
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={isEmpty ? "rgba(127,127,127,0.18)" : COLORS[entry.name]}
            />
          ))}
        </Pie>
        {!isEmpty && (
          <Tooltip
            contentStyle={{
              background: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 10,
              fontSize: 12,
              fontFamily: "Inter, sans-serif",
            }}
            formatter={(value, name) => [`${value}/100`, name]}
          />
        )}
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ color: textColor, fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}