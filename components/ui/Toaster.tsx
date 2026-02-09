"use client";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      closeButton
      toastOptions={{
        className: "border border-line bg-surface text-text shadow-soft",
      }}
    />
  );
}
