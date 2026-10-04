import { getSupabaseClient } from '../lib/supabase';
import type { FinancialGoal, FinancialInfo, PersonalInfo } from '../types';

interface FinancialProfileUpsert {
  id: string;
  email_address: string | null;
  full_name: string;
  age: number;
  employment_status: string;
  monthly_income: number;
  total_expenses: number;
  total_debt: number;
  financial_goal: string;
  country: string;
  currency: string;
}

function toNumber(value: string): number {
  return Number(value);
}

function buildFinancialProfile(
  userId: string,
  emailAddress: string | null,
  personalInfo: PersonalInfo,
  financialInfo: FinancialInfo,
  goals: FinancialGoal[],
): FinancialProfileUpsert {
  const totalExpenses = [
    financialInfo.housing,
    financialInfo.food,
    financialInfo.transportation,
    financialInfo.shopping,
    financialInfo.entertainment,
    financialInfo.subscriptions,
    financialInfo.otherExpenses,
  ].reduce((total, value) => total + toNumber(value), 0);

  return {
    id: userId,
    email_address: emailAddress,
    full_name: personalInfo.fullName,
    age: toNumber(personalInfo.age),
    employment_status: personalInfo.employmentStatus,
    monthly_income: toNumber(personalInfo.monthlyIncome),
    total_expenses: totalExpenses,
    total_debt: toNumber(financialInfo.currentDebt),
    financial_goal: goals.map((goal) => goal.name.trim()).filter(Boolean).join(', '),
    country: personalInfo.country,
    currency: personalInfo.currency,
  };
}

export async function saveFinancialProfile(
  personalInfo: PersonalInfo,
  financialInfo: FinancialInfo,
  goals: FinancialGoal[],
): Promise<void> {
  const supabase = getSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('You must be signed in to save your financial profile.');

  const { error } = await supabase
    .from('financial_profiles')
    .upsert(buildFinancialProfile(user.id, user.email ?? null, personalInfo, financialInfo, goals), { onConflict: 'id' });

  if (error) throw error;
}