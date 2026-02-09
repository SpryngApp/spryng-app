import { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export default function Input({ label, helperText, className, ...props }: InputProps) {
  return (
    <label className="block space-y-[var(--space-2)]">
      {label && <span className="text-[var(--text-sm)] font-medium text-[var(--color-text-subtle)]">{label}</span>}
      <input
        {...props}
        className={clsx(
          "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-base)] placeholder:text-slate-400 focus:border-[var(--color-teal)] focus:ring-2 focus:ring-[var(--color-teal)] focus:ring-offset-1 outline-none transition-shadow",
          className
        )}
      />
      {helperText && <small className="text-[var(--text-xs)] text-slate-500">{helperText}</small>}
    </label>
  );
}
