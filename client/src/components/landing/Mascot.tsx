import { useEffect, useRef, useState } from 'react';

type MascotProps = {
  /** initial expression shown on mount */
  expression?: 'neutral' | 'smile' | 'think' | 'speak';
  className?: string;
};

/**
 * A lightweight CSS/SVG "3D" robot mascot.
 * Pure CSS transforms + SVG give a convincing dimensional feel without a WebGL dependency.
 */
export default function Mascot({ expression = 'smile', className = '' }: MascotProps) {
  const [face, setFace] = useState<'neutral' | 'smile' | 'think' | 'speak'>(expression);

  // Cycle expressions gently while idle
  useEffect(() => {
    const cycle = ['smile', 'neutral', 'think', 'smile'] as const;
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % cycle.length;
      setFace(cycle[i]);
    }, 3600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`mascot-stage relative ${className}`}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral-400/40 animate-glowPulse" />

      {/* Pulse rings */}
      <div className="pointer-events-none absolute left-1/2 top-[58%] -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-coral-300/60 animate-ringPulse" />
      <div
        className="pointer-events-none absolute left-1/2 top-[58%] -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-coral-300/40 animate-ringPulse"
        style={{ animationDelay: '1.3s' }}
      />

      <div className="animate-floatY">
        <Robot face={face} />
      </div>

      {/* Floor shadow */}
      <div className="mx-auto mt-2 h-3 w-40 rounded-full bg-ink/20 blur-md" />
    </div>
  );
}

function Robot({
  face,
}: {
  face: 'neutral' | 'smile' | 'think' | 'speak';
}) {
  return (
    <svg
      width="260"
      height="320"
      viewBox="0 0 260 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="55%" stopColor="#141414" />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>
        <linearGradient id="headGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#333" />
          <stop offset="60%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        <radialGradient id="screenGrad" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#1f1f1f" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <linearGradient id="armGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        <linearGradient id="coralGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff8a6b" />
          <stop offset="100%" stopColor="#f54a2a" />
        </linearGradient>
        <radialGradient id="cheekGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff6f4f" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff6f4f" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Antenna */}
      <g>
        <line x1="130" y1="40" x2="130" y2="14" stroke="#3a3a3a" strokeWidth="4" strokeLinecap="round" />
        <circle cx="130" cy="12" r="7" fill="url(#coralGrad)">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.6s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Left arm (static) */}
      <g>
        <rect x="64" y="200" width="26" height="70" rx="13" fill="url(#armGrad)" />
        <circle cx="77" cy="272" r="13" fill="url(#coralGrad)" />
      </g>

      {/* Right arm */}
      <g>
        <rect x="170" y="200" width="26" height="70" rx="13" fill="url(#armGrad)" />
        <circle cx="183" cy="272" r="13" fill="url(#coralGrad)" />
      </g>

      {/* Body */}
      <g>
        <rect x="78" y="190" width="104" height="96" rx="34" fill="url(#bodyGrad)" />
        <rect x="78" y="190" width="104" height="96" rx="34" fill="none" stroke="#3a3a3a" strokeWidth="1.5" />
        {/* Chest mark */}
        <circle cx="130" cy="232" r="14" fill="#0a0a0a" stroke="#3a3a3a" strokeWidth="1.5" />
        <circle cx="130" cy="232" r="6" fill="url(#coralGrad)">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2.2s" repeatCount="indefinite" />
        </circle>
        {/* Body highlight */}
        <rect x="88" y="198" width="30" height="80" rx="15" fill="white" opacity="0.06" />
      </g>

      {/* Head */}
      <g
        className="animate-bobHead"
        style={{ transformOrigin: '130px 120px' }}
>
        <rect x="60" y="44" width="140" height="150" rx="46" fill="url(#headGrad)" />
        <rect x="60" y="44" width="140" height="150" rx="46" fill="none" stroke="#3a3a3a" strokeWidth="1.5" />

        {/* Screen / face */}
        <rect x="76" y="64" width="108" height="92" rx="30" fill="url(#screenGrad)" />
        <rect x="76" y="64" width="108" height="92" rx="30" fill="none" stroke="#2a2a2a" strokeWidth="1" />

        {/* Cheeks */}
        <circle cx="92" cy="134" r="9" fill="url(#cheekGrad)" />
        <circle cx="168" cy="134" r="9" fill="url(#cheekGrad)" />

        {/* Eyes */}
        <g className="animate-blinkEye" style={{ transformOrigin: 'center' }}>
          <Eye cx={103} cy={104} face={face} />
          <Eye cx={157} cy={104} face={face} />
        </g>

        {/* Mouth */}
        <Mouth face={face} />

        {/* Ear modules */}
        <rect x="48" y="92" width="14" height="44" rx="7" fill="#1a1a1a" stroke="#3a3a3a" strokeWidth="1" />
        <rect x="198" y="92" width="14" height="44" rx="7" fill="#1a1a1a" stroke="#3a3a3a" strokeWidth="1" />
        <circle cx="55" cy="114" r="3" fill="url(#coralGrad)" />
        <circle cx="205" cy="114" r="3" fill="url(#coralGrad)" />

        {/* Head highlight */}
        <rect x="72" y="52" width="40" height="40" rx="20" fill="white" opacity="0.08" />
      </g>
    </svg>
  );
}

function Eye({ cx, cy, face }: { cx: number; cy: number; face: string }) {
  if (face === 'think') {
    return <circle cx={cx} cy={cy - 4} r="6" fill="url(#coralGrad)" />;
  }
  return <circle cx={cx} cy={cy} r="7" fill="url(#coralGrad)" />;
}

function Mouth({ face }: { face: string }) {
  if (face === 'speak') {
    return <rect x="120" y="132" width="20" height="10" rx="5" fill="url(#coralGrad)" />;
  }
  if (face === 'neutral') {
    return <line x1="118" y1="134" x2="142" y2="134" stroke="url(#coralGrad)" strokeWidth="4" strokeLinecap="round" />;
  }
  if (face === 'think') {
    return <path d="M122 134 q8 -6 18 -2" stroke="url(#coralGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />;
  }
  // smile
  return <path d="M116 130 q14 14 28 0" stroke="url(#coralGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />;
}
