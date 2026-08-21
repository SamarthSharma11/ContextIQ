import { ArrowRight } from 'lucide-react';
import Mascot from '@/components/Mascot';

export default function CTA() {
  return (
    <section id="cta" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal relative overflow-hidden rounded-3xl border border-ink/10 bg-ink px-6 py-14 text-center md:px-12">
          {/* glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-coral-500/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.08]" />

          <div className="relative flex flex-col items-center">
            <Mascot className="scale-90" />

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Build your first grounded assistant today
            </h2>
            <p className="mt-4 max-w-xl text-white/60">
              Upload a few documents, connect a URL, and watch your assistant answer in seconds.
              Free to start, no credit card required.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <a
                href="#"
                className="group inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-coral-600 hover:shadow-lg active:scale-95"
              >
                Get started free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/40 active:scale-95"
              >
                Book a demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
