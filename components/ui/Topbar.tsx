"use client";
import * as React from "react";

export default function Topbar() {
  const [companyName, setCompanyName] = React.useState("Your Company");
  return (
    <div className="h-16 border-b border-line px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-sm text-subtle">Workspace</div>
        <button className="rounded-xl border border-line bg-surface px-3 py-2 text-sm">
          {companyName}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-subtle hover:text-text"
          title="Alerts"
          onClick={() => window.location.assign("/(dashboard)/alerts")}
        >
          🔔
        </button>
        <button
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-subtle hover:text-text"
          title="Profile"
        >
          ☺
        </button>
      </div>
    </div>
  );
}
