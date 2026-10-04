import type { FinancialGoal, FinancialInfo, PersonalInfo } from '../types';

interface FinancialPlanSubmission {
  email: string;
  personal_info: {
    full_name: string;
    age: number;
    employment_status: string;
    country: string;
    currency: string;
    monthly_income: number;
  };
  financial_info: {
    housing: number;
    food: number;
    transportation: number;
    shopping: number;
    entertainment: number;
    subscriptions: number;
    other_expenses: number;
    current_savings: number;
    current_debt: number;
  };
  goals: Array<{
    name: string;
    target_amount: number;
    current_saved: number;
    target_date: string;
  }>;
}

interface FinancialPlanResponse {
  id: string;
  message: string;
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

function toNumber(value: string): number {
  return Number(value);
}

function buildSubmission(
  email: string,
  personalInfo: PersonalInfo,
  financialInfo: FinancialInfo,
  goals: FinancialGoal[],
): FinancialPlanSubmission {
  return {
    email,
    personal_info: {
      full_name: personalInfo.fullName,
      age: toNumber(personalInfo.age),
      employment_status: personalInfo.employmentStatus,
      country: personalInfo.country,
      currency: personalInfo.currency,
      monthly_income: toNumber(personalInfo.monthlyIncome),
    },
    financial_info: {
      housing: toNumber(financialInfo.housing),
      food: toNumber(financialInfo.food),
      transportation: toNumber(financialInfo.transportation),
      shopping: toNumber(financialInfo.shopping),
      entertainment: toNumber(financialInfo.entertainment),
      subscriptions: toNumber(financialInfo.subscriptions),
      other_expenses: toNumber(financialInfo.otherExpenses),
      current_savings: toNumber(financialInfo.currentSavings),
      current_debt: toNumber(financialInfo.currentDebt),
    },
    goals: goals.map((goal) => ({
      name: goal.name,
      target_amount: toNumber(goal.targetAmount),
      current_saved: toNumber(goal.currentSaved),
      target_date: goal.targetDate,
    })),
  };
}

function getErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const detail = 'detail' in payload ? payload.detail : null;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0 && typeof detail[0] === 'object' && detail[0] !== null) {
    const message = 'msg' in detail[0] ? detail[0].msg : null;
    if (typeof message === 'string') return message;
  }

  return null;
}

export async function submitFinancialPlan(
  email: string,
  personalInfo: PersonalInfo,
  financialInfo: FinancialInfo,
  goals: FinancialGoal[],
): Promise<FinancialPlanResponse> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/financial-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildSubmission(email, personalInfo, financialInfo, goals)),
    });
  } catch {
    throw new Error('Unable to reach the server. Make sure the backend is running and try again.');
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(getErrorMessage(payload) ?? 'Unable to save your financial plan. Please try again.');
  }

  return payload as FinancialPlanResponse;
}