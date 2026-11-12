const RULES = [
  {
    title: 'The 80/20 rule',
    body: 'About 80% of your running at 135–160 bpm, 20% hard. If you are unsure which one a run is, it is easy.',
  },
  {
    title: 'Long run rules',
    body: 'HR 145–160. 9:1 run/walk from the start. Even or negative split. If HR drifts more than 8 bpm in the second half, walk more.',
  },
  {
    title: 'Back-to-backs',
    body: 'Saturday long, Sunday about 60% of it, easy. This is the single most 100K-specific session in the plan.',
  },
  {
    title: 'Strength',
    body: '2×/week, 20 minutes: single-leg deadlifts, step-ups, calf raises, split squats, core. Non-negotiable at 60+ mi/week.',
  },
  {
    title: 'Fueling',
    body: '60–90 g carbs/h and 500–750 ml/h on every run over 2 hours. Practice real food, not just gels.',
  },
  {
    title: 'Cutback weeks',
    body: 'Every 4th week, cut volume 30–40%. The adaptation happens in the easy weeks, not the big ones.',
  },
  {
    title: 'Night & heat',
    body: 'One night run per month from May, one 4–6 h night run in summer. Afternoon heat runs in July and August.',
  },
  {
    title: 'Sleep',
    body: '8 hours. At this volume, 7.5 h eventually shows up as a niggle. Sleep is training.',
  },
]

const MARATHON_DAY = [
  {
    label: 'Goal',
    value: 'Sub-3:45',
    body: '8:35/mi average. Even effort, not even pace — Charlottesville is hilly (+2,300 ft).',
  },
  {
    label: 'First 5 mi',
    value: '8:40–8:45',
    body: 'Conservative. HR 160–170. Let the field go. Fuel at 30–40 min.',
  },
  {
    label: 'Miles 6–20',
    value: '8:30–8:35',
    body: 'Settle into goal pace. HR 170–182. Gel every 35–40 min and drink at every aid station.',
  },
  {
    label: 'Last 10K',
    value: '8:25–8:35',
    body: 'If the legs are there, squeeze. If not, hold 8:45 and finish. No hero miles.',
  },
]

const RACE_DAY = [
  {
    label: 'Cutoff math',
    value: '18 h',
    body: 'That is 13:30/mi average including aid stops. Run the flats and downhills, power-hike the climbs, keep stops under 5 minutes.',
  },
  {
    label: 'The crux',
    value: 'Mile 40',
    body: 'Reddish Knob near mile 40 on an 18-hour clock. Protect it with a conservative first 16 miles and fuel from mile 1.',
  },
  {
    label: 'Night section',
    value: '~21 mi',
    body: 'Sunset is around 6 PM. Two headlamps, spare batteries, and a layer for a 45°F night.',
  },
  {
    label: 'Gear',
    value: 'Tested',
    body: 'Poles from mile 16, vest with 2 L capacity, trail shoes, anti-chafe, and nothing new on race day.',
  },
]

export default function RulesView() {
  return (
    <div className="rules">
      <div className="rules-intro">
        <p className="eyebrow">Execute</p>
        <h2>Training rules</h2>
        <p className="rules-lede">
          The plan only works if the easy days stay easy. These are the rules
          that keep 70-mile weeks from turning into 70-mile injuries.
        </p>
      </div>

      <div className="rules-grid">
        {RULES.map((r) => (
          <article key={r.title} className="rule-card">
            <h3>{r.title}</h3>
            <p>{r.body}</p>
          </article>
        ))}
      </div>

      <div className="rules-intro race-intro">
        <p className="eyebrow">April 3, 2027 · B race</p>
        <h2>Charlottesville Marathon</h2>
      </div>

      <div className="race-grid">
        {MARATHON_DAY.map((r) => (
          <article key={r.label} className="race-card">
            <span className="race-label">{r.label}</span>
            <strong>{r.value}</strong>
            <p>{r.body}</p>
          </article>
        ))}
      </div>

      <div className="race-split">
        <div>
          <h3>How to run it</h3>
          <p>
            7:00 AM start at Market Street Park. The course is rolling and open
            to traffic; run the tangents and stay alert. Bank nothing in the
            first 10K. The race starts at mile 18 — that is where sub-3:45 is
            won or lost.
          </p>
        </div>
        <div>
          <h3>Course facts</h3>
          <ul>
            <li>26.2 mi · +2,300 ft · hilly</li>
            <li>~65% roads, 35% paved bike path</li>
            <li>Open to traffic · 6 h limit</li>
            <li>Start/finish: Market Street Park</li>
            <li>Fuel: 60–90 g/h · 500–750 ml/h</li>
            <li>Goal: 3:44–3:45 · 8:35/mi</li>
          </ul>
        </div>
      </div>

      <div className="rules-intro race-intro">
        <p className="eyebrow">September 25, 2027 · A race</p>
        <h2>Grindstone race day</h2>
      </div>

      <div className="race-grid">
        {RACE_DAY.map((r) => (
          <article key={r.label} className="race-card">
            <span className="race-label">{r.label}</span>
            <strong>{r.value}</strong>
            <p>{r.body}</p>
          </article>
        ))}
      </div>

      <div className="race-split">
        <div>
          <h3>How to run it</h3>
          <p>
            Start at 6:00 AM at Natural Chimneys. Hold effort through mile 16 —
            the field splits on the first big climb after mile 31. Settle into a
            run/hike rhythm, fuel every 45–60 minutes, and treat the night
            section as its own race. Finish by midnight.
          </p>
        </div>
        <div>
          <h3>Course facts</h3>
          <ul>
            <li>100 km / 62.1 mi · +11,000 ft</li>
            <li>~64% trail, 30% forest road, 6% paved</li>
            <li>High point ~4,259 ft at Reddish Knob</li>
            <li>Temps 45–85°F · ~21 miles in the dark</li>
            <li>Crew: North River Gap, Camp Todd, finish</li>
            <li>Pacers: 100-mile race only</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
