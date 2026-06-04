import { useState } from 'react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getColor(count) {
  if (count === 0) return { bg: 'rgba(255,255,255,0.05)', glow: 'none' };
  if (count === 1) return { bg: 'rgba(37, 99, 235,0.20)', glow: 'none' };
  if (count === 2) return { bg: 'rgba(37, 99, 235,0.40)', glow: '0 0 4px rgba(37, 99, 235,0.20)' };
  if (count === 3) return { bg: 'rgba(37, 99, 235,0.65)', glow: '0 0 6px rgba(37, 99, 235,0.30)' };
  return { bg: '#3b82f6', glow: '0 0 10px rgba(59, 130, 246,0.45)' };
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function HeatMap({ activityLog = [] }) {
  const weeks = 16;
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const [tooltip, setTooltip] = useState(null); // { x, y, date, count }

  const grid = [];
  const monthMarkers = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + (6 - d)));
      const key = date.toISOString().split('T')[0];
      const entry = activityLog.find(e => e.date === key);
      week.push({ date: key, count: entry?.count || 0, month: date.getMonth(), day: date.getDate() });
    }
    // Track month label at start of month
    const firstDay = week[0];
    if (firstDay.day <= 7) {
      monthMarkers.push({ week: weeks - 1 - w, month: firstDay.month });
    }
    grid.push(week);
  }

  return (
    <div className="relative select-none">
      {/* Month labels */}
      <div className="flex ml-8 mb-1 relative" style={{ gap: '3px' }}>
        {grid.map((week, wi) => {
          const marker = monthMarkers.find(m => m.week === wi);
          return (
            <div key={wi} className="w-3.5 shrink-0 text-[8px] font-mono" style={{ color: 'var(--text-4)', minWidth: '14px' }}>
              {marker ? MONTHS[marker.month] : ''}
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col mr-1.5 pt-0" style={{ gap: '3px' }}>
          {dayLabels.map((d, i) => (
            <span key={i} className="text-[8px] font-mono text-right w-6 leading-none"
              style={{ color: 'var(--text-4)', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {i % 2 === 0 ? d.slice(0, 1) : ''}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="relative flex" style={{ gap: '3px' }}>
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: '3px' }}>
              {week.map((cell, di) => {
                const { bg, glow } = getColor(cell.count);
                return (
                  <div key={di}
                    className="rounded-sm cursor-pointer transition-all duration-150"
                    style={{
                      width: '14px', height: '14px',
                      background: bg,
                      boxShadow: glow,
                      transform: 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.4)';
                      e.currentTarget.style.zIndex = '10';
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parent = e.currentTarget.closest('.relative').getBoundingClientRect();
                      setTooltip({
                        x: rect.left - parent.left + rect.width / 2,
                        y: rect.top - parent.top,
                        date: cell.date,
                        count: cell.count,
                      });
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.zIndex = '';
                      setTooltip(null);
                    }}
                  />
                );
              })}
            </div>
          ))}

          {/* Tooltip */}
          {tooltip && (
            <div className="absolute z-20 pointer-events-none"
              style={{
                left: tooltip.x,
                top: tooltip.y - 46,
                transform: 'translateX(-50%)',
              }}>
              <div className="px-2.5 py-1.5 rounded-lg text-center whitespace-nowrap"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border-md)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}>
                <p className="text-[11px] font-bold" style={{ color: tooltip.count > 0 ? '#3b82f6' : 'var(--text-2)' }}>
                  {tooltip.count > 0 ? `${tooltip.count} activit${tooltip.count === 1 ? 'y' : 'ies'}` : 'No activity'}
                </p>
                <p className="text-[9px] font-mono" style={{ color: 'var(--text-3)' }}>{formatDate(tooltip.date)}</p>
              </div>
              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-2 h-1 overflow-hidden">
                  <div className="w-2 h-2 rotate-45 -translate-y-1"
                    style={{ background: 'var(--card)', border: '1px solid var(--border-md)' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[9px] font-mono" style={{ color: 'var(--text-4)' }}>Less</span>
        {[0, 1, 2, 3, 4].map(i => {
          const { bg, glow } = getColor(i);
          return (
            <div key={i} className="rounded-sm"
              style={{ width: '11px', height: '11px', background: bg, boxShadow: glow }} />
          );
        })}
        <span className="text-[9px] font-mono" style={{ color: 'var(--text-4)' }}>More</span>
      </div>
    </div>
  );
}
