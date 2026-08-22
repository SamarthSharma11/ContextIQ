import {
  BarChart3,
  FileStack,
  Layers,
  MessageSquareText,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

const features = [
  {
    icon: <FileStack className="h-5 w-5" />,
    title: 'Knowledge ingestion',
    body: 'Drop in PDFs, docs, or point to a sitemap. ContextIQ chunks, embeds, and indexes everything automatically.',
  },
  {
    icon: <MessageSquareText className="h-5 w-5" />,
    title: 'Grounded conversations',
    body: 'Assistants answer only from your sources and cite them inline, so every reply is traceable and trustworthy.',
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: 'Custom assistants',
    body: 'Tune tone, instructions, and allowed sources per assistant. Ship a support bot, a sales copilot, or an internal guide.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Multi-tenant workspaces',
    body: 'Each customer or team gets an isolated workspace with its own knowledge, members, and permissions.',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Analytics & quality',
    body: 'Track usage, response times, and satisfaction. Spot gaps in your knowledge and improve continuously.',
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    title: 'Usage-based plans',
    body: 'Pay for what you use with transparent metering. Scale from a single assistant to thousands of conversations.',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-coral-500">
            Features
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Everything you need to ship a trusted AI assistant
          </h2>
          <p className="mt-4 text-ink/60">
            From the first upload to production conversations, ContextIQ handles the full lifecycle
            so your team can focus on the answers, not the plumbing.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`reveal group rounded-2xl border border-ink/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-coral-300 hover:shadow-lg ${i % 3 === 0 ? 'reveal-left' : i % 3 === 2 ? 'reveal-right' : 'reveal-scale'}`}
              style={{ transitionDelay: `${(i % 3) * 80}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-coral-400 transition-transform duration-300 group-hover:scale-110">
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/55">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
