import { ArrowRight, FileText, Link2, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import Mascot from '@/components/Mascot';

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 md:pt-36">
      {/* Backgrounds */}
      <div className="absolute inset-0 -z-20 grid-bg" />
      <div className="absolute inset-0 -z-10 spotlight" />
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-coral-300/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Eyebrow */}
        <div className="flex justify-center reveal">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-1.5 text-xs font-medium text-ink/70 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-coral-500" />
            Grounded AI assistants for modern teams
          </span>
        </div>

        {/* Oversized wordmark behind mascot */}
        <div className="relative mt-8 select-none">
          <h1 className="pointer-events-none absolute inset-x-0 -top-10 text-center text-[18vw] font-black leading-none tracking-tighter text-ink md:-top-16 md:text-[15vw]">
            ContextIQ
          </h1>

          {/* Mascot */}
          <div className="relative flex justify-center pt-6">
            <Mascot className="reveal-scale" />
          </div>
        </div>

        {/* Headline + copy */}
        <div className="relative -mt-2 text-center">
          <h2 className="reveal text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl">
            Custom AI chatbots grounded in
            <br className="hidden sm:block" />{' '}
            <span className="shimmer-text">your company knowledge</span>
          </h2>
          <p className="reveal mx-auto mt-5 max-w-2xl text-base text-ink/60 md:text-lg">
            Upload PDFs and connect your website. ContextIQ builds assistants that answer
            with sources, stay on-brand, and serve every customer in their own private workspace.
          </p>

          {/* CTAs */}
          <div className="reveal mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#cta"
              className="group inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-coral-600 hover:shadow-lg active:scale-95"
            >
              Start building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#product"
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-6 py-3.5 text-sm font-semibold text-ink backdrop-blur transition-all hover:border-ink/30 hover:bg-white active:scale-95"
            >
              Explore the platform
            </a>
          </div>
        </div>

        {/* Floating info cards */}
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
            body="Answers in under 3 seconds, available 24/7 across every channel."
            delay="240ms"
          />
        </div>

        {/* Mini meta strip */}
        <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink/50">
          <span className="inline-flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5" /> No-code setup
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> SOC2-ready
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Multi-tenant
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
      className="reveal glass rounded-2xl p-4 text-left transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
      style={{ transitionDelay: delay }}
    >
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-coral-50">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-ink/55">{body}</p>
    </div>
  );
}
