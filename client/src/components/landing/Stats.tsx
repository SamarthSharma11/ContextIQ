const stats = [
  { value: '3s', label: 'Average response time' },
  { value: '92%', label: 'Questions resolved without a human' },
  { value: '4.2k', label: 'Conversations per workspace' },
  { value: '24/7', label: 'Always-on availability' },
];

export default function Stats() {
  return (
    <section className="relative py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-ink/10 bg-white p-6 text-center transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl font-black tracking-tight text-ink md:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs font-medium text-ink/55">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
