export default function YourFinLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-3xl' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      {/* Leaf/chart icon */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="12" fill="#0D9488" />
        <path
          d="M14 34V22L20 18L26 26L34 14"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 34L14 28L20 24L26 32L34 18L34 14"
          fill="white"
          fillOpacity="0.15"
        />
        <circle cx="34" cy="14" r="3" fill="white" />
      </svg>
      <span className={`font-bold tracking-tight text-navy-800 ${s.text}`}>
        Your<span className="text-brand-600">Fin</span>
      </span>
    </div>
  );
}