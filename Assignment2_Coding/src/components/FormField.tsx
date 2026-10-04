import type { ChangeEvent } from "react";
import FinInput from "./FinInput";

interface BaseFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  prefix?: string;
  suffix?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "password" | "number" | "date";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onBlur?: () => void;
}

interface SelectFieldProps extends BaseFieldProps {
  type: "select";
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

type FormFieldProps = InputFieldProps | SelectFieldProps;

export default function FormField(props: FormFieldProps) {
  const { label, error, required, helpText, suffix } = props;

  if (props.type === "select") {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-navy-700 mb-1.5">
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </label>
        <select
          value={props.value}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => props.onChange(e.target.value)}
          className={`w-full h-11 rounded-lg border px-4 text-sm text-navy-800 transition-all duration-200 outline-none appearance-none cursor-pointer bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E")] bg-[position:right_12px_center] bg-no-repeat pr-10 ${error ? "border-error-500 bg-error-50" : "border-slate-200 bg-white hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"}`}
        >
          <option value="">{props.placeholder || "Select an option..."}</option>
          {props.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-xs text-error-500">{error}</p>
        )}
      </div>
    );
  }

  return (
    <FinInput
      label={label}
      value={props.value}
      onChange={props.onChange}
      type={props.type}
      placeholder={props.placeholder}
      error={error}
      helpText={helpText}
      required={required}
      suffix={suffix}
      onBlur={"onBlur" in props ? props.onBlur : undefined}
    />
  );
}