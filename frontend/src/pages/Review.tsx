import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Loader2, CheckCircle2, XCircle, RefreshCw, BarChart3, TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react";
import Layout from "../components/Layout";
import { ShinyButton } from "../components/ui/shiny-button";
import { useOnboarding } from "../context/OnboardingContext";
import { formatCurrency, sumValues } from "../utils/format";
import { clearData } from "../services/storage";
import { submitFinancialPlan } from "../services/financialPlans";
import { saveFinancialProfile } from "../services/financialProfiles";

type ViewState = "review" | "loading" | "success" | "error";

const EMP_MAP: Record<string, string> = {
  employed: "Employed (Full-time)", "part-time": "Part-time", "self-employed": "Self-employed",
  unemployed: "Unemployed", student: "Student", retired: "Retired",
};
const CTR_MAP: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia",
  DE: "Germany", FR: "France", IN: "India", JP: "Japan", BR: "Brazil",
  MX: "Mexico", ZA: "South Africa", NG: "Nigeria", SG: "Singapore", AE: "UAE", OTHER: "Other",
};

const SRow = ({ l, v }: { l: string; v: string }) => (
  <div className="flex justify-between py-2 text-sm"><span className="text-slate-500">{l}</span><span className="font-medium text-navy-800">{v}</span></div>
);

