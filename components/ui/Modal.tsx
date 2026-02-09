import { ReactNode } from "react";
import Button from "./Button";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children?: ReactNode;
}

export default function Modal({ open, title, description, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] p-[var(--space-6)] max-w-lg w-full mx-[var(--space-4)] animate-slide-up">
        <header className="mb-[var(--space-4)]">
          <h2 className="text-[var(--text-xl)] font-semibold">{title}</h2>
          {description && <p className="text-[var(--color-text-subtle)] text-[var(--text-base)] mt-[var(--space-1)]">{description}</p>}
        </header>
        <div className="space-y-[var(--space-4)]">{children}</div>
        <footer className="mt-[var(--space-6)] flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </footer>
      </div>
    </div>
  );
}
