import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/mo',
    blurb: 'For trying things out with a single assistant.',
    features: ['1 assistant', '50 sources', '500 conversations / mo', 'Community support'],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$49',
    period: '/mo',
    blurb: 'For teams shipping assistants to real users.',
    features: [
      '10 assistants',
      '1,000 sources',
      '10k conversations / mo',
      'Analytics dashboard',
      'Email support',
    ],
    cta: 'Start 14-day trial',
    highlight: true,
  },
  {
    name: 'Scale',
    price: 'Custom',
    period: '',
    blurb: 'For multi-tenant deployments and resale.',
    features: [
      'Unlimited assistants',
      'Unlimited sources',
      'Custom conversation volume',
      'Multi-tenant workspaces',
      'Priority support + SLA',
    ],
    cta: 'Talk to sales',
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-coral-500">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Simple, usage-based pricing
          </h2>
          <p className="mt-4 text-ink/60">
            Start free and scale as your conversations grow. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((p, i) => (
            <div
              key={p.name}
              className={`reveal relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                i === 1 ? 'reveal-scale' : i === 0 ? 'reveal-left' : 'reveal-right'
              } ${
                p.highlight
                  ? 'border-coral-400 bg-ink text-white shadow-xl'
                  : 'border-ink/10 bg-white text-ink hover:shadow-md'
              }`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-coral-500 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className={`mt-1 text-sm ${p.highlight ? 'text-white/60' : 'text-ink/55'}`}>
                {p.blurb}
              </p>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-black tracking-tight">{p.price}</span>
                <span className={`mb-1 text-sm ${p.highlight ? 'text-white/60' : 'text-ink/50'}`}>
                  {p.period}
                </span>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check
                      className={`h-4 w-4 ${p.highlight ? 'text-coral-400' : 'text-coral-500'}`}
                    />
                    <span className={p.highlight ? 'text-white/80' : 'text-ink/70'}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#cta"
                className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all active:scale-95 ${
                  p.highlight
                    ? 'bg-coral-500 text-white hover:bg-coral-600'
                    : 'border border-ink/15 text-ink hover:border-ink/30 hover:bg-cloud'
                }`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
