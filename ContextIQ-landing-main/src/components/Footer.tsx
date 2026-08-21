import { Sparkles } from 'lucide-react';

const groups = [
  {
    title: 'Product',
    links: ['Features', 'Pricing', 'Integrations', 'Changelog'],
  },
  {
    title: 'Solutions',
    links: ['Support teams', 'Internal KB', 'SaaS embed', 'Multi-tenant'],
  },
  {
    title: 'Resources',
    links: ['Docs', 'Blog', 'Guides', 'API reference'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Contact', 'Privacy'],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-white/60">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2">
            <a href="#top" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-coral-400">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-ink">ContextIQ</span>
            </a>
            <p className="mt-3 max-w-xs text-sm text-ink/55">
              Custom AI chatbots grounded in your company knowledge. Trusted answers, in seconds.
            </p>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-ink/40">
                {g.title}
              </h4>
              <ul className="mt-3 space-y-2">
                {g.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-ink/60 hover:text-ink transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink/10 pt-6 sm:flex-row">
          <p className="text-xs text-ink/45">© 2026 ContextIQ. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-ink/45">
            <a href="#" className="hover:text-ink">Terms</a>
            <a href="#" className="hover:text-ink">Privacy</a>
            <a href="#" className="hover:text-ink">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
