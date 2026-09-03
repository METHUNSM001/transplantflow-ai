import { Activity, AlertTriangle, Bell, Clock3, HeartPulse, ShieldCheck, Users } from 'lucide-react'
import { Gauge, MapPinned, Stethoscope } from 'lucide-react'

const kpis = [
  { label: 'Active Organs', value: '18', icon: HeartPulse, tone: 'emerald' },
  { label: 'Critical Organs', value: '3', icon: AlertTriangle, tone: 'red' },
  { label: 'In Transit', value: '6', icon: MapPinned, tone: 'sky' },
  { label: 'High Risk', value: '4', icon: Gauge, tone: 'amber' },
  { label: 'Hospital Readiness', value: '88%', icon: ShieldCheck, tone: 'violet' },
  { label: 'Active Alerts', value: '9', icon: Bell, tone: 'rose' },
]

const organs = [
  { organ: 'Heart', remaining: '03:42:18', risk: 'LOW', status: 'In Transit' },
  { organ: 'Lung', remaining: '01:48:22', risk: 'MEDIUM', status: 'Match Review' },
  { organ: 'Liver', remaining: '00:32:10', risk: 'CRITICAL', status: 'Critical Watch' },
  { organ: 'Kidney', remaining: '12:20:44', risk: 'LOW', status: 'Ready' },
]

const alerts = [
  { severity: 'CRITICAL', title: 'Heart preservation deadline is approaching', detail: 'ETA is 18 minutes from safe threshold.' },
  { severity: 'HIGH', title: 'Estimated arrival is close to preservation limit', detail: 'Traffic delay has added 22 minutes.' },
  { severity: 'MEDIUM', title: 'Receiving hospital readiness is incomplete', detail: 'Blood preparation remains pending.' },
]

const scenarios = [
  { scenario: 'Route A', eta: '1h 50m', safety: '20m', risk: 'Medium' },
  { scenario: 'Route B', eta: '1h 25m', safety: '45m', risk: 'Low' },
  { scenario: 'Route C', eta: '2h 10m', safety: '0m', risk: 'Critical' },
]

const timeline = [
  '10:30 AM – Organ Retrieved',
  '10:45 AM – Preservation Started',
  '11:10 AM – Candidate Matching Generated',
  '11:30 AM – Transport Assigned',
  '11:45 AM – Transport Started',
  '12:30 PM – Traffic Delay Detected',
  '12:40 PM – ETA Updated',
  '12:45 PM – Risk Increased',
  '13:00 PM – Hospital Readiness Confirmed',
]

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/30 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">TransplantFlow AI</p>
            <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">Transplant Command Center</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200">Load Demo Data</button>
            <button className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white">Run Live Demo</button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {kpis.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{value}</p>
                </div>
                <div className={`rounded-xl p-2 ${tone === 'emerald' ? 'bg-emerald-500/15 text-emerald-300' : tone === 'red' ? 'bg-red-500/15 text-red-300' : tone === 'sky' ? 'bg-sky-500/15 text-sky-300' : tone === 'amber' ? 'bg-amber-500/15 text-amber-300' : tone === 'violet' ? 'bg-violet-500/15 text-violet-300' : 'bg-rose-500/15 text-rose-300'}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[2fr_1.1fr]">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Organ overview</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Cold ischemia & digital twin</h2>
              </div>
              <div className="badge border-emerald-500/30 bg-emerald-500/10 text-emerald-300">SAFE MARGIN: 30 MINUTES</div>
            </div>

            <div className="space-y-3">
              {organs.map(({ organ, remaining, risk, status }) => (
                <div key={organ} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-300"><HeartPulse size={18} /></div>
                      <div>
                        <p className="font-semibold text-white">{organ}</p>
                        <p className="text-sm text-slate-400">{status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Remaining</p>
                        <p className="font-semibold text-white">{remaining}</p>
                      </div>
                      <span className={`badge ${risk === 'LOW' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : risk === 'MEDIUM' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : risk === 'CRITICAL' ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-sky-500/30 bg-sky-500/10 text-sky-300'}`}>
                        {risk}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Alerts</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Realtime operations</h2>
              </div>
              <Bell className="text-cyan-300" size={20} />
            </div>
            <div className="space-y-3">
              {alerts.map(({ severity, title, detail }) => (
                <div key={title} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`badge ${severity === 'CRITICAL' ? 'border-red-500/30 bg-red-500/10 text-red-300' : severity === 'HIGH' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'}`}>
                      {severity}
                    </span>
                    <button className="text-xs text-slate-300">Acknowledge</button>
                  </div>
                  <p className="font-medium text-white">{title}</p>
                  <p className="mt-1 text-sm text-slate-400">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-3">
              <Activity className="text-cyan-300" size={20} />
              <h2 className="text-xl font-semibold text-white">Alternative scenario comparison</h2>
            </div>
            <div className="space-y-3">
              {scenarios.map(({ scenario, eta, safety, risk }) => (
                <div key={scenario} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                  <div>
                    <p className="font-medium text-white">{scenario}</p>
                    <p className="text-sm text-slate-400">ETA {eta}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">Safety margin {safety}</p>
                    <p className="text-sm text-cyan-300">Risk {risk}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-4 flex items-center gap-3">
              <Clock3 className="text-violet-300" size={20} />
              <h2 className="text-xl font-semibold text-white">Organ timeline</h2>
            </div>
            <div className="space-y-4 border-l border-slate-700 pl-4">
              {timeline.map((item, index) => (
                <div key={item} className="relative pl-4">
                  <span className="absolute -left-[1.45rem] top-1.5 h-3 w-3 rounded-full bg-cyan-400 ring-4 ring-slate-900" />
                  <p className="text-sm text-slate-300">{item}</p>
                  {index < timeline.length - 1 && <div className="mt-3 h-8 border-l border-slate-700" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-3">
              <Stethoscope className="text-emerald-300" size={20} />
              <h2 className="text-xl font-semibold text-white">Hospital readiness</h2>
            </div>
            <div className="space-y-3">
              {['Operating Room', 'ICU', 'Surgical Team', 'Blood Preparation', 'Recipient Readiness'].map((item, idx) => (
                <div key={item}>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-200">
                    <span>{item}</span>
                    <span>{idx === 3 ? '❌' : '✅'}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: idx === 3 ? '80%' : '100%' }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-lg font-semibold text-emerald-300">Hospital Readiness: 80%</p>
          </div>

          <div className="card p-5">
            <div className="mb-4 flex items-center gap-3">
              <Users className="text-violet-300" size={20} />
              <h2 className="text-xl font-semibold text-white">Decision-support candidate ranking</h2>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Candidate A', score: '94%', reason: 'High compatibility and quick arrival' },
                { name: 'Candidate B', score: '87%', reason: 'Strong urgency and feasible timing' },
                { name: 'Candidate C', score: '81%', reason: 'Good match but longer transport ETA' },
              ].map((candidate) => (
                <div key={candidate.name} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{candidate.name}</p>
                    <span className="text-cyan-300">Score: {candidate.score}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{candidate.reason}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400">Candidate ranking is decision support only and does not determine final transplant allocation.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
