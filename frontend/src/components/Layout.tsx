import type { ReactNode } from 'react';
import YourFinLogo from './YourFinLogo';

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full">
      {showNav && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 w-full">
          <div className="w-full max-w-6xl mx-auto px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between">
            <YourFinLogo size="sm" />
            <div className="text-xs font-medium text-slate-400 tracking-wide uppercase">
              AI Financial Coach
            </div>
          </div>
        </header>
      )}
      <main className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-5xl mx-auto px-6 md:px-10 lg:px-16 py-8 flex flex-col">
          {children}
        </div>
      </main>
      <footer className="border-t border-slate-100 py-4 w-full">
        <p className="text-center text-xs text-slate-400">
          © 2026 YourFin. Your AI-powered financial coach.
        </p>
      </footer>
    </div>
  );
}