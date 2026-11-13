export type PhaseId =
  | 'reset'
  | 'base'
  | 'marathon'
  | 'marathonTaper'
  | 'recovery'
  | 'trail'
  | 'fiftyBuild'
  | 'fiftyRecovery'
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

export type Quality = 'easy' | 'mp' | 'tempo' | 'hills' | 'strides' | 'sharp'
export type LongType = 'trail' | 'easy' | 'mp' | 'hills' | 'recovery' | 'fifty'

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
  raceType?: 'grindstone' | 'marathon'
  tueType: Quality
  longType: LongType
  longTitle?: string
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
  detail:
    '6:00 AM start · 62.1 mi · 11,000 ft · 18 h cutoff · finish by midnight',
}

export const MARATHON = {
  name: 'Charlottesville Marathon',
  date: '2027-04-03',
  start: '07:00',
  distanceMi: 26.2,
  vertFt: 2300,
  cutoffHours: 6,
  location: 'Market Street Park, Charlottesville, VA',
  goal: 'Sub-3:45',
  detail:
    'Sub-3:45 · 8:35/mi avg · 8:40–8:45 first 5 mi · 8:30–8:35 to mile 20 · 8:25–8:35 last 10K · even effort on hills · fuel 60–90 g/h',
}

export const PLAN_START = '2026-11-16'

export const FIFTY_LONG = {
  name: 'Self-supported 50',
  date: '2027-06-05',
  distanceMi: 50,
  detail:
    'Self-supported · 5 × 10 mi loops · HR 135–160 · run/walk · fuel 60–90 g/h',
}

