const EVENTS_KEY = 'sb_visit_log'
const STATS_KEY = 'sb_stats'
const WORLD_VISITS_KEY = 'sb_world_visits'
const ONLINE_KEY = 'gym_online_tabs'
const TIME_KEY = 'sb_time_spent'
const SONG_VISITS_KEY = 'sb_song_visits'

export { EVENTS_KEY, STATS_KEY, WORLD_VISITS_KEY, ONLINE_KEY, TIME_KEY, SONG_VISITS_KEY }

export const supabase = { channel() { return { on() { return this }, subscribe() {}, track() {}, presenceState() { return {} } } }, removeChannel() {} }

export function trackVisit(world) {
  try {
    const today = new Date().toDateString()
    const s = JSON.parse(localStorage.getItem(STATS_KEY) || '{}')
    s.totalVisits = (s.totalVisits || 0) + 1
    s.todayVisits = s.lastDate === today ? (s.todayVisits || 0) + 1 : 1
    s.lastDate = today
    localStorage.setItem(STATS_KEY, JSON.stringify(s))

    const wv = JSON.parse(localStorage.getItem(WORLD_VISITS_KEY) || '{}')
    wv[world] = (wv[world] || 0) + 1
    localStorage.setItem(WORLD_VISITS_KEY, JSON.stringify(wv))

    const log = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]')
    log.push({
      world, song: null,
      time: Date.now(),
      device: (() => {
        const ua = navigator.userAgent
        if (/Mobi|Android/i.test(ua)) return 'Mobile'
        if (/iPad|Tablet/i.test(ua)) return 'Tablet'
        if (/Macintosh|MacIntel/i.test(ua)) return 'Mac'
        if (/Windows NT/i.test(ua)) return 'Windows'
        return 'Desktop'
      })(),
      browser: (() => {
        const ua = navigator.userAgent
        if (ua.includes('Edg')) return 'Edge'
        if (ua.includes('Chrome')) return 'Chrome'
        if (ua.includes('Firefox')) return 'Firefox'
        if (ua.includes('Safari')) return 'Safari'
        return 'Other'
      })(),
    })
    if (log.length > 1000) log.splice(0, log.length - 1000)
    localStorage.setItem(EVENTS_KEY, JSON.stringify(log))
  } catch {}
}

// Track time spent — called every 30s from App.jsx
export function trackTimeSpent(seconds) {
  try {
    const t = JSON.parse(localStorage.getItem(TIME_KEY) || '{}')
    const today = new Date().toDateString()
    t.total = (t.total || 0) + seconds
    t.today = t.lastDate === today ? (t.today || 0) + seconds : seconds
    t.lastDate = today
    localStorage.setItem(TIME_KEY, JSON.stringify(t))
  } catch {}
}

// Track song play — called from App.jsx when song changes
export function trackSongPlay(world, songTitle, videoId) {
  try {
    const today = new Date().toDateString()
    const sv = JSON.parse(localStorage.getItem(SONG_VISITS_KEY) || '{}')
    const key = world + '||' + songTitle
    if (!sv[key]) sv[key] = { world, title: songTitle, videoId: videoId || '', total: 0, todayDate: '', today: 0 }
    if (videoId) sv[key].videoId = videoId
    sv[key].total = (sv[key].total || 0) + 1
    if (sv[key].todayDate !== today) { sv[key].todayDate = today; sv[key].today = 0 }
    sv[key].today = (sv[key].today || 0) + 1
    localStorage.setItem(SONG_VISITS_KEY, JSON.stringify(sv))
  } catch {}
}
