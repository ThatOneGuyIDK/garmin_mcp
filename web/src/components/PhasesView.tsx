import type { CSSProperties } from 'react'
import { PHASES, PLAN_STATS, formatShort } from '../data/plan'

export default function PhasesView() {
  return (
    <div className="phases">
      <div className="phases-intro">
        <div>
          <p className="eyebrow">The build</p>
          <h2>
            {PLAN_STATS.weeks} weeks, {PHASES.length} phases
          </h2>
        </div>
        <p className="phases-lede">
          {PLAN_STATS.totalMiles.toLocaleString()} training miles · peak{' '}
          {PLAN_STATS.peakMiles} mi/week · sub-3:45 marathon on April 3 · 100K on
          September 25
        </p>
      </div>

      <div className="timeline" aria-hidden="true">
        {PHASES.map((p) => (
          <div
            key={p.id}
            className="timeline-seg"
            style={{ flexGrow: p.weeks, background: p.color }}
            title={`${p.name} · ${p.weeks} week${p.weeks === 1 ? '' : 's'}`}
          />
        ))}
      </div>

      <div className="phase-grid">
        {PHASES.map((p) => (
          <article
            key={p.id}
            className="phase-card"
            style={{ '--phase': p.color } as CSSProperties}
          >
            <div className="phase-head">
              <span className="dot" style={{ background: p.color }} />
              <h3>{p.name}</h3>
              <span className="phase-weeks">
                {p.weeks} wk{p.weeks === 1 ? '' : 's'}
              </span>
            </div>
            <p className="phase-dates">
              {formatShort(p.start)} – {formatShort(p.end)}
            </p>
            <p className="phase-focus">{p.focus}</p>

            <div className="phase-stats">
              <div>
                <span>Weekly</span>
                <strong>{p.weeklyMiles}</strong>
              </div>
              <div>
                <span>Long run</span>
                <strong>{p.longRun}</strong>
              </div>
              <div>
                <span>Vert</span>
                <strong>{p.vert}</strong>
              </div>
            </div>

            <ul>
              {p.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}
