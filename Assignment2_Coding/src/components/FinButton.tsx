import type { ReactNode, MouseEventHandler } from "react";
import { Loader2 } from "lucide-react";

interface FinButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
}

export default function FinButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
  type = "button",
  icon,
}: FinButtonProps) {
  const isDisabled = disabled || loading;

  const base =
    "flex items-center justify-center gap-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer";

  const variantClasses =
    variant === "primary"
      ? "px-8 py-3 text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
      : "px-6 py-3 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50";

  const disabledClasses = isDisabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${base} ${variantClasses} ${disabledClasses}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="flex items-center">{icon}</span>
      )}
      {children}
    </button>
  );
}