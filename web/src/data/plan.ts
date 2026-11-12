export type PhaseId =
  | 'reset'
  | 'base'
  | 'trail'
  | 'specific'
  | 'peak'
  | 'taper'
  | 'race'

export type Phase = {
  id: PhaseId
  name: string
  color: string
  start: string
  end: string
  weeks: number
  weeklyMiles: string
  longRun: string
  vert: string
  focus: string
  bullets: string[]
}

export type Week = {
  index: number
  start: string
  end: string
  phase: PhaseId
  long: number
  sun: number
  tue: number
  thu: number
  total: number
  cutback: boolean
  race: boolean
  note?: string
}

export type WorkoutKind = 'easy' | 'long' | 'back' | 'race' | 'half'

export type Workout = {
  date: string
  kind: WorkoutKind
  miles: number
  title: string
  detail: string
  phase: PhaseId
  weekIndex: number
}

export const RACE = {
  name: 'Grindstone 100K',
  date: '2027-09-25',
  start: '06:00',
  distanceMi: 62.1,
  vertFt: 11000,
  cutoffHours: 18,
  location: 'Natural Chimneys Park, Mount Solon, VA',
}

export const PLAN_START = '2026-11-16'

export const PHASES: Phase[] = [
  {
    id: 'reset',
    name: 'Reset',
    color: '#7d8ea3',
    start: '2026-11-16',
    end: '2026-12-13',
    weeks: 4,
    weeklyMiles: '19–25 mi',
    longRun: '8–12 mi',
    vert: '500–1,500 ft',
    focus: 'Recover, fix the intensity, rebuild consistency.',
    bullets: [
      'No long run for 10 days after the half marathon.',
      'Everything at 135–160 bpm. No hard efforts.',
      'Strength 2×/week: calves, hips, core.',
      'Build from 19 to 25 mi/week.',
    ],
  },
  {
    id: 'base',
    name: 'Base',
    color: '#22d3ee',
    start: '2026-12-14',
    end: '2027-02-28',
    weeks: 11,
    weeklyMiles: '25–41 mi',
    longRun: '12–20 mi',
    vert: '1,500–3,000 ft',
    focus: 'Aerobic volume, hills, and the first back-to-backs.',
    bullets: [
      'Strides 2×/week; hill repeats every other week.',
      'Back-to-backs start in February.',
      'Keep easy days genuinely easy — this is where the base is built.',
      'Cutback every 4th week.',
    ],
  },
  {
    id: 'trail',
    name: 'Trail build',
    color: '#34d399',
    start: '2027-03-01',
    end: '2027-05-09',
    weeks: 10,
    weeklyMiles: '40–50 mi',
    longRun: '20–26 mi',
    vert: '3,000–5,000 ft',
    focus: 'Time on trail, technical descents, and a spring 50K.',
    bullets: [
      'Weekly back-to-backs: Sat long, Sun ~60%.',
      'Power-hike grades above 15%.',
      'Spring 50K tune-up in late March or April.',
      'First course-recon weekend on Narrow Back / Wolf Ridge.',
    ],
  },
  {
    id: 'specific',
    name: 'Specific',
    color: '#fbbf24',
    start: '2027-05-10',
    end: '2027-07-04',
    weeks: 8,
    weeklyMiles: '50–58 mi',
    longRun: '26–28 mi',
    vert: '5,000–7,000 ft',
    focus: 'Night running, heat, poles, and a 50-mile tune-up.',
    bullets: [
      'One night run per month; one 4–6 h night run.',
      'Afternoon heat runs in June and July.',
      'Poles on all long runs.',
      '50-mile tune-up in late June or July.',
    ],
  },
  {
    id: 'peak',
    name: 'Peak',
    color: '#fb7185',
    start: '2027-07-05',
    end: '2027-08-22',
    weeks: 7,
    weeklyMiles: '60–70 mi',
    longRun: '30–34 mi',
    vert: '7,000–9,000 ft',
    focus: 'Race simulations and the biggest back-to-back weekends.',
    bullets: [
      'Two big back-to-back weekends, peaking at 34 + 20 mi.',
      'Full race sim: 6 AM start, race kit, race fuel.',
      'Course recon on Reddish Knob and the Wild Oak / Horse Trough section.',
      'One night descent on technical trail.',
    ],
  },
  {
    id: 'taper',
    name: 'Taper',
    color: '#a78bfa',
    start: '2027-08-23',
    end: '2027-09-19',
    weeks: 4,
    weeklyMiles: '53 → 18 mi',
    longRun: '26 → 8 mi',
    vert: '5,000 → 1,500 ft',
    focus: 'Freshen up, sleep, and dial in gear.',
    bullets: [
      'Cut volume ~25% per week.',
      'Keep a little vert and a few strides.',
      'Sleep 8 h; eat well; check every piece of gear.',
      'Nothing new on race day.',
    ],
  },
  {
    id: 'race',
    name: 'Race',
    color: '#f59e0b',
    start: '2027-09-20',
    end: '2027-09-25',
    weeks: 1,
    weeklyMiles: 'Race week',
    longRun: '100K',
    vert: '11,000 ft',
    focus: 'Grindstone 100K — Saturday, September 25, 2027.',
    bullets: [
      '6:00 AM start at Natural Chimneys Park.',
      '62.1 mi · 11,000 ft · 18 h cutoff.',
      'Run/hike; fuel every 45–60 min from mile 1.',
      'Finish by midnight.',
    ],
  },
]

