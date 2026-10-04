import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  labels: string[];
}

export default function ProgressBar({ currentStep, labels }: ProgressBarProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-3">
        {labels.map((label, index) => {
          const step = index + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {/* Line before */}
                {index > 0 && (
                  <div
                    className={`flex-1 h-0.5 transition-colors duration-300 ${
                      isCompleted || isCurrent ? 'bg-brand-500' : 'bg-slate-200'
                    }`}
                  />
                )}
                {/* Step circle */}
                <div
                  className={`
                    relative flex items-center justify-center w-9 h-9 rounded-full
                    text-sm font-semibold transition-all duration-300 shrink-0
                    ${isCompleted
                      ? 'bg-brand-600 text-white'
                      : isCurrent
                        ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                        : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                {/* Line after */}
                {index < labels.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 transition-colors duration-300 ${
                      isCompleted ? 'bg-brand-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                  isCurrent
                    ? 'text-brand-700'
                    : isCompleted
                      ? 'text-brand-600'
                      : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}