"use client";

import * as React from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        closeButton
        richColors
        expand
        toastOptions={{
          duration: 4500,
          classNames: {
            toast:
              "rounded-xl border border-slate-200 bg-white/90 backdrop-blur shadow-lg",
            title: "text-sm font-semibold text-slate-900",
            description: "text-sm text-slate-600",
            actionButton:
              "rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800",
            cancelButton:
              "rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200",
          },
        }}
      />
    </>
  );
}
