import { useEffect, useMemo, useState } from 'react'
import { WORKOUTS, todayISO } from '../data/plan'

const MI = 1609.344

type Daily = {
  date: string
  steps: number | null
  distance_m: number | null
  resting_hr: number | null
  min_hr: number | null
  max_hr: number | null
  stress_avg: number | null
  stress_max: number | null
  spo2_avg: number | null
  respiration_avg: number | null
  body_battery_high: number | null
  body_battery_low: number | null
  body_battery_wake: number | null
  sleep_seconds: number | null
  sleep_score: number | null
  deep_sleep_s: number | null
  light_sleep_s: number | null
  rem_sleep_s: number | null
  awake_s: number | null
  sleep_start: string | null
  sleep_end: string | null
  hrv_avg: number | null
  hrv_weekly_avg: number | null
  hrv_high: number | null
  hrv_status: string | null
  vo2max: number | null
}

type Activity = {
  id: number
  date: string
  start_time: string | null
  name: string | null
  type: string | null
  distance_m: number | null
  duration_s: number | null
  moving_s: number | null
  avg_speed_mps: number | null
  avg_hr: number | null
  max_hr: number | null
  calories: number | null
  elevation_gain_m: number | null
  elevation_loss_m: number | null
  cadence: number | null
  aerobic_te: number | null
  anaerobic_te: number | null
  vo2max: number | null
  training_load: number | null
  location: string | null
  event_type: string | null
}

type Snapshot = {
  generated_at: string
  last_sync: string | null
  counts: { days: number; activities: number; split_sets: number }
  daily: Daily[]
  activities: Activity[]
}

type Status = 'loading' | 'ready' | 'empty' | 'error'

function shiftDays(iso: string, delta: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

function mondayOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  const offset = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - offset)
  return d.toISOString().slice(0, 10)
}

function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

function miles(metres: number | null): number {
  return (metres ?? 0) / MI
}

function paceSeconds(activity: Activity): number | null {
  const distance = activity.distance_m ?? 0
  const seconds = activity.moving_s ?? activity.duration_s ?? 0
  if (distance < 100 || seconds <= 0) return null
  return seconds / (distance / MI)
}

