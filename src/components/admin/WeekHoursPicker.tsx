import { useState } from "react";
import type { WeekHours, DayKey } from "@/types";

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

interface DayState {
  closed: boolean;
  open: string;
  close: string;
}

function hoursToState(hours?: WeekHours): Record<DayKey, DayState> {
  const defaults: Record<DayKey, DayState> = {
    mon: { closed: false, open: "09:00", close: "17:00" },
    tue: { closed: false, open: "09:00", close: "17:00" },
    wed: { closed: false, open: "09:00", close: "17:00" },
    thu: { closed: false, open: "09:00", close: "17:00" },
    fri: { closed: false, open: "09:00", close: "17:00" },
    sat: { closed: true,  open: "10:00", close: "16:00" },
    sun: { closed: true,  open: "10:00", close: "16:00" },
  };
  if (!hours) return defaults;
  for (const day of DAYS) {
    const h = hours[day.key];
    defaults[day.key] = h ? { closed: false, open: h.open, close: h.close } : { ...defaults[day.key], closed: true };
  }
  return defaults;
}

function stateToHours(state: Record<DayKey, DayState>): WeekHours {
  const result = {} as WeekHours;
  for (const day of DAYS) {
    const d = state[day.key];
    result[day.key] = d.closed ? null : { open: d.open, close: d.close };
  }
  return result;
}

export function WeekHoursPicker({ defaultValue, name }: { defaultValue?: WeekHours; name: string }) {
  const [state, setState] = useState<Record<DayKey, DayState>>(() => hoursToState(defaultValue));

  const update = (key: DayKey, patch: Partial<DayState>) => {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(stateToHours(state))} />
      <div className="border-2 border-foreground divide-y divide-foreground/10">
        {DAYS.map(({ key, label }) => {
          const d = state[key];
          return (
            <div key={key} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-8 text-[10px] font-mono font-bold uppercase text-muted-foreground shrink-0">
                {label}
              </span>
              <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={d.closed}
                  onChange={(e) => update(key, { closed: e.target.checked })}
                  className="accent-foreground"
                />
                Closed
              </label>
              <div className={`flex items-center gap-2 flex-1 ${d.closed ? "opacity-30 pointer-events-none" : ""}`}>
                <input
                  type="time"
                  value={d.open}
                  onChange={(e) => update(key, { open: e.target.value })}
                  className="border border-foreground/30 px-2 py-1 font-mono text-xs bg-background focus:outline-none"
                />
                <span className="text-[10px] font-mono text-muted-foreground">to</span>
                <input
                  type="time"
                  value={d.close}
                  onChange={(e) => update(key, { close: e.target.value })}
                  className="border border-foreground/30 px-2 py-1 font-mono text-xs bg-background focus:outline-none"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
