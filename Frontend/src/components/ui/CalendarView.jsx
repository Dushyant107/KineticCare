import React from 'react';

export const CalendarView = ({
  calendarData = {}, // Map of "YYYY-MM-DD" -> { active: boolean, sessions: number }
  monthName = 'September 2026',
}) => {
  const daysInMonth = 30; // standard month grid representation
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-09-${String(dayNum).padStart(2, '0')}`;
    const data = calendarData[dateStr];
    return {
      dayNum,
      dateStr,
      active: data ? data.active : false,
      sessions: data ? data.sessions : 0,
    };
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-800">{monthName}</h4>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-600">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" />
            <span className="text-slate-600">Rest Day</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => (
          <div
            key={d.dateStr}
            className={`h-10 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all ${
              d.active
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{d.dayNum}</span>
            {d.active && <span className="text-[9px] opacity-90">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