type WeekSpec = {
  phase: PhaseId
  long: number
  sun: number
  tue: number
  thu: number
  cutback?: boolean
  race?: boolean
  note?: string
}

const SPECS: WeekSpec[] = [
  // Reset
  { phase: 'reset', long: 8, sun: 4, tue: 4, thu: 3, note: 'Recover from the half. All easy.' },
  { phase: 'reset', long: 10, sun: 5, tue: 4, thu: 3 },
  { phase: 'reset', long: 12, sun: 5, tue: 5, thu: 3 },
  { phase: 'reset', long: 9, sun: 4, tue: 4, thu: 2, cutback: true },
  // Base
  { phase: 'base', long: 12, sun: 5, tue: 5, thu: 3 },
  { phase: 'base', long: 13, sun: 5, tue: 5, thu: 3 },
  { phase: 'base', long: 14, sun: 6, tue: 5, thu: 3 },
  { phase: 'base', long: 10, sun: 4, tue: 4, thu: 2, cutback: true },
  { phase: 'base', long: 15, sun: 6, tue: 5, thu: 4 },
  { phase: 'base', long: 16, sun: 6, tue: 6, thu: 4 },
  { phase: 'base', long: 17, sun: 7, tue: 6, thu: 4 },
  { phase: 'base', long: 12, sun: 5, tue: 5, thu: 3, cutback: true },
  { phase: 'base', long: 18, sun: 8, tue: 6, thu: 4, note: 'First back-to-back.' },
  { phase: 'base', long: 19, sun: 9, tue: 6, thu: 4 },
  { phase: 'base', long: 20, sun: 10, tue: 7, thu: 4 },
  // Trail build
  { phase: 'trail', long: 14, sun: 6, tue: 5, thu: 4, cutback: true },
  { phase: 'trail', long: 20, sun: 11, tue: 7, thu: 4 },
  { phase: 'trail', long: 21, sun: 11, tue: 7, thu: 5 },
  { phase: 'trail', long: 22, sun: 12, tue: 7, thu: 5, note: 'Spring 50K tune-up window.' },
  { phase: 'trail', long: 16, sun: 8, tue: 6, thu: 4, cutback: true },
  { phase: 'trail', long: 22, sun: 12, tue: 8, thu: 5, note: 'Course recon weekend.' },
  { phase: 'trail', long: 23, sun: 12, tue: 8, thu: 5 },
  { phase: 'trail', long: 24, sun: 13, tue: 8, thu: 5 },
  { phase: 'trail', long: 18, sun: 9, tue: 6, thu: 4, cutback: true },
  { phase: 'trail', long: 24, sun: 13, tue: 8, thu: 5 },
  // Specific
  { phase: 'specific', long: 25, sun: 14, tue: 8, thu: 5, note: 'Night run #1.' },
  { phase: 'specific', long: 26, sun: 14, tue: 8, thu: 5 },
  { phase: 'specific', long: 20, sun: 10, tue: 7, thu: 4, cutback: true },
  { phase: 'specific', long: 26, sun: 14, tue: 9, thu: 5 },
  { phase: 'specific', long: 27, sun: 15, tue: 9, thu: 5, note: 'Heat training begins.' },
  { phase: 'specific', long: 28, sun: 15, tue: 9, thu: 6, note: '50-mile tune-up window.' },
  { phase: 'specific', long: 22, sun: 11, tue: 7, thu: 4, cutback: true },
  { phase: 'specific', long: 28, sun: 15, tue: 9, thu: 6 },
  // Peak
  { phase: 'peak', long: 30, sun: 16, tue: 9, thu: 6 },
  { phase: 'peak', long: 31, sun: 17, tue: 9, thu: 6 },
  { phase: 'peak', long: 32, sun: 18, tue: 10, thu: 6, note: 'Big back-to-back weekend.' },
  { phase: 'peak', long: 24, sun: 12, tue: 8, thu: 5, cutback: true },
  { phase: 'peak', long: 32, sun: 18, tue: 10, thu: 6, note: 'Full race simulation.' },
  { phase: 'peak', long: 33, sun: 19, tue: 10, thu: 6 },
  { phase: 'peak', long: 34, sun: 20, tue: 10, thu: 6, note: 'Peak week — 54-mile weekend.' },
  // Taper
  { phase: 'taper', long: 26, sun: 14, tue: 8, thu: 5 },
  { phase: 'taper', long: 20, sun: 10, tue: 7, thu: 4 },
  { phase: 'taper', long: 14, sun: 8, tue: 6, thu: 3 },
  { phase: 'taper', long: 8, sun: 4, tue: 4, thu: 2 },
  // Race
  { phase: 'race', long: RACE.distanceMi, sun: 0, tue: 5, thu: 3, race: true, note: 'Grindstone 100K — 6:00 AM Saturday.' },
]

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function parseISO(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`)
}

export function formatShort(iso: string): string {
  return parseISO(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatLong(iso: string): string {
  return parseISO(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function daysUntil(iso: string, from: Date = new Date()): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const target = parseISO(iso)
  const b = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate())
  return Math.round((b - a) / 86_400_000)
}

export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

export const WEEKS: Week[] = SPECS.map((spec, i) => {
  const start = addDays(PLAN_START, i * 7)
  return {
    index: i + 1,
    start,
    end: addDays(start, 6),
    phase: spec.phase,
    long: spec.long,
    sun: spec.sun,
    tue: spec.tue,
    thu: spec.thu,
    total: Math.round((spec.long + spec.sun + spec.tue + spec.thu) * 10) / 10,
    cutback: Boolean(spec.cutback),
    race: Boolean(spec.race),
    note: spec.note,
  }
})

const workouts: Workout[] = []

for (const week of WEEKS) {
  const push = (
    dayOffset: number,
    kind: WorkoutKind,
    miles: number,
    title: string,
    detail: string,
  ) => {
    workouts.push({
      date: addDays(week.start, dayOffset),
      kind,
      miles,
      title,
      detail,
      phase: week.phase,
      weekIndex: week.index,
    })
  }

  if (week.race) {
    push(
      5,
      'race',
      RACE.distanceMi,
      'Grindstone 100K',
      '6:00 AM start · 62.1 mi · 11,000 ft · 18 h cutoff · finish by midnight',
    )
  } else {
    push(
      5,
      'long',
      week.long,
      'Long run',
      'HR 145–160 · 9:1 run/walk · fuel 60–90 g/h',
    )
  }

  if (week.sun > 0) {
    const isBackToBack = ['trail', 'specific', 'peak', 'taper'].includes(week.phase)
    push(
      6,
      isBackToBack ? 'back' : 'easy',
      week.sun,
      isBackToBack ? 'Back-to-back' : 'Easy run',
      isBackToBack
        ? 'Easy Z2 · HR 145–160 · keep it genuinely easy'
        : 'Easy Z2 · HR 135–155 · conversational',
    )
  }

  if (week.tue > 0) {
    push(1, 'easy', week.tue, 'Easy run', 'Easy Z2 · HR 135–155 · conversational')
  }

  if (week.thu > 0) {
    push(3, 'easy', week.thu, 'Easy run', 'Easy Z2 · HR 135–155 · conversational')
  }
}

// The half marathon that kicks the plan off.
workouts.push({
  date: '2026-11-14',
  kind: 'half',
  miles: 13.1,
  title: 'Half marathon',
  detail: 'Controlled effort · 8:45–9:00/mi start · HR cap 175 · target 1:50–1:55',
  phase: 'reset',
  weekIndex: 0,
})

export const WORKOUTS: Workout[] = workouts

export const WORKOUT_BY_DATE = new Map(WORKOUTS.map((w) => [w.date, w]))

export const PHASE_BY_ID = new Map(PHASES.map((p) => [p.id, p]))

export type Month = { key: string; label: string }

export const MONTHS: Month[] = []

{
  let cursor = new Date(Date.UTC(2026, 10, 1))
  const end = new Date(Date.UTC(2027, 8, 1))
  while (cursor.getTime() <= end.getTime()) {
    MONTHS.push({
      key: `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`,
      label: cursor.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    })
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1))
  }
}

const trainingWeeks = WEEKS.filter((w) => !w.race)

export const PLAN_STATS = {
  weeks: WEEKS.length,
  peakMiles: Math.max(...trainingWeeks.map((w) => w.total)),
  totalMiles: Math.round(trainingWeeks.reduce((sum, w) => sum + w.total, 0)),
  peakWeek: trainingWeeks.find((w) => w.total === Math.max(...trainingWeeks.map((x) => x.total))),
}
