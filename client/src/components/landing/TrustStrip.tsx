const logos = [
  'Northwind',
  'Lumen',
  'Vertex',
  'Cascade',
  'Helio',
  'Quanta',
  'Brightline',
  'Aerodot',
];

export default function TrustStrip() {
  return (
    <section className="relative border-y border-ink/10 bg-white/60 py-10">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="reveal text-center text-xs font-medium uppercase tracking-widest text-ink/40">
          Trusted by teams building with knowledge
        </p>

        <div className="relative mt-6 overflow-hidden">
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white/80 to-transparent" />

          <div className="flex w-max animate-marquee gap-12 pr-12">
            {[...logos, ...logos].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="whitespace-nowrap text-xl font-bold tracking-tight text-ink/35 transition-colors hover:text-ink/70"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
