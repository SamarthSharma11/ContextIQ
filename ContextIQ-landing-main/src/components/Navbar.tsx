import { useEffect, useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { useActiveSection } from '@/hooks/useActiveSection';

const links = [
  { id: 'product', label: 'Product' },
  { id: 'features', label: 'Features' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'pricing', label: 'Pricing' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(links.map((l) => l.id));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md border-b border-ink/10' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-8">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-coral-400 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink">ContextIQ</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active === l.id ? 'text-ink bg-ink/5' : 'text-ink/60 hover:text-ink'
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a href="#" className="text-sm font-medium text-ink/70 hover:text-ink transition-colors">
            Sign in
          </a>
          <a
            href="#cta"
            className="rounded-full bg-coral-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-coral-600 hover:shadow-md active:scale-95"
          >
            Get started
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden">
          <div className="mx-4 mb-3 rounded-2xl border border-ink/10 bg-white p-3 shadow-lg">
            {links.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-ink/80 hover:bg-ink/5"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#cta"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-lg bg-coral-500 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Get started
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
