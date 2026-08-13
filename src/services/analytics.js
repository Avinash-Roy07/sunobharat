function getDevice() {
  const ua = navigator.userAgent
  if (/Mobi|Android/i.test(ua)) return 'Mobile'
  if (/iPad|Tablet/i.test(ua)) return 'Tablet'
  if (/Macintosh|MacIntel/i.test(ua)) return 'Mac'
  if (/Windows NT/i.test(ua)) return 'Windows'
  return 'Desktop'
}

function getBrowser() {
  const ua = navigator.userAgent
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  return 'Other'
}

async function post(data) {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch {}
}

export async function trackVisit(world) {
  try {
    const log = JSON.parse(localStorage.getItem('sb_visit_log') || '[]')
    log.push({ world, device: getDevice(), browser: getBrowser(), time: Date.now() })
    if (log.length > 1000) log.splice(0, log.length - 1000)
    localStorage.setItem('sb_visit_log', JSON.stringify(log))
    const wv = JSON.parse(localStorage.getItem('sb_world_visits') || '{}')
    wv[world] = (wv[world] || 0) + 1
    localStorage.setItem('sb_world_visits', JSON.stringify(wv))
  } catch {}
  post({ type: 'visit', world, device: getDevice(), browser: getBrowser() })
}

export async function trackTimeSpent(seconds) {
  try {
    const t = JSON.parse(localStorage.getItem('sb_time_spent') || '{}')
    const today = new Date().toDateString()
    t.total = (t.total || 0) + seconds
    t.today = t.lastDate === today ? (t.today || 0) + seconds : seconds
    t.lastDate = today
    localStorage.setItem('sb_time_spent', JSON.stringify(t))
  } catch {}
  post({ type: 'time_spent', seconds })
}

export async function trackSongPlay(world, title, videoId) {
  try {
    const today = new Date().toDateString()
    const sv = JSON.parse(localStorage.getItem('sb_song_visits') || '{}')
    const key = world + '||' + title
    if (!sv[key]) sv[key] = { world, title, videoId: videoId || '', total: 0, todayDate: '', today: 0 }
    if (videoId) sv[key].videoId = videoId
    sv[key].total = (sv[key].total || 0) + 1
    if (sv[key].todayDate !== today) { sv[key].todayDate = today; sv[key].today = 0 }
    sv[key].today = (sv[key].today || 0) + 1
    localStorage.setItem('sb_song_visits', JSON.stringify(sv))
  } catch {}
  post({ type: 'song_play', world, title, video_id: videoId || '' })
}

const TAB_KEY = 'sb_tab_' + Math.random().toString(36).slice(2)

export async function pingLiveViewer(world, song, videoId) {
  try {
    const viewers = JSON.parse(localStorage.getItem('sb_live_viewers') || '{}')
    const now = Date.now()
    Object.keys(viewers).forEach(k => { if (now - viewers[k].ts > 12000) delete viewers[k] })
    viewers[TAB_KEY] = { ts: now, world, device: getDevice(), song: song || '', videoId: videoId || '' }
    localStorage.setItem('sb_live_viewers', JSON.stringify(viewers))
  } catch {}
  post({ type: 'ping_live', tab_key: TAB_KEY, world, device: getDevice(), song: song || '', video_id: videoId || '' })
}

export async function removeLiveViewer() {
  try {
    const viewers = JSON.parse(localStorage.getItem('sb_live_viewers') || '{}')
    delete viewers[TAB_KEY]
    localStorage.setItem('sb_live_viewers', JSON.stringify(viewers))
  } catch {}
  post({ type: 'remove_live', tab_key: TAB_KEY })
}
