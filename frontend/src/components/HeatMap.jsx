export default function HeatMap({ activityLog = [] }) {
  // Build a 7x12 grid (12 weeks)
  const weeks = 12;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const today = new Date();
  const grid = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + (6 - d)));
      const key = date.toISOString().split('T')[0];
      const entry = activityLog.find((e) => e.date === key);
      week.push({ date: key, count: entry?.count || 0 });
    }
    grid.push(week);
  }

  const getColor = (count) => {
    if (count === 0) return 'bg-white/5';
    if (count === 1) return 'bg-eco-900';
    if (count === 2) return 'bg-eco-700';
    if (count === 3) return 'bg-eco-600';
    return 'bg-eco-500';
  };

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <div className="flex flex-col gap-0.5 mr-1">
          {days.map((d, i) => (
            <span key={i} className="text-[9px] text-white/30 w-3 text-right">{d}</span>
          ))}
        </div>
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((cell, di) => (
              <div
                key={di}
                title={`${cell.date}: ${cell.count} activities`}
                className={`w-3 h-3 rounded-sm ${getColor(cell.count)} transition-all hover:scale-125 cursor-pointer`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-1 justify-end">
        <span className="text-[9px] text-white/30">Less</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-sm ${getColor(i)}`} />
        ))}
        <span className="text-[9px] text-white/30">More</span>
      </div>
    </div>
  );
}
