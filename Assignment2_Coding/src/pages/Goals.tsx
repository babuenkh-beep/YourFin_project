import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus, Trash2, Target } from "lucide-react";
import Layout from "../components/Layout";
import ProgressBar from "../components/ProgressBar";
import FormField from "../components/FormField";
import FormSection from "../components/FormSection";
import FinButton from "../components/FinButton";
import { useOnboarding } from "../context/OnboardingContext";
import { isRequired, isPositiveNumber, generateId } from "../utils/format";
import type { FinancialGoal } from "../types";

interface GoalErrors { name?: string; targetAmount?: string; currentSaved?: string; targetDate?: string; }

const emptyGoal = (): FinancialGoal => ({
  id: generateId(), name: "", targetAmount: "", currentSaved: "", targetDate: "",
});

export default function Goals() {
  const navigate = useNavigate();
  const { goals, setGoals } = useOnboarding();
  const [form, setForm] = useState<FinancialGoal[]>(goals.length > 0 ? goals : [emptyGoal()]);
  const [errors, setErrors] = useState<Record<string, GoalErrors>>({});

  const updateGoal = (id: string, field: keyof FinancialGoal, value: string) => {
    setForm((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };
  const addGoal = () => setForm((prev) => [...prev, emptyGoal()]);
  const removeGoal = (id: string) => { if (form.length > 1) setForm((prev) => prev.filter((g) => g.id !== id)); };

  const validate = (): boolean => {
    const allErr: Record<string, GoalErrors> = {};
    let ok = true;
    for (const g of form) {
      const ge: GoalErrors = {};
      if (!isRequired(g.name)) { ge.name = "Goal name is required"; ok = false; }
      if (!isRequired(g.targetAmount)) { ge.targetAmount = "Required"; ok = false; }
      else if (!isPositiveNumber(g.targetAmount)) { ge.targetAmount = "Invalid"; ok = false; }
      if (!isRequired(g.currentSaved)) { ge.currentSaved = "Enter 0 if none"; ok = false; }
      else if (!isPositiveNumber(g.currentSaved)) { ge.currentSaved = "Invalid"; ok = false; }
      else if (parseFloat(g.currentSaved) > parseFloat(g.targetAmount)) { ge.currentSaved = "Cannot exceed target"; ok = false; }
      if (!isRequired(g.targetDate)) { ge.targetDate = "Required"; ok = false; }
      allErr[g.id] = ge;
    }
    setErrors(allErr);
    return ok;
  };

  const handleContinue = () => { if (validate()) { setGoals(form); navigate("/review"); } };

  return (
    <Layout>
      <ProgressBar currentStep={3} labels={["Personal", "Financial", "Goals", "Review"]} />
      <FormSection title="Financial Goals" subtitle="Define what you want to achieve. Add as many goals as you like.">
        <div className="space-y-5">
          {form.map((goal, idx) => (
            <div key={goal.id} className="relative p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-brand-600" />
                  <span className="text-sm font-semibold text-navy-700">Goal {idx + 1}</span>
                </div>
                {form.length > 1 && (
                  <button type="button" onClick={() => removeGoal(goal.id)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-error-500 transition-colors cursor-pointer p-1.5 rounded-md hover:bg-error-50">
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
              <div className="space-y-1">
                <FormField label="Goal Name" value={goal.name} onChange={(v) => updateGoal(goal.id, "name", v)} placeholder="e.g., Emergency Fund" error={errors[goal.id]?.name} required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField label="Target Amount" type="number" value={goal.targetAmount} onChange={(v) => updateGoal(goal.id, "targetAmount", v)} placeholder="10,000" suffix="AUD" error={errors[goal.id]?.targetAmount} required />
                  <FormField label="Current Saved" type="number" value={goal.currentSaved} onChange={(v) => updateGoal(goal.id, "currentSaved", v)} placeholder="0.00" suffix="AUD" error={errors[goal.id]?.currentSaved} required />
                </div>
                <FormField label="Target Date" type="date" value={goal.targetDate} onChange={(v) => updateGoal(goal.id, "targetDate", v)} error={errors[goal.id]?.targetDate} required />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addGoal} className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-brand-600 bg-brand-50 border-2 border-dashed border-brand-200 rounded-xl hover:bg-brand-100 hover:border-brand-300 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Add Another Goal
        </button>
      </FormSection>
      <div className="flex justify-between mt-8">
        <FinButton variant="secondary" onClick={() => navigate("/financial-info")} icon={<ArrowLeft className="w-4 h-4" />}>Back</FinButton>
        <FinButton variant="primary" onClick={handleContinue} icon={<ArrowRight className="w-4 h-4" />}>Continue</FinButton>
      </div>
    </Layout>
  );
}