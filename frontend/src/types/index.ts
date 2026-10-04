export interface PersonalInfo {
  fullName: string;
  age: string;
  employmentStatus: string;
  monthlyIncome: string;
  country: string;
  currency: string;
}

export interface FinancialInfo {
  housing: string;
  food: string;
  transportation: string;
  shopping: string;
  entertainment: string;
  subscriptions: string;
  otherExpenses: string;
  currentSavings: string;
  currentDebt: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: string;
  currentSaved: string;
  targetDate: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface OnboardingData {
  personalInfo: PersonalInfo;
  financialInfo: FinancialInfo;
  goals: FinancialGoal[];
  loginEmail: string;
}

export interface OnboardingContextType {
  personalInfo: PersonalInfo;
  financialInfo: FinancialInfo;
  goals: FinancialGoal[];
  loginEmail: string;
  isLoggedIn: boolean;
  setPersonalInfo: (info: PersonalInfo) => void;
  setFinancialInfo: (info: FinancialInfo) => void;
  setGoals: (goals: FinancialGoal[]) => void;
  setLoginEmail: (email: string) => void;
  setIsLoggedIn: (val: boolean) => void;
  resetAll: () => void;
}