"use client";

import { useState } from "react";

export type CalItem = { date: string; color: string; title: string }; // date = YYYY-MM-DD

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function keyOf(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function AvailabilityCalendar({ items }: { items: CalItem[] }) {
  // erste Karte auf den Monat des ersten Termins setzen (oder aktueller Monat)
  const first = items[0]?.date;
  const init = first ? new Date(first + "T00:00:00") : new Date();
  const [view, setView] = useState({ y: init.getFullYear(), m: init.getMonth() });

  // Termine je Tag
  const byDay = new Map<string, CalItem[]>();
  for (const it of items) {
    const arr = byDay.get(it.date) ?? [];
    arr.push(it);
    byDay.set(it.date, arr);
  }
  // Legende (eindeutige Kurse)
  const legend = Array.from(new Map(items.map((i) => [i.title, i.color])).entries());

  const firstOfMonth = new Date(view.y, view.m, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Mo=0
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shift = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div className="rounded-[20px] border bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => shift(-1)} className="rounded-lg px-3 py-1.5 text-sm hover:bg-soft-2" aria-label="Vorheriger Monat">←</button>
        <div className="font-[family-name:var(--font-heading)] text-lg text-navy">{MONTHS[view.m]} {view.y}</div>
        <button onClick={() => shift(1)} className="rounded-lg px-3 py-1.5 text-sm hover:bg-soft-2" aria-label="Nächster Monat">→</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {WEEKDAYS.map((w) => <div key={w} className="py-1 font-medium">{w}</div>)}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const its = byDay.get(keyOf(view.y, view.m, day)) ?? [];
          const has = its.length > 0;
          return (
            <div
              key={i}
              className={`relative aspect-square rounded-lg border p-1 ${has ? "border-transparent" : "border-transparent bg-soft-2/30"}`}
              style={has ? { backgroundColor: `${its[0].color}22` } : undefined}
              title={its.map((x) => x.title).join(", ")}
            >
              <div className={`text-[11px] ${has ? "font-semibold text-foreground" : "text-muted"}`}>{day}</div>
              {has && (
                <div className="absolute inset-x-0 bottom-1 flex justify-center gap-0.5">
                  {Array.from(new Set(its.map((x) => x.color))).slice(0, 3).map((c, j) => (
                    <span key={j} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {legend.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 border-t pt-3 text-xs text-muted">
          {legend.map(([title, color]) => (
            <span key={title} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} /> {title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