export default function Review() {
  const navigate = useNavigate();
  const { personalInfo: pi, financialInfo: fi, goals, loginEmail, resetAll } = useOnboarding();
  const [vs, setVs] = useState<ViewState>("review");
  const [submitError, setSubmitError] = useState("");
  const income = parseFloat(pi.monthlyIncome) || 0;
  const expenses = sumValues([fi.housing, fi.food, fi.transportation, fi.shopping, fi.entertainment, fi.subscriptions, fi.otherExpenses]);
  const savings = parseFloat(fi.currentSavings) || 0;
  const debt = parseFloat(fi.currentDebt) || 0;
  const net = income - expenses;

  const handleSubmit = async () => {
    setVs("loading");
    setSubmitError("");

    try {
      await saveFinancialProfile(pi, fi, goals);
      await submitFinancialPlan(loginEmail, pi, fi, goals);
      setVs("success");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save your financial plan. Please try again.");
      setVs("error");
    }
  };
  const handleStartOver = () => { clearData(); resetAll(); navigate("/login"); };

  if (vs === "loading") return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-6"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
        <h2 className="text-xl font-bold text-navy-800 mb-2">Generating Your Financial Plan</h2>
        <p className="text-sm text-slate-500 max-w-sm">Our AI is analyzing your financial profile...</p>
      </div>
    </Layout>
  );

  if (vs === "success") return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center mb-6"><CheckCircle2 className="w-10 h-10 text-success-500" /></div>
        <h2 className="text-2xl font-bold text-navy-800 mb-2">Your Financial Plan Was Created Successfully!</h2>
        <p className="text-sm text-slate-500 max-w-md mb-8">Your financial information has been successfully submitted.</p>
        <div className="grid grid-cols-2 gap-5 w-full max-w-lg mb-10">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center"><BarChart3 className="w-5 h-5 text-brand-600 mx-auto mb-1" /><p className="text-xs text-slate-400">Monthly Income</p><p className="text-lg font-bold text-navy-800">{formatCurrency(String(income))}</p></div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center"><Wallet className="w-5 h-5 text-brand-600 mx-auto mb-1" /><p className="text-xs text-slate-400">Total Savings</p><p className="text-lg font-bold text-navy-800">{formatCurrency(String(savings))}</p></div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center"><CreditCard className="w-5 h-5 text-brand-600 mx-auto mb-1" /><p className="text-xs text-slate-400">Total Debt</p><p className="text-lg font-bold text-navy-800">{formatCurrency(String(debt))}</p></div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            {net >= 0 ? <TrendingUp className="w-5 h-5 text-success-500 mx-auto mb-1" /> : <TrendingDown className="w-5 h-5 text-error-500 mx-auto mb-1" />}
            <p className="text-xs text-slate-400">Net Monthly</p>
            <p className={`text-lg font-bold ${net >= 0 ? "text-success-600" : "text-error-600"}`}>{formatCurrency(String(net))}</p>
          </div>
        </div>
        <button onClick={handleStartOver} className="px-6 py-3 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm cursor-pointer">Start Over</button>
      </div>
    </Layout>
  );

  if (vs === "error") return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="w-20 h-20 rounded-full bg-error-50 flex items-center justify-center mb-6"><XCircle className="w-10 h-10 text-error-500" /></div>
        <h2 className="text-2xl font-bold text-navy-800 mb-2">Something Went Wrong</h2>
        <p className="text-sm text-slate-500 max-w-md mb-8">{submitError || "We couldn't generate your financial plan. Please try again."}</p>
        <div className="flex gap-3">
          <button onClick={() => setVs("review")} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"><RefreshCw className="w-4 h-4" /> Try Again</button>
          <button onClick={() => navigate("/personal-info")} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 cursor-pointer"><Pencil className="w-4 h-4" /> Edit Info</button>
        </div>
      </div>
    </Layout>
  );

  const expLabels: [string, string][] = [
    ["Housing / Rent", fi.housing], ["Food & Groceries", fi.food], ["Transportation", fi.transportation],
    ["Shopping", fi.shopping], ["Entertainment", fi.entertainment], ["Subscriptions", fi.subscriptions], ["Other", fi.otherExpenses],
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-800 mb-2">Review Your Profile</h2>
        <p className="text-sm text-slate-500">Verify everything looks correct before generating your plan.</p>
      </div>

      {/* Personal */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-brand-700 uppercase tracking-wider">Personal Information</h3>
          <button onClick={() => navigate("/personal-info")} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 cursor-pointer"><Pencil className="w-3 h-3" /> Edit</button>
        </div>
        <div className="divide-y divide-slate-100">
          <SRow l="Full Name" v={pi.fullName} /><SRow l="Age" v={pi.age} />
          <SRow l="Employment" v={EMP_MAP[pi.employmentStatus] || pi.employmentStatus} />
          <SRow l="Monthly Income" v={formatCurrency(pi.monthlyIncome)} />
          <SRow l="Country" v={CTR_MAP[pi.country] || pi.country} /><SRow l="Currency" v={pi.currency} />
        </div>
      </div>

      {/* Financial */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-brand-700 uppercase tracking-wider">Financial Information</h3>
          <button onClick={() => navigate("/financial-info")} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 cursor-pointer"><Pencil className="w-3 h-3" /> Edit</button>
        </div>
        <div className="divide-y divide-slate-100">
          {expLabels.map(([l, v]) => <SRow key={l} l={l} v={formatCurrency(v)} />)}
          <div className="py-2 flex justify-between text-sm bg-brand-50 -mx-2 px-2 rounded-lg mt-1">
            <span className="font-semibold text-brand-800">Total Expenses</span>
            <span className="font-bold text-brand-700">{formatCurrency(String(expenses))}</span>
          </div>
          <SRow l="Current Savings" v={formatCurrency(fi.currentSavings)} />
          <SRow l="Current Debt" v={formatCurrency(fi.currentDebt)} />
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-brand-700 uppercase tracking-wider">Financial Goals</h3>
          <button onClick={() => navigate("/goals")} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 cursor-pointer"><Pencil className="w-3 h-3" /> Edit</button>
        </div>
        {goals.map((g, i) => (
          <div key={g.id} className={i > 0 ? "mt-4 pt-4 border-t border-slate-100" : ""}>
            <p className="text-sm font-semibold text-navy-800 mb-2">{g.name}</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><span className="text-slate-400">Target</span><p className="font-medium text-navy-800">{formatCurrency(g.targetAmount)}</p></div>
              <div><span className="text-slate-400">Saved</span><p className="font-medium text-navy-800">{formatCurrency(g.currentSaved)}</p></div>
              <div><span className="text-slate-400">By</span><p className="font-medium text-navy-800">{g.targetDate}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Snapshot */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-8 mb-8 text-white">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-5 text-brand-100">Financial Snapshot</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div><p className="text-xs text-brand-200">Income</p><p className="text-lg font-bold">{formatCurrency(String(income))}</p></div>
          <div><p className="text-xs text-brand-200">Expenses</p><p className="text-lg font-bold">{formatCurrency(String(expenses))}</p></div>
          <div><p className="text-xs text-brand-200">Net</p><p className="text-lg font-bold">{formatCurrency(String(net))}</p></div>
          <div><p className="text-xs text-brand-200">Savings</p><p className="text-lg font-bold">{formatCurrency(String(savings))}</p></div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={() => navigate("/goals")} className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"><ArrowLeft className="w-4 h-4" /> Back</button>
        <ShinyButton onClick={handleSubmit}>Generate My Financial Plan</ShinyButton>
      </div>
    </Layout>
  );
}