function formatPace(seconds: number | null): string {
  if (!seconds || !Number.isFinite(seconds)) return '--'
  const total = Math.round(seconds)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function formatHours(seconds: number | null): string {
  if (!seconds) return '--'
  return `${(seconds / 3600).toFixed(1)}h`
}

function average(values: number[]): number | null {
  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function isRun(activity: Activity): boolean {
  return (activity.type ?? '').includes('run')
}

export default function DashboardView() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let cancelled = false
    fetch('data/garmin.json', { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<Snapshot>
      })
      .then((data) => {
        if (cancelled) return
        setSnapshot(data)
        setStatus(data.activities?.length ? 'ready' : 'empty')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const runs = useMemo(
    () =>
      (snapshot?.activities ?? [])
        .filter(isRun)
        .slice()
        .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? '')),
    [snapshot],
  )

  const daily = useMemo(
    () => (snapshot?.daily ?? []).slice().sort((a, b) => a.date.localeCompare(b.date)),
    [snapshot],
  )

  const today = todayISO()

  if (status === 'loading') {
    return <p className="dash-note">Loading Garmin data…</p>
  }

  if (status === 'empty') {
    return <p className="dash-note">No activities cached yet. Run the sync to fill the database.</p>
  }

  if (status === 'error' || !snapshot) {
    return (
      <div className="dash-note">
        <strong>No local Garmin snapshot found.</strong> Generate one with:
        <code className="dash-code">uv run garmin-sync --days 90</code>
        The dashboard reads <code className="dash-code">web/public/data/garmin.json</code> and never
        calls Garmin directly.
      </div>
    )
  }

  const last7 = shiftDays(today, -6)
  const last28 = shiftDays(today, -27)
  const runs7 = runs.filter((run) => run.date >= last7)
  const runs28 = runs.filter((run) => run.date >= last28)
  const miles7 = runs7.reduce((sum, run) => sum + miles(run.distance_m), 0)
  const miles28 = runs28.reduce((sum, run) => sum + miles(run.distance_m), 0)
  const longest28 = runs28.reduce((best, run) => Math.max(best, miles(run.distance_m)), 0)
  const vert28 = runs28.reduce((sum, run) => sum + (run.elevation_gain_m ?? 0), 0)

  const daily7 = daily.filter((day) => day.date >= last7)
  const daily30 = daily.filter((day) => day.date >= shiftDays(today, -29))

  const rhr7 = average(daily7.map((day) => day.resting_hr).filter((v): v is number => v != null))
  const hrv7 = average(daily7.map((day) => day.hrv_avg).filter((v): v is number => v != null))
  const sleep7 = average(daily7.map((day) => day.sleep_seconds).filter((v): v is number => v != null))
  const battery7 = average(
    daily7.map((day) => day.body_battery_wake).filter((v): v is number => v != null),
  )
  const vo2 = runs.reduce<number | null>(
    (latest, run) => run.vo2max ?? latest,
    null,
  )

  // Weekly volume: actual vs planned, last 14 weeks ending this week.
  const plannedByWeek = new Map<string, number>()
  for (const workout of WORKOUTS) {
    const key = mondayOf(workout.date)
    plannedByWeek.set(key, (plannedByWeek.get(key) ?? 0) + workout.miles)
  }

  const actualByWeek = new Map<string, number>()
  for (const run of runs) {
    const key = mondayOf(run.date)
    actualByWeek.set(key, (actualByWeek.get(key) ?? 0) + miles(run.distance_m))
  }

  const thisMonday = mondayOf(today)
  const weeks = Array.from({ length: 14 }, (_, index) => {
    const start = shiftDays(thisMonday, -7 * (13 - index))
    return {
      start,
      planned: plannedByWeek.get(start) ?? 0,
      actual: actualByWeek.get(start) ?? 0,
    }
  })

  const longRuns = runs
    .filter((run) => miles(run.distance_m) >= 12)
    .slice(-12)

  const scatter = runs.filter((run) => {
    const distance = miles(run.distance_m)
    return (
      run.date >= shiftDays(today, -119) &&
      run.avg_hr != null &&
      paceSeconds(run) != null &&
      distance >= 3 &&
      distance <= 27
    )
  })

  return (
    <div className="dash">
      <div className="dash-status">
        <div>
          <p className="eyebrow">Garmin snapshot</p>
          <h2>Cached training data</h2>
          <p className="dash-meta">
            {snapshot.counts.days} days · {snapshot.counts.activities} activities · last sync{' '}
            {snapshot.last_sync ? new Date(snapshot.last_sync).toLocaleString() : 'unknown'}
          </p>
        </div>
        <div className="dash-status-actions">
          <span className="dash-badge">local only</span>
          <code className="dash-code">uv run garmin-sync --days 30</code>
        </div>
      </div>

      <div className="dash-kpis">
        <Kpi value={miles7.toFixed(1)} unit="mi" label="last 7 days" />
        <Kpi value={miles28.toFixed(0)} unit="mi" label="last 28 days" />
        <Kpi value={longest28.toFixed(1)} unit="mi" label="longest 28 days" />
        <Kpi value={Math.round(vert28).toLocaleString()} unit="ft" label="climb 28 days" />
        <Kpi value={rhr7 ? String(Math.round(rhr7)) : '--'} unit="bpm" label="resting HR 7d" />
        <Kpi value={hrv7 ? String(Math.round(hrv7)) : '--'} unit="ms" label="HRV 7d" />
        <Kpi value={sleep7 ? formatHours(sleep7) : '--'} unit="" label="sleep 7d" />
        <Kpi value={battery7 ? String(Math.round(battery7)) : '--'} unit="" label="battery wake" />
        <Kpi value={vo2 ? vo2.toFixed(0) : '--'} unit="" label="VO2max" />
      </div>

      <div className="dash-grid">
        <article className="dash-card wide">
          <header className="dash-card-head">
            <h3>Weekly volume</h3>
            <span className="dash-legend">
              <i className="swatch planned" /> planned
              <i className="swatch actual" /> actual
            </span>
          </header>
          <VolumeChart weeks={weeks} />
        </article>

        <article className="dash-card">
          <header className="dash-card-head">
            <h3>Pace vs heart rate</h3>
            <span className="dash-meta">runs 3–27 mi · 120 days</span>
          </header>
          <PaceScatter runs={scatter} />
        </article>

        <article className="dash-card">
          <header className="dash-card-head">
            <h3>Long runs</h3>
            <span className="dash-meta">12 mi and up</span>
          </header>
          {longRuns.length === 0 && <p className="dash-note">Nothing long cached yet.</p>}
          <ul className="dash-longlist">
            {longRuns.map((run) => {
              const distance = miles(run.distance_m)
              return (
                <li key={run.id}>
                  <span className="dash-longdate">{shortDate(run.date)}</span>
                  <span className="dash-longbar">
                    <i style={{ width: `${Math.min(100, (distance / 34) * 100)}%` }} />
                  </span>
                  <span className="dash-longval">{distance.toFixed(1)} mi</span>
                  <span className="dash-longpace">
                    {formatPace(paceSeconds(run))}/mi · {run.avg_hr ?? '--'} bpm
                  </span>
                </li>
              )
            })}
          </ul>
        </article>

        <article className="dash-card wide">
          <header className="dash-card-head">
            <h3>Recovery</h3>
            <span className="dash-meta">last 30 days</span>
          </header>
          <div className="dash-sparks">
            <Sparkline
              label="Resting HR"
              unit="bpm"
              color="#f87171"
              points={daily30.map((day) => ({ date: day.date, value: day.resting_hr }))}
            />
            <Sparkline
              label="HRV"
              unit="ms"
              color="#34d399"
              points={daily30.map((day) => ({ date: day.date, value: day.hrv_avg }))}
            />
            <Sparkline
              label="Sleep"
              unit="h"
              color="#60a5fa"
              points={daily30.map((day) => ({
                date: day.date,
                value: day.sleep_seconds == null ? null : day.sleep_seconds / 3600,
              }))}
            />
            <Sparkline
              label="Body battery"
              unit=""
              color="#f5b942"
              points={daily30.map((day) => ({ date: day.date, value: day.body_battery_wake }))}
            />
          </div>
        </article>

        <article className="dash-card wide">
          <header className="dash-card-head">
            <h3>Recent activities</h3>
            <span className="dash-meta">newest first</span>
          </header>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Activity</th>
                  <th className="num">Mi</th>
                  <th className="num">Pace</th>
                  <th className="num">HR</th>
                  <th className="num">Gain</th>
                  <th className="num">TE</th>
                </tr>
              </thead>
              <tbody>
                {runs
                  .slice(-14)
                  .reverse()
                  .map((run) => (
                    <tr key={run.id}>
                      <td>{shortDate(run.date)}</td>
                      <td className="dash-name">{run.name ?? run.type}</td>
                      <td className="num">{miles(run.distance_m).toFixed(2)}</td>
                      <td className="num">{formatPace(paceSeconds(run))}</td>
                      <td className="num">{run.avg_hr ?? '--'}</td>
                      <td className="num">
                        {run.elevation_gain_m ? Math.round(run.elevation_gain_m * 3.28084) : '0'} ft
                      </td>
                      <td className="num">{run.aerobic_te?.toFixed(1) ?? '--'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <p className="dash-foot">
        Snapshot generated {new Date(snapshot.generated_at).toLocaleString()}. Refresh with{' '}
        <code className="dash-code">uv run garmin-sync --days 30</code>, commit the JSON, and Vercel
        picks it up. Nothing on this page talks to Garmin.
      </p>
    </div>
  )
}

function Kpi({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div className="dash-kpi">
      <strong>
        {value}
        {unit && <span>{unit}</span>}
      </strong>
      <em>{label}</em>
    </div>
  )
}

function VolumeChart({
  weeks,
}: {
  weeks: { start: string; planned: number; actual: number }[]
}) {
  const width = 720
  const height = 210
  const padding = { top: 12, right: 8, bottom: 26, left: 30 }
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom
  const max = Math.max(60, ...weeks.map((week) => Math.max(week.planned, week.actual)))
  const slot = plotW / weeks.length
  const barW = Math.min(18, slot / 2.6)

  const y = (value: number) => padding.top + plotH - (value / max) * plotH

  return (
    <svg className="dash-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Weekly mileage">
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
        <g key={tick}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={y(max * tick)}
            y2={y(max * tick)}
            className="grid-line"
          />
          <text x={padding.left - 6} y={y(max * tick) + 3} className="axis-label" textAnchor="end">
            {Math.round(max * tick)}
          </text>
        </g>
      ))}
      {weeks.map((week, index) => {
        const cx = padding.left + slot * index + slot / 2
        return (
          <g key={week.start}>
            <rect
              x={cx - barW - 1}
              y={y(week.planned)}
              width={barW}
              height={Math.max(0, padding.top + plotH - y(week.planned))}
              className="bar-planned"
              rx={3}
            >
              <title>{`Week of ${shortDate(week.start)}: planned ${week.planned} mi`}</title>
            </rect>
            <rect
              x={cx + 1}
              y={y(week.actual)}
              width={barW}
              height={Math.max(0, padding.top + plotH - y(week.actual))}
              className="bar-actual"
              rx={3}
            >
              <title>{`Week of ${shortDate(week.start)}: actual ${week.actual.toFixed(1)} mi`}</title>
            </rect>
            {index % 2 === 0 && (
              <text x={cx} y={height - 8} className="axis-label" textAnchor="middle">
                {shortDate(week.start)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function PaceScatter({ runs }: { runs: Activity[] }) {
  const width = 420
  const height = 240
  const padding = { top: 12, right: 12, bottom: 30, left: 34 }
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom

  const paces = runs.map((run) => paceSeconds(run)).filter((v): v is number => v != null)
  const hrs = runs.map((run) => run.avg_hr).filter((v): v is number => v != null)

  if (!paces.length || !hrs.length) {
    return <p className="dash-note">Not enough runs with HR data yet.</p>
  }

  const paceMin = Math.max(6 * 60, Math.min(...paces) - 20)
  const paceMax = Math.min(14 * 60, Math.max(...paces) + 20)
  const hrMin = Math.max(100, Math.min(...hrs) - 8)
  const hrMax = Math.min(205, Math.max(...hrs) + 8)

  const x = (pace: number) => padding.left + ((pace - paceMin) / (paceMax - paceMin)) * plotW
  const y = (hr: number) => padding.top + plotH - ((hr - hrMin) / (hrMax - hrMin)) * plotH

  const paceTicks = [paceMin, (paceMin + paceMax) / 2, paceMax]
  const hrTicks = [hrMin, (hrMin + hrMax) / 2, hrMax]

  return (
    <svg className="dash-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Pace versus heart rate">
      {hrTicks.map((tick) => (
        <g key={`hr-${tick}`}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={y(tick)}
            y2={y(tick)}
            className="grid-line"
          />
          <text x={padding.left - 6} y={y(tick) + 3} className="axis-label" textAnchor="end">
            {Math.round(tick)}
          </text>
        </g>
      ))}
      {paceTicks.map((tick) => (
        <text
          key={`pace-${tick}`}
          x={x(tick)}
          y={height - 8}
          className="axis-label"
          textAnchor="middle"
        >
          {formatPace(tick)}
        </text>
      ))}
      {runs.map((run) => {
        const pace = paceSeconds(run)
        if (pace == null || run.avg_hr == null) return null
        const distance = miles(run.distance_m)
        return (
          <circle
            key={run.id}
            cx={x(pace)}
            cy={y(run.avg_hr)}
            r={Math.min(9, 3 + distance / 5)}
            className="scatter-dot"
          >
            <title>{`${shortDate(run.date)} · ${distance.toFixed(1)} mi · ${formatPace(pace)}/mi · ${run.avg_hr} bpm`}</title>
          </circle>
        )
      })}
      <text x={padding.left + plotW / 2} y={height - 22} className="axis-title" textAnchor="middle">
        pace (min/mi) →
      </text>
    </svg>
  )
}

function Sparkline({
  label,
  unit,
  color,
  points,
}: {
  label: string
  unit: string
  color: string
  points: { date: string; value: number | null }[]
}) {
  const filtered = points.filter((point): point is { date: string; value: number } => point.value != null)
  const values = filtered.map((point) => point.value)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 1
  const spread = max - min || 1
  const width = 220
  const height = 56
  const latest = values.length ? values[values.length - 1] : null

  const path = filtered
    .map((point, index) => {
      const x = filtered.length === 1 ? width / 2 : (index / (filtered.length - 1)) * width
      const y = height - 6 - ((point.value - min) / spread) * (height - 14)
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <div className="dash-spark">
      <div className="dash-spark-head">
        <span>{label}</span>
        <strong style={{ color }}>
          {latest == null ? '--' : `${latest.toFixed(label === 'Sleep' ? 1 : 0)}${unit ? ` ${unit}` : ''}`}
        </strong>
      </div>
      {filtered.length > 1 ? (
        <svg viewBox={`0 0 ${width} ${height}`} className="dash-spark-svg" role="img" aria-label={label}>
          <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
        </svg>
      ) : (
        <p className="dash-note">Not enough days yet.</p>
      )}
      <span className="dash-spark-range">
        {values.length ? `${min.toFixed(label === 'Sleep' ? 1 : 0)} – ${max.toFixed(label === 'Sleep' ? 1 : 0)}` : ''}
      </span>
    </div>
  )
}
