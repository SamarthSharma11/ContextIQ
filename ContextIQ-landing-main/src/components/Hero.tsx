import { useState } from 'react';
import { ArrowRight, FileText, Link2, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import Mascot from '@/components/Mascot';

export default function Hero() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: x * 18, // max 18 deg rotateY
      y: -y * 18, // max 18 deg rotateX
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section id="top" className="relative pt-24 pb-12 md:pt-28 md:pb-16 px-4 md:px-8">
      {/* Backgrounds */}
      <div className="absolute inset-0 -z-20 grid-bg opacity-70" />
      <div className="absolute inset-0 -z-10 spotlight" />

      {/* Signature Framed Hero Card Container per Design Doc §5 & §7 */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="mx-auto max-w-6xl rounded-[2.5rem] border border-ink/10 bg-[#F7F7F7] shadow-2xl p-6 sm:p-10 md:p-14 relative overflow-hidden transition-all duration-300"
      >
        {/* Ambient Coral Glow inside Frame */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-coral-400/20 blur-3xl" />

        {/* Eyebrow */}
        <div className="flex justify-center reveal">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/80 px-4 py-1.5 text-xs font-medium text-ink/75 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-coral-500" />
            Grounded AI assistants for modern teams
          </span>
        </div>

        {/* Oversized Wordmark behind 3D Mascot with cursor tilt */}
        <div className="relative mt-8 select-none flex flex-col items-center justify-center">
          <h1 className="pointer-events-none absolute inset-x-0 -top-8 text-center text-[15vw] sm:text-[13vw] md:text-[11vw] font-black leading-none tracking-tighter text-ink opacity-[0.92] font-display">
            ContextIQ
          </h1>

          {/* 3D Mascot Stage with Cursor Tilt */}
          <div
            className="relative flex justify-center pt-8 sm:pt-12 transition-transform duration-200 ease-out"
            style={{
              transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            }}
          >
            <Mascot className="reveal-scale" />
          </div>
        </div>

        {/* Flanking Copy Blocks + Headline per Design Doc §5 */}
        <div className="relative mt-4 text-center">
          <h2 className="reveal text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-ink font-display">
            Custom AI chatbots grounded in
            <br className="hidden sm:block" />{' '}
            <span className="shimmer-text">your company knowledge</span>
          </h2>

          <div className="reveal mx-auto mt-6 max-w-2xl text-base text-ink/65 leading-relaxed">
            Upload PDFs or link your website. ContextIQ builds isolated AI assistants that answer
            truthfully with sources, stay on-brand, and scale on shared infrastructure.
          </div>

          {/* Primary Action Buttons */}
          <div className="reveal mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="http://localhost:5173/signup"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-coral-500 px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-coral-600 hover:shadow-xl hover:shadow-coral-500/25 active:scale-95"
            >
              Start building free
              <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-xs ml-0.5">
                →
              </span>
            </a>
            <a
              href="http://localhost:5173/login"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/80 px-6 py-3.5 text-sm font-semibold text-ink backdrop-blur transition-all hover:border-ink/30 hover:bg-white active:scale-95 shadow-sm"
            >
              Open Dashboard
            </a>
          </div>
        </div>

        {/* 3 Proof Stat Cards inside the Framed Hero */}
        <div className="relative mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoCard
            icon={<FileText className="h-4 w-4 text-coral-500" />}
            title="Upload anything"
            body="PDFs, docs, and URLs become searchable knowledge in seconds."
            delay="0ms"
          />
          <InfoCard
            icon={<ShieldCheck className="h-4 w-4 text-coral-500" />}
            title="Grounded answers"
            body="Every response cites your sources so teams can trust the output."
            delay="120ms"
          />
          <InfoCard
            icon={<Zap className="h-4 w-4 text-coral-500" />}
            title="Fast responses"
            body="Answers in under 2 seconds, available 24/7 across every channel."
            delay="240ms"
          />
        </div>

        {/* Mini Meta Proof Strip */}
        <div className="reveal mt-8 pt-6 border-t border-ink/10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium text-ink/55">
          <span className="inline-flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-coral-500" /> 1-Line Embed Script
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-coral-500" /> Multi-Tenant Namespace Isolation
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-coral-500" /> Powered by Gemini & Pinecone
          </span>
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  icon,
  title,
  body,
  delay = '0ms',
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  delay?: string;
}) {
  return (
    <div
      className="reveal glass rounded-2xl p-5 text-left transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
      style={{ transitionDelay: delay }}
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-coral-50 border border-coral-100 shadow-sm">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-ink font-display">{title}</h3>
      <p className="mt-1 text-xs text-ink/60 leading-relaxed">{body}</p>
    </div>
  );
}
