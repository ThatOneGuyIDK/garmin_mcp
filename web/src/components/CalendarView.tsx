import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  MONTHS,
  PHASES,
  PHASE_BY_ID,
  WEEKS,
  WORKOUTS,
  WORKOUT_BY_DATE,
  formatLong,
  formatShort,
  todayISO,
} from '../data/plan'
import type { Workout } from '../data/plan'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function monthCells(monthKey: string): (string | null)[] {
  const [year, mon] = monthKey.split('-').map(Number)
  const first = new Date(Date.UTC(year, mon - 1, 1))
  const days = new Date(Date.UTC(year, mon, 0)).getUTCDate()
  const offset = (first.getUTCDay() + 6) % 7
  const cells: (string | null)[] = Array.from({ length: offset }, () => null)

  for (let d = 1; d <= days; d += 1) {
    cells.push(
      `${year}-${String(mon).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    )
  }

  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function icsEscape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function foldLine(line: string): string {
  const chunks: string[] = []
  let rest = line
  while (rest.length > 75) {
    chunks.push(rest.slice(0, 75))
    rest = ` ${rest.slice(75)}`
  }
  chunks.push(rest)
  return chunks.join('\r\n')
}

function downloadICS() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Grindstone 100K Plan//EN',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:Grindstone 100K Plan',
  ]

  for (const w of WORKOUTS) {
    const dt = w.date.replace(/-/g, '')
    lines.push(
      'BEGIN:VEVENT',
      `UID:${w.date}-${w.kind}@grindstone-plan`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${dt}`,
      `SUMMARY:${icsEscape(`${w.title} — ${w.miles} mi`)}`,
      `DESCRIPTION:${icsEscape(w.detail)}`,
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')

  const blob = new Blob([lines.map(foldLine).join('\r\n')], {
    type: 'text/calendar;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'grindstone-100k-plan.ics'
  link.click()
  URL.revokeObjectURL(url)
}

export default function CalendarView() {
  const today = todayISO()
  const initialMonth = (() => {
    const idx = MONTHS.findIndex((m) => m.key === today.slice(0, 7))
    return idx >= 0 ? idx : 0
  })()

  const [monthIdx, setMonthIdx] = useState(initialMonth)
  const [selected, setSelected] = useState<string | null>(null)

  const month = MONTHS[monthIdx]
  const cells = useMemo(() => monthCells(month.key), [month.key])
  const selectedWorkout = selected ? WORKOUT_BY_DATE.get(selected) : undefined

  const goToday = () => {
    const idx = MONTHS.findIndex((m) => m.key === today.slice(0, 7))
    if (idx >= 0) setMonthIdx(idx)
    setSelected(WORKOUT_BY_DATE.has(today) ? today : null)
  }

  const goMarathon = () => {
    const idx = MONTHS.findIndex((m) => m.key === '2027-04')
    if (idx >= 0) setMonthIdx(idx)
    setSelected('2027-04-03')
  }

  const goFifty = () => {
    const idx = MONTHS.findIndex((m) => m.key === '2027-06')
    if (idx >= 0) setMonthIdx(idx)
    setSelected('2027-06-05')
  }

  const goRace = () => {
    const idx = MONTHS.findIndex((m) => m.key === '2027-09')
    if (idx >= 0) setMonthIdx(idx)
    setSelected('2027-09-25')
  }

  return (
    <div className="calendar-layout">
      <section className="calendar-main" aria-label="Training calendar">
        <div className="calendar-toolbar">
          <div className="month-nav">
            <button
              className="icon-btn"
              onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
              disabled={monthIdx === 0}
              aria-label="Previous month"
            >
              ‹
            </button>
            <h2>{month.label}</h2>
            <button
              className="icon-btn"
              onClick={() =>
                setMonthIdx((i) => Math.min(MONTHS.length - 1, i + 1))
              }
              disabled={monthIdx === MONTHS.length - 1}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="toolbar-actions">
            <button className="ghost-btn" onClick={goToday}>
              Today
            </button>
            <button className="ghost-btn" onClick={goMarathon}>
              Marathon
            </button>
            <button className="ghost-btn" onClick={goFifty}>
              50M run
            </button>
            <button className="ghost-btn" onClick={goRace}>
              Grindstone
            </button>
            <button className="ghost-btn accent-btn" onClick={downloadICS}>
              Download .ics
            </button>
          </div>
        </div>

        <div className="weekday-row" aria-hidden="true">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {cells.map((iso, i) => {
            if (!iso) return <div key={`empty-${i}`} className="day day-empty" />

            const workout = WORKOUT_BY_DATE.get(iso)
            const phase = workout ? PHASE_BY_ID.get(workout.phase) : undefined
            const isToday = iso === today
            const isRace = workout?.kind === 'race'
            const isSelected = selected === iso

            return (
              <button
                key={iso}
                className={[
                  'day',
                  workout ? 'has-workout' : '',
                  isToday ? 'today' : '',
                  isRace ? 'race' : '',
                  isSelected ? 'selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={
                  workout
                    ? ({ '--phase': phase?.color } as CSSProperties)
                    : undefined
                }
                onClick={() => workout && setSelected(iso)}
                disabled={!workout}
                aria-label={
                  workout
                    ? `${formatLong(iso)}: ${workout.title}, ${workout.miles} miles`
                    : formatLong(iso)
                }
              >
                <span className="day-num">{Number(iso.slice(8, 10))}</span>
                {workout && (
                  <span className="workout-chip">
                    <span className="chip-title">{workout.title}</span>
                    <span className="chip-miles">{workout.miles} mi</span>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      <aside className="calendar-side">
        <div className="legend">
          <h3>Phases</h3>
          <div className="legend-grid">
            {PHASES.map((p) => (
              <div key={p.id} className="legend-row">
                <span className="dot" style={{ background: p.color }} />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedWorkout ? (
          <WorkoutCard
            workout={selectedWorkout}
            onClose={() => setSelected(null)}
          />
        ) : (
          <div className="hint">
            <span className="hint-icon">↖</span>
            <p>Tap any workout to see the details for that day.</p>
          </div>
        )}
      </aside>
    </div>
  )
}

function WorkoutCard({
  workout,
  onClose,
}: {
  workout: Workout
  onClose: () => void
}) {
  const phase = PHASE_BY_ID.get(workout.phase)
  const week = workout.weekIndex > 0 ? WEEKS[workout.weekIndex - 1] : undefined

  return (
    <article
      className="detail"
      style={{ '--phase': phase?.color } as CSSProperties}
    >
      <div className="detail-top">
        <span className="phase-pill">{phase?.name}</span>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <p className="detail-date">{formatLong(workout.date)}</p>
      <h3>{workout.title}</h3>
      <p className="detail-miles">
        {workout.miles} <span>mi</span>
      </p>
      <p className="detail-copy">{workout.detail}</p>

      {week && (
        <div className="week-summary">
          <div className="week-summary-head">
            <span>
              Week {week.index} · {week.total} mi
            </span>
            <span className="week-dates">
              {formatShort(week.start)} – {formatShort(week.end)}
            </span>
          </div>
          <div className="week-grid">
            <span>Tue · {week.tue} mi</span>
            <span>Thu · {week.thu} mi</span>
            <span>
              Sat · {week.race ? 'race' : week.long ? `${week.long} mi` : 'rest'}
            </span>
            <span>Sun · {week.sun ? `${week.sun} mi` : 'rest'}</span>
          </div>
          {week.note && <p className="week-note">{week.note}</p>}
          {week.cutback && <p className="week-note cutback">Cutback week.</p>}
        </div>
      )}

      {workout.weekIndex === 0 && (
        <p className="detail-week">Tune-up race · before week 1</p>
      )}
    </article>
  )
}
