import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  PersonalInfo,
  FinancialInfo,
  FinancialGoal,
  OnboardingContextType,
} from '../types';
import { loadData, saveData } from '../services/storage';

const defaultPersonalInfo: PersonalInfo = {
  fullName: '',
  age: '',
  employmentStatus: '',
  monthlyIncome: '',
  country: '',
  currency: 'USD',
};

const defaultFinancialInfo: FinancialInfo = {
  housing: '',
  food: '',
  transportation: '',
  shopping: '',
  entertainment: '',
  subscriptions: '',
  otherExpenses: '',
  currentSavings: '',
  currentDebt: '',
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding(): OnboardingContextType {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return ctx;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const saved = loadData();

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(
    saved?.personalInfo ?? defaultPersonalInfo
  );
  const [financialInfo, setFinancialInfo] = useState<FinancialInfo>(
    saved?.financialInfo ?? defaultFinancialInfo
  );
  const [goals, setGoals] = useState<FinancialGoal[]>(
    saved?.goals ?? []
  );
  const [loginEmail, setLoginEmail] = useState<string>(
    saved?.loginEmail ?? ''
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!saved?.loginEmail
  );

  // Persist to localStorage whenever data changes
  useEffect(() => {
    if (isLoggedIn || loginEmail) {
      saveData({
        personalInfo,
        financialInfo,
        goals,
        loginEmail,
      });
    }
  }, [personalInfo, financialInfo, goals, loginEmail, isLoggedIn]);

  const resetAll = useCallback(() => {
    setPersonalInfo(defaultPersonalInfo);
    setFinancialInfo(defaultFinancialInfo);
    setGoals([]);
    setLoginEmail('');
    setIsLoggedIn(false);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        personalInfo,
        financialInfo,
        goals,
        loginEmail,
        isLoggedIn,
        setPersonalInfo,
        setFinancialInfo,
        setGoals,
        setLoginEmail,
        setIsLoggedIn,
        resetAll,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}