export const PHASES: Phase[] = [
  {
    id: 'reset',
    name: 'Reset',
    color: '#7d8ea3',
    start: '2026-11-16',
    end: '2026-12-13',
    weeks: 4,
    weeklyMiles: '15–30 mi',
    longRun: '4–16 mi',
    vert: '500–2,000 ft',
    focus: 'Recover, fix the intensity, rebuild consistency.',
    bullets: [
      'No long run for 10 days after the half marathon.',
      'First long run back: 14 mi on Nov 28 — easy, HR 135–155.',
      'Everything at 135–155 bpm. No hard efforts.',
      'Strength 2×/week: calves, hips, core.',
      'Build from 15 to 30 mi/week.',
    ],
  },
  {
    id: 'base',
    name: 'Base',
    color: '#22d3ee',
    start: '2026-12-14',
    end: '2027-01-10',
    weeks: 4,
    weeklyMiles: '28–36 mi',
    longRun: '16–20 mi',
    vert: '1,000–2,500 ft',
    focus: 'Aerobic base and hills before the marathon block.',
    bullets: [
      'Strides 2×/week; hill repeats every other week.',
      'Long runs 18 → 20 mi, all at HR 135–155.',
      'Keep easy days genuinely easy — this is where the base is built.',
      'Cutback every 4th week.',
      'Arrive at the marathon block healthy, not fit.',
    ],
  },
  {
    id: 'marathon',
    name: 'Marathon build',
    color: '#f472b6',
    start: '2027-01-11',
    end: '2027-03-21',
    weeks: 10,
    weeklyMiles: '28–44 mi',
    longRun: '14–22 mi',
    vert: '1,500–3,000 ft',
    focus: 'Sub-3:45 marathon — threshold volume, marathon pace, even effort.',
    bullets: [
      'Tuesday is the quality day: marathon pace, tempo, or hills.',
      'Long runs build 18 → 22 mi; the last 4–8 mi at 8:35–8:45 on key weeks.',
      'Fuel 60–90 g/h on every long run. Practice the race breakfast.',
      'Sub-3:45 = 8:35/mi. Even effort, not even pace — Charlottesville is hilly.',
      'No trail-specific work yet; the 100K block starts after April 3.',
    ],
  },
  {
    id: 'marathonTaper',
    name: 'Marathon taper',
    color: '#f97316',
    start: '2027-03-22',
    end: '2027-04-04',
    weeks: 2,
    weeklyMiles: '26 → 32 mi (race week)',
    longRun: '12 → race',
    vert: '1,000 → 500 ft',
    focus: 'Sharpen and freshen for Charlottesville.',
    bullets: [
      'Cut volume 30–40% while keeping a little race-pace work.',
      'Two 1-mile sharpeners at 8:30–8:40 midweek.',
      'Sleep 8 h; check the course profile and aid stations.',
      'Nothing new on race day.',
    ],
  },
  {
    id: 'recovery',
    name: 'Recovery',
    color: '#94a3b8',
    start: '2027-04-05',
    end: '2027-04-18',
    weeks: 2,
    weeklyMiles: '9–20 mi',
    longRun: '0–8 mi',
    vert: '0–500 ft',
    focus: 'Absorb the marathon, then resume.',
    bullets: [
      'No long run for 10 days after the marathon.',
      'Easy 135–150 bpm; walk 10 minutes daily.',
      'Eat and sleep aggressively for two weeks.',
      'Reassess before the trail block; do not rush the return.',
    ],
  },
  {
    id: 'trail',
    name: 'Trail build',
    color: '#34d399',
    start: '2027-04-19',
    end: '2027-05-23',
    weeks: 5,
    weeklyMiles: '29–49 mi',
    longRun: '14–30 mi',
    vert: '2,000–4,500 ft',
    focus: 'Time on trail, technical descents, and building toward the 50.',
    bullets: [
      'Weekly back-to-backs: Sat long, Sun ~60%.',
      'Power-hike grades above 15%.',
      'Long runs build 14 → 30 mi, all at HR 135–155.',
      'Big 30 + 18 mi weekend before the 50M build.',
      'First course-recon weekend on Narrow Back / Wolf Ridge.',
    ],
  },
  {
    id: 'fiftyBuild',
    name: '50M build & 50',
    color: '#eab308',
    start: '2027-05-24',
    end: '2027-06-06',
    weeks: 2,
    weeklyMiles: '34 → 56 mi (50M week)',
    longRun: '20 → 50 mi',
    vert: '1,500 → 3,000 ft',
    focus: 'Taper, then run a self-supported 50-miler at low HR.',
    bullets: [
      'Self-supported 50 mi — Sat Jun 5, 2027. No race, no crew.',
      'Use 5 × 10-mile loops with aid; start at 13:00–14:00/mi.',
      'HR 135–160, run/walk from mile 1; fuel 60–90 g/h.',
      'Time-on-feet rehearsal for Grindstone, not a race effort.',
      'If you feel good at 40, hold back and finish with something left.',
    ],
  },
  {
    id: 'fiftyRecovery',
    name: '50M recovery',
    color: '#94a3b8',
    start: '2027-06-07',
    end: '2027-06-20',
    weeks: 2,
    weeklyMiles: '9–22 mi',
    longRun: '0–10 mi',
    vert: '0–1,000 ft',
    focus: 'Absorb the 50, then resume.',
    bullets: [
      'No long run for 10 days after the 50.',
      'Easy 135–150 bpm; walk 10 minutes daily.',
      'Eat and sleep aggressively; reassess before the specific block.',
      'Do not rush the return — Grindstone is still 15 weeks out.',
    ],
  },
  {
    id: 'specific',
    name: 'Specific',
    color: '#fbbf24',
    start: '2027-06-21',
    end: '2027-07-04',
    weeks: 2,
    weeklyMiles: '44–49 mi',
    longRun: '22–24 mi',
    vert: '4,000–6,000 ft',
    focus: 'Night running, heat, poles, and final course recon.',
    bullets: [
      'One night run; one 4–6 h night run.',
      'Afternoon heat runs in late June and July.',
      'Poles on all long runs.',
      'The self-supported 50 was the tune-up; now sharpen for the peak block.',
    ],
  },
  {
    id: 'peak',
    name: 'Peak',
    color: '#fb7185',
    start: '2027-07-05',
    end: '2027-08-22',
    weeks: 7,
    weeklyMiles: '49–70 mi',
    longRun: '24–34 mi',
    vert: '6,000–9,000 ft',
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
  raceType?: 'grindstone' | 'marathon'
  note?: string
  tueType?: Quality
  longType?: LongType
  longTitle?: string
}

const SPECS: WeekSpec[] = [
  // Reset — recover from the half, then rebuild long-run volume at low HR
  { phase: 'reset', long: 4, sun: 4, tue: 4, thu: 3, note: 'Recovery week. No long run for 10 days after the half.', tueType: 'easy', longType: 'recovery' },
  { phase: 'reset', long: 14, sun: 5, tue: 4, thu: 3, note: 'First long run back: 14 mi, all easy.', tueType: 'easy', longType: 'easy' },
  { phase: 'reset', long: 16, sun: 6, tue: 5, thu: 3, tueType: 'strides', longType: 'easy' },
  { phase: 'reset', long: 14, sun: 5, tue: 4, thu: 3, cutback: true, tueType: 'easy', longType: 'easy' },

  // Base — short aerobic block before marathon training
  { phase: 'base', long: 18, sun: 6, tue: 5, thu: 3, tueType: 'strides', longType: 'easy' },
  { phase: 'base', long: 20, sun: 7, tue: 6, thu: 3, tueType: 'hills', longType: 'hills' },
  { phase: 'base', long: 16, sun: 5, tue: 4, thu: 3, cutback: true, tueType: 'easy', longType: 'easy' },
  { phase: 'base', long: 20, sun: 7, tue: 6, thu: 3, tueType: 'hills', longType: 'hills' },

  // Marathon build — 10 weeks to Charlottesville, sub-3:45
  { phase: 'marathon', long: 18, sun: 6, tue: 5, thu: 3, note: 'Marathon block starts. Tuesday quality begins.', tueType: 'mp', longType: 'easy' },
  { phase: 'marathon', long: 16, sun: 6, tue: 6, thu: 3, tueType: 'hills', longType: 'hills' },
  { phase: 'marathon', long: 18, sun: 7, tue: 8, thu: 4, note: 'Last 4 mi at marathon pace.', tueType: 'mp', longType: 'mp' },
  { phase: 'marathon', long: 14, sun: 5, tue: 6, thu: 3, cutback: true, tueType: 'tempo', longType: 'easy' },
  { phase: 'marathon', long: 20, sun: 7, tue: 8, thu: 4, tueType: 'hills', longType: 'hills' },
  { phase: 'marathon', long: 22, sun: 8, tue: 9, thu: 4, note: 'Last 6 mi at marathon pace.', tueType: 'mp', longType: 'mp' },
  { phase: 'marathon', long: 16, sun: 6, tue: 7, thu: 3, cutback: true, tueType: 'tempo', longType: 'easy' },
  { phase: 'marathon', long: 22, sun: 8, tue: 10, thu: 4, note: 'Peak long run. Last 8 mi at marathon pace.', tueType: 'hills', longType: 'mp' },
  { phase: 'marathon', long: 18, sun: 6, tue: 8, thu: 4, note: '6 mi at marathon pace, then shut it down.', tueType: 'sharp', longType: 'mp' },
  { phase: 'marathon', long: 16, sun: 6, tue: 7, thu: 3, note: 'Last long run — 16 mi easy. Cutback before the taper.', tueType: 'sharp', longType: 'easy' },

  // Marathon taper — two weeks
  { phase: 'marathonTaper', long: 12, sun: 5, tue: 6, thu: 3, note: 'Taper. Keep the legs sharp, not tired.', tueType: 'sharp', longType: 'easy' },
  { phase: 'marathonTaper', long: MARATHON.distanceMi, sun: 0, tue: 4, thu: 2, race: true, raceType: 'marathon', note: 'Charlottesville Marathon — 7:00 AM Saturday.', tueType: 'strides', longType: 'easy' },

  // Recovery — two weeks, no long run for 10 days
  { phase: 'recovery', long: 0, sun: 4, tue: 3, thu: 2, note: 'No long run. Easy walks + short jogs.', tueType: 'easy', longType: 'recovery' },
  { phase: 'recovery', long: 8, sun: 5, tue: 4, thu: 3, note: 'First long-ish run, all easy.', tueType: 'easy', longType: 'recovery' },

  // Trail build — 5 weeks, build to a 48-mile weekend
  { phase: 'trail', long: 14, sun: 6, tue: 5, thu: 4, cutback: true, note: 'Back on trail. Rebuild volume.', tueType: 'hills', longType: 'trail' },
  { phase: 'trail', long: 18, sun: 8, tue: 6, thu: 4, tueType: 'hills', longType: 'trail' },
  { phase: 'trail', long: 22, sun: 10, tue: 7, thu: 5, tueType: 'strides', longType: 'trail' },
  { phase: 'trail', long: 26, sun: 12, tue: 7, thu: 5, note: 'Course recon weekend.', tueType: 'hills', longType: 'trail' },
  { phase: 'trail', long: 30, sun: 18, tue: 7, thu: 5, note: '48-mile weekend: 30 Sat + 18 Sun. The 50-mile rehearsal.', tueType: 'hills', longType: 'trail' },

  // 50M build — taper, then the self-supported 50
  { phase: 'fiftyBuild', long: 20, sun: 6, tue: 5, thu: 3, note: 'Taper into the 50. Keep the legs fresh.', tueType: 'hills', longType: 'trail' },
  { phase: 'fiftyBuild', long: FIFTY_LONG.distanceMi, sun: 0, tue: 4, thu: 2, note: 'Self-supported 50 — 5 × 10 mi loops. Low HR, run/walk, practice race fuel.', tueType: 'strides', longType: 'fifty', longTitle: 'Self-supported 50' },

  // 50M recovery — 2 weeks, no long run for 10 days
  { phase: 'fiftyRecovery', long: 0, sun: 4, tue: 3, thu: 2, note: 'No long run. Easy walks + short jogs.', tueType: 'easy', longType: 'recovery' },
  { phase: 'fiftyRecovery', long: 10, sun: 5, tue: 4, thu: 3, note: 'First long-ish run, all easy.', tueType: 'easy', longType: 'recovery' },

  // Specific — 2 weeks
  { phase: 'specific', long: 22, sun: 11, tue: 7, thu: 4, note: 'Night run #1.', tueType: 'hills', longType: 'trail' },
  { phase: 'specific', long: 24, sun: 12, tue: 8, thu: 5, note: 'Heat training begins. Final specific block before the peak.', tueType: 'hills', longType: 'trail' },

  // Peak — 7 weeks
  { phase: 'peak', long: 26, sun: 14, tue: 9, thu: 5, tueType: 'hills', longType: 'trail' },
  { phase: 'peak', long: 28, sun: 15, tue: 9, thu: 6, tueType: 'hills', longType: 'trail' },
  { phase: 'peak', long: 30, sun: 16, tue: 9, thu: 6, tueType: 'hills', longType: 'trail' },
  { phase: 'peak', long: 32, sun: 18, tue: 10, thu: 6, note: 'Big back-to-back weekend.', tueType: 'hills', longType: 'trail' },
  { phase: 'peak', long: 24, sun: 12, tue: 8, thu: 5, cutback: true, tueType: 'easy', longType: 'trail' },
  { phase: 'peak', long: 32, sun: 18, tue: 10, thu: 6, note: 'Full race simulation.', tueType: 'hills', longType: 'trail' },
  { phase: 'peak', long: 34, sun: 20, tue: 10, thu: 6, note: 'Peak week — 54-mile weekend.', tueType: 'hills', longType: 'trail' },

  // Taper — 4 weeks
  { phase: 'taper', long: 26, sun: 14, tue: 8, thu: 5, tueType: 'strides', longType: 'trail' },
  { phase: 'taper', long: 20, sun: 10, tue: 7, thu: 4, tueType: 'strides', longType: 'trail' },
  { phase: 'taper', long: 14, sun: 8, tue: 6, thu: 3, tueType: 'strides', longType: 'trail' },
  { phase: 'taper', long: 8, sun: 4, tue: 4, thu: 2, tueType: 'strides', longType: 'trail' },

  // Race week
  { phase: 'race', long: RACE.distanceMi, sun: 0, tue: 5, thu: 3, race: true, raceType: 'grindstone', note: 'Grindstone 100K — 6:00 AM Saturday.', tueType: 'easy', longType: 'trail' },
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
    end: spec.phase === 'race' ? RACE.date : addDays(start, 6),
    phase: spec.phase,
    long: spec.long,
    sun: spec.sun,
    tue: spec.tue,
    thu: spec.thu,
    total: Math.round((spec.long + spec.sun + spec.tue + spec.thu) * 10) / 10,
    cutback: Boolean(spec.cutback),
    race: Boolean(spec.race),
    raceType: spec.raceType,
    tueType: spec.tueType ?? 'easy',
    longType: spec.longType ?? 'trail',
    longTitle: spec.longTitle,
    note: spec.note,
  }
})

