import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// 🔑 Custom tooltip content — reads the score straight off the hovered
// data point instead of relying on Recharts' default key-matching, so
// it can never silently show a stale/mismatched value.
function CustomScoreTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  const score = payload[0]?.value;

  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        border: "1px solid #334155",
        borderRadius: "8px",
        padding: "8px 12px",
      }}
    >
      <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.75rem" }}>{label}</p>
      <p style={{ color: "#c084fc", margin: "4px 0 0", fontWeight: 700 }}>
        Score: {score ?? 0}%
      </p>
    </div>
  );
}

export default function ScoreChart({ liveData = [] }) { // Added default empty array fallback
  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
      <h2 className="text-xl font-semibold mb-6">
        Score Trend
      </h2>
      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <LineChart data={liveData}>
          <XAxis dataKey="day" stroke="#64748b" />
          <YAxis domain={[0, 100]} stroke="#64748b" />
          <Tooltip content={<CustomScoreTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#c084fc" 
            strokeWidth={3}
            dot={{ fill: '#ffffff', stroke: '#c084fc', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
