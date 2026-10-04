import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import YourFinLogo from "../components/YourFinLogo";
import { useOnboarding } from "../context/OnboardingContext";
import { isValidEmail } from "../utils/format";
import { signUpWithEmail } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const { setLoginEmail, setIsLoggedIn } = useOnboarding();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (field: "email" | "password") => {
    const newErrors = { ...errors };
    if (field === "email") {
      if (!email.trim()) newErrors.email = "Email is required";
      else if (!isValidEmail(email)) newErrors.email = "Please enter a valid email";
      else delete newErrors.email;
    }
    if (field === "password") {
      if (!password) newErrors.password = "Password is required";
      else if (password.length < 6) newErrors.password = "Min 6 characters";
      else delete newErrors.password;
    }
    setErrors(newErrors);
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    validateField("email");
    validateField("password");
    const hasErr = !email.trim() || !isValidEmail(email) || !password || password.length < 6;
    if (hasErr) return;

    setIsSubmitting(true);
    try {
      const { session } = await signUpWithEmail(email, password);

      if (!session) {
        alert("Check your email to confirm your account before continuing.");
        return;
      }

      setLoginEmail(email);
      setIsLoggedIn(true);
      navigate("/personal-info");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = (err?: string, t?: boolean) =>
    "w-full h-11 rounded-lg border px-4 text-sm text-navy-800 placeholder:text-slate-400 transition-all duration-200 outline-none " +
    (err && t ? "border-error-500 bg-error-50" : "border-slate-200 bg-white hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-brand-50 grid lg:grid-cols-[2fr_3fr]">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex bg-gradient-to-br from-brand-700 to-brand-900 flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-[240px] h-[240px] rounded-full bg-brand-600/20" />
        <div className="absolute bottom-[-50px] left-[-50px] w-[160px] h-[160px] rounded-full bg-brand-500/15" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-10">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.15" />
              <path d="M14 34V22L20 18L26 26L34 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="34" cy="14" r="3" fill="white" />
            </svg>
            <span className="text-xl font-bold text-white tracking-tight">YourFin</span>
          </div>
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-3">
            Your AI-Powered<br />Financial Coach
          </h1>
          <p className="text-brand-200 text-base leading-relaxed max-w-xs">
            Take control of your finances with personalized insights and smart budgeting tools.
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-3">
          {["Personalized financial plans", "Smart goal tracking", "AI-driven insights"].map((t) => (
            <div key={t} className="flex items-center gap-3 text-brand-100">
              <Sparkles className="w-4 h-4 text-brand-300" />
              <span className="text-sm">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right login form area */}
      <div className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-[440px]">
          <div className="flex justify-center mb-8 lg:mb-0 lg:hidden">
            <YourFinLogo size="md" />
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-navy-800 mb-1.5">Welcome back</h2>
              <p className="text-sm text-slate-500">Sign in to continue building your financial profile</p>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-5">
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Email Address<span className="text-error-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => handleBlur("email")} placeholder="you@example.com" className={inputCls(errors.email, touched.email)} />
                </div>
                {errors.email && touched.email && <p className="mt-1.5 text-xs text-error-500">{errors.email}</p>}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Password<span className="text-error-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => handleBlur("password")} placeholder="Enter your password" className={inputCls(errors.password, touched.password)} />
                </div>
                {errors.password && touched.password && <p className="mt-1.5 text-xs text-error-500">{errors.password}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full h-11 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-70">
                Sign Up <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-5 text-center">
              <button type="button" className="text-sm text-brand-600 hover:text-brand-700 font-medium cursor-pointer" onClick={() => alert("Password reset is not available in this demo.")}>
                Forgot your password?
              </button>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <button type="button" className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer" onClick={() => alert("Sign up not available in demo.")}>
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
