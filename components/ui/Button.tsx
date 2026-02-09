import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
};

export default function Button({
  variant = "primary",
  loading,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        {
          "bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] focus-visible:outline-[var(--color-focus)]":
            variant === "primary",
          "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-teal)]":
            variant === "secondary",
          "text-[var(--color-text-subtle)] hover:text-[var(--color-text)]":
            variant === "ghost",
        },
        loading && "opacity-60 cursor-not-allowed",
        className,
        "px-[var(--space-4)] py-[var(--space-2)]"
      )}
    >
      {loading ? "…" : children}
    </button>
  );
}
