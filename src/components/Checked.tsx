export function SuccessCheck() {
  return (
    <div className="inline-flex items-center justify-center p-6">
      <div className="relative h-20 w-20 animate-pop">
        {/* círculo principal */}
        <div className="absolute inset-0 rounded-full bg-emerald-500" />

        {/* onda animada */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ripple" />

        {/* SVG do check */}
        <svg viewBox="0 0 52 52" className="relative z-10 h-20 w-20">
          <circle
            cx="26"
            cy="26"
            r="25"
            fill="none"
            className="stroke-white/30"
            strokeWidth="2"
          />
          <path
            className="stroke-white"
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 27 L22 35 L38 19"
            style={{
              strokeDasharray: 48,
              strokeDashoffset: 48,
              animation: "draw 0.6s ease-out forwards 0.2s",
            }}
          />
        </svg>
      </div>

      <style>{`
        @keyframes pop {
          0%   { transform: scale(0.8); filter: saturate(0.8); }
          70%  { transform: scale(1.08); }
          100% { transform: scale(1); filter: saturate(1); }
        }
        @keyframes ripple {
          0%   { transform: scale(1);   opacity: 0.35; }
          70%  { transform: scale(1.35); opacity: 0.15; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes draw { to { stroke-dashoffset: 0; } }

        .animate-pop { animation: pop .35s ease-out forwards; }
        .animate-ripple { animation: ripple .8s ease-out forwards; }
      `}</style>
    </div>
  );
}
