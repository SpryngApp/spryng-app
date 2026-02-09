"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  BadgeCheck,
  Banknote,
  Briefcase,
  Calendar,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardList,
  Coins,
  Factory,
  FileText,
  Heart,
  HeartHandshake,
  HelpCircle,
  Home,
  Landmark,
  MoreHorizontal,
  Repeat,
  Shuffle,
  Smile,
  Smartphone,
  Store,
  Timer,
  User,
  UserCog,
  Users,
  Wheat,
  Building2,
  Dot,
  type LucideIcon,
} from "lucide-react";

type TileOption = {
  value: string;
  label: string;
  helper?: string;
  icon?: string; // string name that maps to Lucide below
  disabled?: boolean;
};

type Props = {
  options: TileOption[];

  layout?: "tiles" | "list";
  columns?: 2 | 3 | 4;

  // single-select
  value?: string;
  onChange?: (value: string) => void;

  // multi-select
  multiple?: boolean;
  values?: string[];
  onToggle?: (value: string) => void;

  // optional search (useful for states)
  searchable?: boolean;
  searchPlaceholder?: string;
};

const ICONS: Record<string, LucideIcon> = {
  Store,
  Home,
  Wheat,
  HeartHandshake,
  Landmark,
  HelpCircle,
  User,
  Badge,
  Users,
  Building2,
  Factory,
  Heart,
  FileText,
  CheckCircle2,
  Circle,
  UserCog,
  Smile,
  BadgeCheck,
  Smartphone,
  MoreHorizontal,
  Briefcase,
  ClipboardList,
  Shuffle,
  Coins,
  Banknote,
  Calendar,
  CalendarDays,
  Timer,
  CalendarClock,
  Repeat,
  Dot,
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Icon({ name }: { name?: string }) {
  const Cmp = (name && ICONS[name]) || HelpCircle;
  return <Cmp className="h-5 w-5 text-slate-700" aria-hidden="true" />;
}

export default function TileGrid({
  options,
  layout = "tiles",
  columns = 2,
  value = "",
  onChange,
  multiple = false,
  values = [],
  onToggle,
  searchable = false,
  searchPlaceholder = "Search…",
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchable) return options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const hay = `${o.label} ${o.value}`.toLowerCase();
      return hay.includes(q);
    });
  }, [options, query, searchable]);

  const gridCols =
    columns === 4 ? "grid-cols-2 sm:grid-cols-4" : columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2";

  const listMode = layout === "list";

  return (
    <div className="grid gap-3">
      {searchable ? (
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className={cx(
              "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900",
              "placeholder:text-slate-400 focus:border-[var(--spryng-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--spryng-accent)]/15"
            )}
          />
        </div>
      ) : null}

      <div className={cx("grid gap-3", listMode ? "grid-cols-1" : `grid ${gridCols}`)}>
        {filtered.map((opt) => {
          const selected = multiple ? values.includes(opt.value) : value === opt.value;
          const disabled = !!opt.disabled;

          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                if (multiple) onToggle?.(opt.value);
                else onChange?.(opt.value);
              }}
              aria-pressed={selected}
              className={cx(
                "group flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
                listMode ? "justify-between" : "",
                selected
                  ? "border-[var(--spryng-accent)] bg-[color:var(--spryng-accent)]/5 ring-2 ring-[color:var(--spryng-accent)]/20"
                  : "border-slate-200 bg-white hover:bg-slate-50",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white">
                <Icon name={opt.icon} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-slate-900">{opt.label}</p>
                  <span
                    className={cx(
                      "h-4 w-4 rounded-full border transition",
                      selected
                        ? "border-[var(--spryng-accent)] bg-[var(--spryng-accent)]"
                        : "border-slate-300 bg-white"
                    )}
                    aria-hidden="true"
                  />
                </div>
                {opt.helper ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">{opt.helper}</p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {searchable && filtered.length === 0 ? (
        <p className="text-xs text-slate-500">No matches. Try a different search.</p>
      ) : null}
    </div>
  );
}
