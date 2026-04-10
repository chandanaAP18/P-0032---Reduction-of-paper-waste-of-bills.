export default function AnalyticsChart({ data = [], bars = [], line = [], height = 220 }) {
  if (!data.length) {
    return <div className="rounded-xl border border-dashed border-ink-700 bg-ink-900/30 p-6 text-sm text-ink-400">No chart data yet.</div>;
  }

  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [...bars.map((key) => Number(item[key] || 0)), ...line.map((key) => Number(item[key] || 0))])
  );
  const chartHeight = height - 40;
  const step = data.length > 1 ? 100 / (data.length - 1) : 100;
  const linePoints = line.map((key) => {
    const points = data
      .map((item, index) => {
        const x = data.length === 1 ? 50 : index * step;
        const y = chartHeight - (Number(item[key] || 0) / maxValue) * chartHeight + 10;
        return `${x},${y}`;
      })
      .join(' ');
    return { key, points };
  });

  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900/30 p-4">
      <svg viewBox={`0 0 100 ${height}`} className="w-full h-auto overflow-visible">
        {[0, 1, 2, 3].map((tick) => {
          const y = 10 + (chartHeight / 3) * tick;
          return <line key={tick} x1="0" y1={y} x2="100" y2={y} stroke="#334e68" strokeDasharray="2 2" />;
        })}

        {data.map((item, index) => {
          const baseX = data.length === 1 ? 44 : index * step - 4;
          return (
            <g key={item.key || index}>
              {bars.map((key, barIndex) => {
                const width = bars.length > 1 ? 3 : 6;
                const x = baseX + barIndex * (width + 1);
                const value = Number(item[key] || 0);
                const barHeight = (value / maxValue) * chartHeight;
                const y = chartHeight - barHeight + 10;
                const colors = ['#22c55e', '#f59e0b', '#60a5fa'];
                return <rect key={key} x={x} y={y} width={width} height={barHeight} rx="1" fill={colors[barIndex % colors.length]} />;
              })}
              <text x={data.length === 1 ? 50 : index * step} y={height - 4} textAnchor="middle" fill="#9fb3c8" fontSize="4">{item.label}</text>
            </g>
          );
        })}

        {linePoints.map((series, index) => {
          const colors = ['#bbf7d0', '#fcd34d'];
          return <polyline key={series.key} points={series.points} fill="none" stroke={colors[index % colors.length]} strokeWidth="1.5" />;
        })}
      </svg>
    </div>
  );
}