const QUALITY_DETAIL: Record<Quality, { title: string; detail: string }> = {
  easy: { title: 'Easy run', detail: 'Easy Z2 · HR 135–155 · conversational' },
  mp: { title: 'Marathon pace', detail: '' },
  tempo: { title: 'Tempo', detail: '' },
  hills: {
    title: 'Hill repeats',
    detail: '1–2 mi easy + 8–10 × 60–90 sec uphill hard, jog down + 1 mi easy',
  },
  strides: {
    title: 'Easy + strides',
    detail: 'Easy + 6 × 20 sec strides at 7:30–8:00/mi, full recovery',
  },
  sharp: {
    title: 'Sharpeners',
    detail: '1–2 mi easy + 2 × 1 mi at 8:30–8:40 with 3 min jog + 1 mi easy',
  },
}

function qualityWorkout(type: Quality, miles: number): { title: string; detail: string } {
  const base = QUALITY_DETAIL[type]
  if (type === 'mp' || type === 'tempo') {
    const main = Math.max(2, Math.round(miles - 3))
    const pace = type === 'mp' ? '8:35–8:45' : '8:15–8:25'
    const hr = type === 'mp' ? '175–185' : '180–190'
    return {
      title: base.title,
      detail: `1–2 mi easy + ${main} mi at ${pace}/mi + 1 mi easy · HR ${hr}`,
    }
  }
  return base
}

