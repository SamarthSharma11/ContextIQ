import { Bot, Building2, Headset, Users } from 'lucide-react';

const cases = [
  {
    icon: <Headset className="h-5 w-5" />,
    title: 'Customer support',
    body: 'Deflect repetitive tickets with an assistant that knows your product inside out and hands off smoothly to humans.',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Internal knowledge base',
    body: 'Give every employee instant answers from your handbooks, policies, and past tickets, without searching through Slack.',
  },
  {
    icon: <Bot className="h-5 w-5" />,
    title: 'SaaS embed',
    body: 'Embed a grounded assistant inside your product so users get help in context, powered by your own documentation.',
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    title: 'Multi-tenant resale',
    body: 'Offer white-label assistants to your customers, each with isolated knowledge and branded conversations.',
  },
];

export default function UseCases() {
  return (
    <section id="solutions" className="relative bg-white/60 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-coral-500">
            Solutions
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Built for every team that needs trusted answers
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {cases.map((c, i) => (
            <div
              key={c.title}
              className={`reveal flex gap-4 rounded-2xl border border-ink/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${i % 2 === 0 ? 'reveal-left' : 'reveal-right'}`}
              style={{ transitionDelay: `${(i % 2) * 100}ms` }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coral-50 text-coral-500">
                {c.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/55">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
