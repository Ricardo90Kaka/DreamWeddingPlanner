"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
};

const variants = {
  primary:
    "bg-[var(--accent-strong)] text-white shadow-[0_14px_35px_rgba(64,90,71,0.24)] hover:bg-[#304638]",
  secondary:
    "bg-[var(--accent-soft)] text-[var(--accent-strong)] hover:bg-[#cfddce]",
  ghost:
    "bg-white/70 text-[var(--foreground)] hover:bg-white",
  danger:
    "bg-[#a05244] text-white hover:bg-[#8d4034]",
};

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-70 ${variants[variant]} ${className}`}
    >
      {pending ? pendingLabel ?? "Opslaan..." : children}
    </button>
  );
}
