import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import ProgressBar from "../components/ProgressBar";
import FormField from "../components/FormField";
import FormSection from "../components/FormSection";
import FinButton from "../components/FinButton";
import { useOnboarding } from "../context/OnboardingContext";
import { isRequired, isValidAge, isPositiveNumber } from "../utils/format";
import type { PersonalInfo as PIType, FormErrors } from "../types";

const COUNTRIES = [
  { value: "US", label: "United States" }, { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" }, { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" }, { value: "FR", label: "France" },
  { value: "IN", label: "India" }, { value: "JP", label: "Japan" },
  { value: "BR", label: "Brazil" }, { value: "MX", label: "Mexico" },
  { value: "ZA", label: "South Africa" }, { value: "NG", label: "Nigeria" },
  { value: "SG", label: "Singapore" }, { value: "AE", label: "UAE" },
  { value: "OTHER", label: "Other" },
];
const CURRENCIES = [
  { value: "USD", label: "USD ($)" }, { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" }, { value: "CAD", label: "CAD (C$)" },
  { value: "AUD", label: "AUD (A$)" }, { value: "INR", label: "INR (₹)" },
  { value: "JPY", label: "JPY (¥)" }, { value: "BRL", label: "BRL (R$)" },
  { value: "OTHER", label: "Other" },
];
const EMPLOYMENT = [
  { value: "employed", label: "Employed (Full-time)" },
  { value: "part-time", label: "Employed (Part-time)" },
  { value: "self-employed", label: "Self-employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" },
];

export default function PersonalInfo() {
  const navigate = useNavigate();
  const { personalInfo, setPersonalInfo } = useOnboarding();
  const [form, setForm] = useState<PIType>(personalInfo);
  const [errors, setErrors] = useState<FormErrors<PIType>>({});

  const update = (field: keyof PIType, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validate = (): boolean => {
    const errs: FormErrors<PIType> = {};
    if (!isRequired(form.fullName)) errs.fullName = "Full name is required";
    if (!isRequired(form.age)) errs.age = "Age is required";
    else if (!isValidAge(form.age)) errs.age = "Age must be between 18 and 120";
    if (!isRequired(form.employmentStatus)) errs.employmentStatus = "Employment status is required";
    if (!isRequired(form.monthlyIncome)) errs.monthlyIncome = "Monthly income is required";
    else if (!isPositiveNumber(form.monthlyIncome)) errs.monthlyIncome = "Enter a valid amount";
    if (!isRequired(form.country)) errs.country = "Country is required";
    if (!isRequired(form.currency)) errs.currency = "Currency is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      setPersonalInfo(form);
      navigate("/financial-info");
    }
  };

  return (
    <Layout>
      <ProgressBar currentStep={1} labels={["Personal", "Financial", "Goals", "Review"]} />
      <FormSection title="Personal Information" subtitle="Tell us a bit about yourself to get started.">
        <div className="space-y-1">
          <FormField label="Full Name" value={form.fullName} onChange={(v) => update("fullName", v)} placeholder="John Smith" error={errors.fullName} required />
          <FormField label="Age" type="number" value={form.age} onChange={(v) => update("age", v)} placeholder="30" error={errors.age} required helpText="Must be 18 or older" />
          <FormField type="select" label="Employment Status" value={form.employmentStatus} onChange={(v) => update("employmentStatus", v)} options={EMPLOYMENT} error={errors.employmentStatus} required />
          <FormField label="Monthly Income (Gross)" type="number" value={form.monthlyIncome} onChange={(v) => update("monthlyIncome", v)} placeholder="5,000" suffix="AUD" error={errors.monthlyIncome} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField type="select" label="Country" value={form.country} onChange={(v) => update("country", v)} options={COUNTRIES} error={errors.country} required />
            <FormField type="select" label="Currency" value={form.currency} onChange={(v) => update("currency", v)} options={CURRENCIES} error={errors.currency} required />
          </div>
        </div>
      </FormSection>
      <div className="flex justify-between mt-8">
        <FinButton variant="secondary" onClick={() => navigate("/login")} icon={<ArrowLeft className="w-4 h-4" />}>Back</FinButton>
        <FinButton variant="primary" onClick={handleContinue} icon={<ArrowRight className="w-4 h-4" />}>Continue</FinButton>
      </div>
    </Layout>
  );
}