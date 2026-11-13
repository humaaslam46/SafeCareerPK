import { PieChart, Pie, Cell } from "recharts";

const COLOR_MAP = {
  "Low Risk": "#12D4A8",
  Caution: "#FFB020",
  "High Risk": "#FF4D6D",
};

export default function RiskDonut({ score, label }) {
  const color = COLOR_MAP[label] || "#12D4A8";
  const data = [
    { name: "score", value: score },
    { name: "remainder", value: 100 - score },
  ];

  return (
    <div className="risk-donut-wrap">
      <PieChart width={160} height={160}>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={58}
          outerRadius={74}
          startAngle={90}
          endAngle={-270}
          stroke="none"
          isAnimationActive
          animationDuration={800}
          animationEasing="ease-out"
        >
          <Cell fill={color} />
          <Cell fill="var(--donut-track)" />
        </Pie>
      </PieChart>
      <div className="risk-donut-center">
        <div className="risk-donut-score" style={{ color }}>
          {score}
        </div>
        <div className="risk-donut-max">/ 100</div>
      </div>
    </div>
  );
}