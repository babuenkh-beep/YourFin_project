import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function FormSection({ title, subtitle, icon, children }: FormSectionProps) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          {icon && <span className="text-brand-600">{icon}</span>}
          <h2 className="text-2xl font-bold text-navy-800">{title}</h2>
        </div>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}