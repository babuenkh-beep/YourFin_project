import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, DollarSign } from "lucide-react";
import Layout from "../components/Layout";
import ProgressBar from "../components/ProgressBar";
import FormField from "../components/FormField";
import FormSection from "../components/FormSection";
import FinButton from "../components/FinButton";
import { useOnboarding } from "../context/OnboardingContext";
import { isPositiveNumber, sumValues, formatCurrency } from "../utils/format";
import type { FinancialInfo as FIType, FormErrors } from "../types";

type ExpenseField = "housing" | "food" | "transportation" | "shopping" | "entertainment" | "subscriptions" | "otherExpenses";

export default function FinancialInfo() {
  const navigate = useNavigate();
  const { financialInfo, setFinancialInfo } = useOnboarding();
  const [form, setForm] = useState<FIType>(financialInfo);
  const [errors, setErrors] = useState<FormErrors<FIType>>({});

  const update = (field: keyof FIType, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validate = (): boolean => {
    const errs: FormErrors<FIType> = {};
    const allFields: (keyof FIType)[] = ["housing", "food", "transportation", "shopping", "entertainment", "subscriptions", "otherExpenses", "currentSavings", "currentDebt"];
    for (const f of allFields) {
      if (form[f] === "" || form[f] === undefined) {
        errs[f] = "This field is required (enter 0 if none)";
      } else if (!isPositiveNumber(form[f])) {
        errs[f] = "Enter a valid amount";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      setFinancialInfo(form);
      navigate("/goals");
    }
  };

  const expenseFields: { field: ExpenseField; label: string }[] = [
    { field: "housing", label: "Housing / Rent" },
    { field: "food", label: "Food & Groceries" },
    { field: "transportation", label: "Transportation" },
    { field: "shopping", label: "Shopping" },
    { field: "entertainment", label: "Entertainment" },
    { field: "subscriptions", label: "Subscriptions" },
    { field: "otherExpenses", label: "Other Expenses" },
  ];

  const totalExpenses = sumValues(expenseFields.map((e) => form[e.field]));

  return (
    <Layout>
      <ProgressBar currentStep={2} labels={["Personal", "Financial", "Goals", "Review"]} />
      <FormSection title="Financial Information" subtitle="Enter your monthly expenses and financial overview.">
        <div className="mb-6 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-brand-700 uppercase tracking-wider">Monthly Expenses</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          {expenseFields.map(({ field, label }) => (
            <FormField key={field} label={label} type="number" value={form[field]} onChange={(v) => update(field, v)} placeholder="0.00" suffix="AUD" error={errors[field]} required />
          ))}
        </div>
        <div className="mt-6 p-5 bg-brand-50 rounded-xl border border-brand-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-brand-600" />
            <span className="text-sm font-semibold text-brand-800">Total Monthly Expenses</span>
          </div>
          <span className="text-lg font-bold text-brand-700">{formatCurrency(String(totalExpenses))}</span>
        </div>

        <div className="mt-10 mb-6 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-brand-700 uppercase tracking-wider">Savings & Debt</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          <FormField label="Current Savings" type="number" value={form.currentSavings} onChange={(v) => update("currentSavings", v)} placeholder="0.00" suffix="AUD" error={errors.currentSavings} required helpText="Total across all accounts" />
          <FormField label="Current Debt" type="number" value={form.currentDebt} onChange={(v) => update("currentDebt", v)} placeholder="0.00" suffix="AUD" error={errors.currentDebt} required helpText="Total outstanding debt" />
        </div>
      </FormSection>
      <div className="flex justify-between mt-8">
        <FinButton variant="secondary" onClick={() => navigate("/personal-info")} icon={<ArrowLeft className="w-4 h-4" />}>Back</FinButton>
        <FinButton variant="primary" onClick={handleContinue} icon={<ArrowRight className="w-4 h-4" />}>Continue</FinButton>
      </div>
    </Layout>
  );
}