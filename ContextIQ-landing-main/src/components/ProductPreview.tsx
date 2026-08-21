import { Activity, FileText, MessageSquare, Users } from 'lucide-react';

export default function ProductPreview() {
  return (
    <section id="product" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-coral-500">
            The platform
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            One workspace for knowledge, assistants, and conversations
          </h2>
          <p className="mt-4 text-ink/60">
            Manage your sources, spin up assistants, and watch every conversation in a clean,
            unified dashboard built for business teams.
          </p>
        </div>

        {/* Dashboard mock */}
        <div className="reveal-scale relative mt-12">
          <div className="absolute -inset-x-6 -inset-y-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-coral-200/40 via-transparent to-coral-100/30 blur-2xl" />

          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xl">
            {/* Top bar */}
            <div className="flex items-center gap-2 border-b border-ink/10 bg-cloud px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-coral-400" />
                <span className="h-3 w-3 rounded-full bg-ink/20" />
                <span className="h-3 w-3 rounded-full bg-ink/10" />
              </div>
              <div className="ml-2 flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs text-ink/50 ring-1 ring-ink/10">
                app.contextiq.ai/dashboard
              </div>
            </div>

            <div className="grid grid-cols-12">
              {/* Sidebar */}
              <aside className="col-span-3 hidden border-r border-ink/10 bg-cloud p-4 sm:block">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-ink" />
                  <div className="h-3 w-20 rounded bg-ink/15" />
                </div>
                {[
                  { icon: <FileText className="h-4 w-4" />, label: 'Knowledge', active: true },
                  { icon: <MessageSquare className="h-4 w-4" />, label: 'Assistants' },
                  { icon: <Activity className="h-4 w-4" />, label: 'Conversations' },
                  { icon: <Users className="h-4 w-4" />, label: 'Workspaces' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      item.active ? 'bg-white text-ink shadow-sm' : 'text-ink/55'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                ))}
              </aside>

              {/* Main */}
              <div className="col-span-12 sm:col-span-9 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="h-4 w-32 rounded bg-ink/20" />
                    <div className="mt-2 h-3 w-48 rounded bg-ink/10" />
                  </div>
                  <div className="h-8 w-24 rounded-lg bg-coral-500" />
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { label: 'Sources', value: '128' },
                    { label: 'Assistants', value: '12' },
                    { label: 'Conversations', value: '4.2k' },
                    { label: 'Avg. response', value: '2.8s' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-ink/10 bg-cloud p-3">
                      <div className="text-xs text-ink/50">{s.label}</div>
                      <div className="mt-1 text-xl font-bold text-ink">{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Chart placeholder */}
                <div className="mt-5 rounded-xl border border-ink/10 bg-cloud p-4">
                  <div className="mb-3 h-3 w-24 rounded bg-ink/15" />
                  <div className="flex h-32 items-end gap-2">
                    {[40, 65, 52, 78, 60, 88, 72, 95, 68, 82, 58, 76].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-coral-400 to-coral-500 transition-all duration-700"
                        style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Conversation rows */}
                <div className="mt-5 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-3"
                    >
                      <div className="h-8 w-8 rounded-full bg-coral-100" />
                      <div className="flex-1">
                        <div className="h-3 w-1/2 rounded bg-ink/15" />
                        <div className="mt-1.5 h-2.5 w-3/4 rounded bg-ink/10" />
                      </div>
                      <div className="h-6 w-16 rounded-md bg-ink/5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
