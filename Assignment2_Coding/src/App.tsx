import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OnboardingProvider } from "./context/OnboardingContext";
import Login from "./pages/Login";
import PersonalInfo from "./pages/PersonalInfo";
import FinancialInfo from "./pages/FinancialInfo";
import Goals from "./pages/Goals";
import Review from "./pages/Review";

export default function App() {
  return (
    <OnboardingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/personal-info" element={<PersonalInfo />} />
          <Route path="/financial-info" element={<FinancialInfo />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/review" element={<Review />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </OnboardingProvider>
  );
}
