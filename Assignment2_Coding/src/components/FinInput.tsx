import { useState } from "react";
import type { ChangeEvent } from "react";
import { AlertCircle } from "lucide-react";

interface FinInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "number" | "date";
  placeholder?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  suffix?: string;
  disabled?: boolean;
  onBlur?: () => void;
}

export default function FinInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  helpText,
  required = false,
  suffix,
  disabled = false,
  onBlur,
}: FinInputProps) {
  const [focused, setFocused] = useState(false);

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  const inputClasses = `
    w-full h-11 rounded-lg border px-4 text-sm text-navy-800
    placeholder:text-slate-400 transition-all duration-200 outline-none
    ${disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed" : ""}
    ${
      error
        ? "border-error-500 bg-error-50 focus:border-error-500 focus:ring-2 focus:ring-error-100"
        : focused
          ? "border-brand-500 bg-white focus:ring-2 focus:ring-brand-100"
          : "border-slate-200 bg-white hover:border-slate-300"
    }
    ${suffix ? "pr-14" : ""}
  `;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-navy-700 mb-1.5">
        {label}
        {required && <span className="text-error-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold tracking-wide pointer-events-none z-10 uppercase">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-error-500">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs">{error}</span>
        </div>
      )}
      {helpText && !error && (
        <p className="text-xs text-slate-400 mt-1.5">{helpText}</p>
      )}
    </div>
  );
}