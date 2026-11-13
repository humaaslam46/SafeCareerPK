import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { useTheme } from "./ThemeContext.jsx";

export default function ScanHistoryChart({ history }) {
  const { theme } = useTheme();
  const axisColor = theme === "dark" ? "#9AA6B2" : "#5B6472";
  const gridColor = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)";
  const tooltipBg = theme === "dark" ? "#1B2433" : "#FFFFFF";
  const tooltipBorder = theme === "dark" ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.12)";
  const tooltipText = theme === "dark" ? "#F1F5F9" : "#0F172A";

  if (!history || history.length < 2) {
    return (
      <div className="analytics-empty">
        Scan a few postings and this will chart your risk-score trend for the session in
        real time.
      </div>
    );
  }

  const data = history.map((h, i) => ({ scan: `#${i + 1}`, score: h.score }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="historyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B6CFF" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#8B6CFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="scan"
          tick={{ fill: axisColor, fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: axisColor, fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }}
          axisLine={false}
          tickLine={false}
          width={34}
        />
        <Tooltip
          contentStyle={{
            background: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: 10,
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
            color: tooltipText,
          }}
          formatter={(value) => [`${value}/100`, "Risk Score"]}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#8B6CFF"
          strokeWidth={2.75}
          fill="url(#historyFill)"
          dot={{ r: 4, fill: "#8B6CFF", stroke: "#fff", strokeWidth: 1.5 }}
          isAnimationActive
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}