const LONG_DETAIL: Record<LongType, string> = {
  trail: 'Trail · HR 140–160 · 9:1 run/walk · fuel 60–90 g/h',
  easy: 'HR 135–155 · no pace goal · walk breaks OK · fuel 60–90 g/h',
  mp: 'Easy first half at HR 135–155 · last 4–8 mi at 8:35–8:45/mi · fuel 60–90 g/h',
  hills: 'Rolling hills · effort-based · HR 140–160 · fuel 60–90 g/h',
  recovery: 'Easy 135–150 bpm · no pace goal · walk breaks OK',
  fifty: 'Self-supported 50 · 5 × 10 mi loops · HR 135–160 · run/walk · fuel 60–90 g/h',
}

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
    const race = week.raceType === 'marathon' ? MARATHON : RACE
    push(5, 'race', week.long, race.name, race.detail)
  } else if (week.long > 0) {
    const title =
      week.longTitle ??
      (week.longType === 'recovery' ? 'Recovery run' : 'Long run')
    push(5, 'long', week.long, title, LONG_DETAIL[week.longType])
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
    const quality = qualityWorkout(week.tueType, week.tue)
    push(1, 'easy', week.tue, quality.title, quality.detail)
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
  detail:
    'Sub-2:00 · 1–3 mi 9:15–9:20 (HR 180–188) · 4–7 mi 9:00–9:05 (188–194) · 8–10 mi 8:55–9:00 (192–196) · 11–13.1 mi 8:50–8:55 (195–200) · no 175 cap',
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
