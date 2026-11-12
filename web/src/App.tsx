import { useEffect, useMemo, useState } from 'react'
import CalendarView from './components/CalendarView'
import PhasesView from './components/PhasesView'
import RulesView from './components/RulesView'
import {
  PLAN_STATS,
  RACE,
  WORKOUTS,
  daysUntil,
  formatLong,
  todayISO,
} from './data/plan'

type Tab = 'calendar' | 'phases' | 'rules'

const TABS: { id: Tab; label: string }[] = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'phases', label: 'Phases' },
  { id: 'rules', label: 'Race day' },
]

function dayWord(n: number): string {
  return `${n} day${n === 1 ? '' : 's'}`
}

function tabFromHash(): Tab {
  const hash = window.location.hash.replace('#', '')
  return hash === 'phases' || hash === 'rules' ? hash : 'calendar'
}

export default function App() {
  const [tab, setTab] = useState<Tab>(tabFromHash)
  const today = todayISO()

  useEffect(() => {
    const onHashChange = () => setTab(tabFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const selectTab = (id: Tab) => {
    setTab(id)
    window.history.replaceState(null, '', id === 'calendar' ? '#' : `#${id}`)
  }
  const countdown = Math.max(0, daysUntil(RACE.date))

  const next = useMemo(
    () =>
      WORKOUTS.filter((w) => w.date >= today).sort((a, b) =>
        a.date.localeCompare(b.date),
      )[0],
    [today],
  )

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-top">
          <div className="hero-copy">
            <p className="eyebrow">Training plan · 2026–2027</p>
            <h1>
              Grindstone <span className="accent">100K</span>
            </h1>
            <p className="hero-sub">
              {RACE.location} · {formatLong(RACE.date)} · {RACE.start} start
            </p>
          </div>
          <div className="countdown" aria-label={`${countdown} days to race`}>
            <span className="countdown-num">{countdown}</span>
            <span className="countdown-label">days to race</span>
          </div>
        </div>

        <div className="hero-stats">
          <Stat value="62.1" label="miles" />
          <Stat value="11,000" label="ft gain" />
          <Stat value="18 h" label="cutoff" />
          <Stat value={String(PLAN_STATS.weeks)} label="weeks" />
          <Stat value={String(PLAN_STATS.peakMiles)} label="peak mi/wk" />
        </div>

        {next && (
          <div className="next-up">
            <span className="next-label">Next up</span>
            <span className="next-title">
              {next.title} · {next.miles} mi
            </span>
            <span className="next-date">
              {formatLong(next.date)}
              {next.date !== today && ` · in ${dayWord(daysUntil(next.date))}`}
            </span>
          </div>
        )}
      </header>

      <nav className="tabs" aria-label="Views">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => selectTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main>
        {tab === 'calendar' && <CalendarView />}
        {tab === 'phases' && <PhasesView />}
        {tab === 'rules' && <RulesView />}
      </main>

      <footer className="footer">
        Long runs default to Saturday. When life pushes one to Sunday, move the
        back-to-back to Monday and drop Tuesday that week.
      </footer>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}
