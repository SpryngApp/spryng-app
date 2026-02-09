"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/(dashboard)", label: "Overview" },
  { href: "/(dashboard)/transactions", label: "Transactions" },
  { href: "/(dashboard)/reports", label: "Reports" },
  { href: "/(dashboard)/documents", label: "Documents" },
  { href: "/(dashboard)/goals", label: "Goals" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <div className="h-full flex flex-col">
      <div className="h-16 border-b border-line px-4 flex items-center gap-2">
        <div className="h-7 w-7 rounded-md bg-primary" />
        <span className="font-semibold">Elevyn</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((it) => {
          const active = path === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`block rounded-lg px-3 py-2 text-sm
                ${active ? "bg-[#10141c] text-text border border-line" : "text-subtle hover:text-text"}`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 text-xs text-subtle border-t border-line">
        Employer Readiness Software™
      </div>
    </div>
  );
}
