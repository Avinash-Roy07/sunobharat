import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const PASSKEY = 'SunoBharat@2026#Admin'
const SESSION_KEY = 'sb_admin_auth'

const WORLD_ICONS = {
  truck: '🎵', salon: '🎵', chai: '🎵', nightdrive: '🎵',
  bhojpuri: '🎵', punjabi: '🎵', gym: '🎵'
}
const WORLD_NAMES = {
  truck: 'Truck Driver', salon: 'Salon', chai: 'Chai Adda',
  nightdrive: 'Night Drive', bhojpuri: 'Bhojpuri', punjabi: 'Punjabi', gym: 'Gym',
}
const WORLD_PLAYLISTS = {
  truck: 'PLK0SeYSdwssE', salon: 'PLNvMd2ifvgjo', chai: 'PLcvn0G-x_awU',
  nightdrive: 'PLV-fnvOKr6xE', bhojpuri: 'PLdWXnMeQmWHA', punjabi: 'PLXASzBhrVsnA', gym: 'PLM3AObkR-v04',
}

function fmtTime(seconds) {
  if (!seconds) return '0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function getOnlineCount() {
  try {
    const tabs = JSON.parse(localStorage.getItem('gym_online_tabs') || '{}')
    const now = Date.now()
    return Object.values(tabs).filter(t => now - t < 8000).length
  } catch { return 0 }
}

function buildData() {
  const all = (() => { try { return JSON.parse(localStorage.getItem('sb_visit_log') || '[]') } catch { return [] } })()
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayEvts = all.filter(e => new Date(e.time || 0) >= todayStart)

  // hourly — 24 points
  const hourlyMap = Array(24).fill(0)
  todayEvts.forEach(e => { hourlyMap[new Date(e.time || 0).getHours()]++ })

  // 7-day trend
  const trend = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    trend.push({
      label: i === 0 ? 'Today' : i === 1 ? 'Yest' : `${i}d`,
      value: all.filter(e => { const t = new Date(e.time || 0); return t >= d && t < next }).length
    })
  }

  // worlds
  const wv = (() => { try { return JSON.parse(localStorage.getItem('sb_world_visits') || '{}') } catch { return {} } })()
  const worldTotal = Object.values(wv).reduce((s, v) => s + v, 0) || 1
  // today per world
  const wvToday = {}
  todayEvts.forEach(e => { if (e.world) wvToday[e.world] = (wvToday[e.world] || 0) + 1 })

  // 7-day trend per world
  const worldTrend = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    const label = i === 0 ? 'Today' : i === 1 ? 'Yest' : `${i}d`
    all.filter(e => { const t = new Date(e.time || 0); return t >= d && t < next }).forEach(e => {
      if (!e.world) return
      if (!worldTrend[e.world]) worldTrend[e.world] = []
      const slot = worldTrend[e.world].find(s => s.label === label)
      if (slot) slot.value++
      else worldTrend[e.world].push({ label, value: 1 })
    })
  }
  // hourly per world (today only)
  const worldHourly = {}
  todayEvts.forEach(e => {
    if (!e.world) return
    if (!worldHourly[e.world]) worldHourly[e.world] = Array(24).fill(0)
    worldHourly[e.world][new Date(e.time || 0).getHours()]++
  })

  const ALL_WORLD_KEYS = ['truck','salon','chai','nightdrive','bhojpuri','punjabi','gym']
  const worlds = ALL_WORLD_KEYS
    .map(k => ({ key: k, name: WORLD_NAMES[k] || k, icon: WORLD_ICONS[k] || '🎵', value: wv[k] || 0, today: wvToday[k] || 0, pct: ((wv[k] || 0) / worldTotal) * 100 }))
    .sort((a, b) => b.value - a.value)

  // devices & browsers
  const devMap = {}; all.forEach(e => { devMap[e.device || 'Desktop'] = (devMap[e.device || 'Desktop'] || 0) + 1 })
  const devTotal = all.length || 1
  const devices = Object.entries(devMap).map(([n, v]) => ({ name: n, value: v, pct: (v / devTotal) * 100 })).sort((a, b) => b.value - a.value)

  const brMap = {}; all.forEach(e => { brMap[e.browser || 'Chrome'] = (brMap[e.browser || 'Chrome'] || 0) + 1 })
  const brTotal = all.length || 1
  const browsers = Object.entries(brMap).map(([n, v]) => ({ name: n, value: v, pct: (v / brTotal) * 100 })).sort((a, b) => b.value - a.value)

  // time spent
  const timeData = (() => { try { return JSON.parse(localStorage.getItem('sb_time_spent') || '{}') } catch { return {} } })()
  const today = new Date().toDateString()
  const timeToday = timeData.lastDate === today ? (timeData.today || 0) : 0
  const timeTotal = timeData.total || 0

  // avg session (total time / total visits)
  const avgSession = all.length > 0 ? Math.round(timeTotal / all.length) : 0

  // most played world
  const topWorld = worlds[0] || null

  // return visits (visits > 1 from same device+browser combo)
  const sessionMap = {}
  all.forEach(e => { const k = (e.device || '') + (e.browser || ''); sessionMap[k] = (sessionMap[k] || 0) + 1 })
  const returnVisitors = Object.values(sessionMap).filter(v => v > 1).length

  return {
    totalVisits: all.length,
    todayVisits: todayEvts.length,
    uniqueToday: new Set(todayEvts.map(e => (e.device || '') + (e.browser || ''))).size,
    timeToday, timeTotal, avgSession,
    topWorld, returnVisitors,
    hourly: hourlyMap.map((value, hour) => ({ hour, value })),
    trend, worlds, worldTrend, worldHourly, devices, browsers,
  }
}

function fmtNum(n) {
  if (n >= 10000) return Math.floor(n / 1000) + 'k'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

function LineChart({ data, color, height = 90, labels }) {
  const [tooltip, setTooltip] = useState(null)
  const vals = data.map(d => d.value)
  if (vals.length < 2) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'rgba(255,150,150,0.3)', fontSize: 11 }}>No data yet</span>
    </div>
  )
  const max = Math.max(...vals, 1)
  const W = 400, H = height, P = 4
  const pts = vals.map((v, i) => [
    P + (i / (vals.length - 1)) * (W - P * 2),
    H - P - (v / max) * (H - P * 2)
  ])
  const path = pts.map(([x, y], i) => {
    if (i === 0) return `M${x},${y}`
    const [px, py] = pts[i - 1]; const cx = (px + x) / 2
    return `C${cx},${py} ${cx},${y} ${x},${y}`
  }).join(' ')
  const fill = path + ` L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`
  const gid = 'g' + color.replace(/[^a-zA-Z0-9]/g, '')
  return (
    <div style={{ position: 'relative' }}>
      {tooltip !== null && (
        <div style={{
          position: 'absolute', top: -32, left: `${(pts[tooltip][0] / W) * 100}%`,
          transform: 'translateX(-50%)',
          background: 'rgba(20,4,4,0.95)', border: `1px solid ${color}55`,
          borderRadius: 7, padding: '4px 10px', fontSize: 11, color: '#fff',
          fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none',
        }}>
          {labels ? labels[tooltip] + ': ' : ''}{fmtNum(vals[tooltip])}
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, display: 'block', cursor: 'crosshair' }}
        preserveAspectRatio="none"
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * W
          let closest = 0, minDist = Infinity
          pts.forEach(([px], i) => { const d = Math.abs(px - x); if (d < minDist) { minDist = d; closest = i } })
          setTooltip(closest)
        }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fill} fill={`url(#${gid})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        {tooltip !== null && (
          <>
            <line x1={pts[tooltip][0]} y1={0} x2={pts[tooltip][0]} y2={H}
              stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
            <circle cx={pts[tooltip][0]} cy={pts[tooltip][1]} r="4"
              fill={color} stroke="#fff" strokeWidth="1.5" />
          </>
        )}
      </svg>
    </div>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(70,8,8,0.6) 0%, rgba(15,3,3,0.75) 100%)',
      border: `1px solid ${color}25`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 14, padding: '22px 20px',
      backdropFilter: 'blur(20px)',
      minHeight: 130,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div style={{ color: 'rgba(255,180,180,0.5)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color: '#fff', fontSize: 26, fontWeight: 800, lineHeight: 1, margin: '10px 0 6px' }}>{value}</div>
      <div style={{ color: 'rgba(255,150,150,0.4)', fontSize: 10 }}>{sub}</div>
    </div>
  )
}

function BarRow({ name, icon, value, pct, color }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ color: 'rgba(255,200,200,0.8)', fontSize: 12 }}>{icon && <span style={{ marginRight: 6 }}>{icon}</span>}{name}</span>
        <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{value} <span style={{ color: 'rgba(255,150,150,0.4)', fontWeight: 400, fontSize: 10 }}>({pct.toFixed(0)}%)</span></span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

const CARD_BOX = { background: 'rgba(55,6,6,0.55)', border: '1px solid rgba(200,50,50,0.18)', borderRadius: 14, padding: 20, backdropFilter: 'blur(20px)' }
const CARD_TITLE = { color: 'rgba(255,180,180,0.65)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }
const CARD_SUB = { color: 'rgba(255,150,150,0.35)', fontSize: 10, marginBottom: 14 }

function WorldsTable({ worlds, onOpen }) {
  return (
    <div style={{ background: 'rgba(55,6,6,0.55)', border: '1px solid rgba(200,50,50,0.18)', borderRadius: 14, overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid rgba(200,50,50,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ color: 'rgba(255,180,180,0.65)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>All Worlds</div>
          <div style={{ color: 'rgba(255,150,150,0.35)', fontSize: 10, marginTop: 2 }}>Click arrow to see songs inside</div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <span style={{ color: 'rgba(255,150,150,0.45)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Today</span>
          <span style={{ color: 'rgba(255,150,150,0.45)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 32 }}>All Time</span>
        </div>
      </div>
      {worlds.map((w, i) => {
        const allTotal = worlds.reduce((s, x) => s + x.value, 0) || 1
        const share = (w.value / allTotal) * 100
        return (
          <div key={w.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: '1px solid rgba(200,50,50,0.07)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(180,30,30,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ color: 'rgba(255,150,150,0.3)', fontSize: 11, width: 16, flexShrink: 0 }}>#{i + 1}</span>
            <div style={{ width: 34, height: 34, background: 'rgba(180,30,30,0.3)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{w.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{w.name}</div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginTop: 5, width: '60%' }}>
                <div style={{ width: `${Math.min(share, 100)}%`, height: '100%', background: 'rgba(255,107,107,0.7)', borderRadius: 99 }} />
              </div>
            </div>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, width: 36, textAlign: 'right' }}>{fmtNum(w.today)}</span>
            <span style={{ color: 'rgba(255,180,180,0.6)', fontSize: 13, fontWeight: 600, width: 48, textAlign: 'right' }}>{fmtNum(w.value)}</span>
            <button onClick={() => onOpen(w.key)} style={{ background: 'rgba(180,30,30,0.25)', border: '1px solid rgba(200,50,50,0.2)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: 'rgba(255,150,150,0.7)', fontSize: 14 }}>›</button>
          </div>
        )
      })}
    </div>
  )
}

function usePlaylistSongs(worldKey) {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const playlistId = WORLD_PLAYLISTS[worldKey] || ''

  useEffect(() => {
    if (!playlistId) return
    let cancelled = false
    setLoading(true)

    async function fetchFromInvidious() {
      const INSTANCES = [
        'https://inv.nadeko.net',
        'https://invidious.nerdvpn.de',
        'https://invidious.privacydev.net',
      ]
      for (const base of INSTANCES) {
        try {
          const res = await fetch(`${base}/api/v1/playlists/${playlistId}`, { signal: AbortSignal.timeout(8000) })
          if (!res.ok) continue
          const json = await res.json()
          const videos = json.videos || []
          if (videos.length === 0) continue

          const tc = JSON.parse(localStorage.getItem('sb_title_cache') || '{}')
          const pc = JSON.parse(localStorage.getItem('sb_playlist_cache') || '{}')
          const sv = JSON.parse(localStorage.getItem('sb_song_visits') || '{}')
          const today = new Date().toDateString()

          const result = videos.map(v => {
            const videoId = v.videoId || ''
            const title = v.title || ''
            const thumb = v.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
            if (videoId && title) tc[videoId] = title
            const key = worldKey + '||' + title
            const rec = sv[key]
            return {
              videoId, title,
              thumb: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
              today: rec?.todayDate === today ? (rec.today || 0) : 0,
              total: rec?.total || 0,
            }
          }).filter(s => s.videoId)

          pc[worldKey] = { ids: result.map(s => s.videoId), ts: Date.now() }
          localStorage.setItem('sb_playlist_cache', JSON.stringify(pc))
          localStorage.setItem('sb_title_cache', JSON.stringify(tc))

          if (!cancelled) { setSongs(result); setLoading(false) }
          return
        } catch {}
      }
      // all failed — use localStorage cache
      if (!cancelled) {
        const tc = JSON.parse(localStorage.getItem('sb_title_cache') || '{}')
        const pc = JSON.parse(localStorage.getItem('sb_playlist_cache') || '{}')
        const sv = JSON.parse(localStorage.getItem('sb_song_visits') || '{}')
        const ids = pc[worldKey]?.ids || []
        const today = new Date().toDateString()
        const result = ids.map(id => {
          const title = tc[id] || ''
          const key = worldKey + '||' + title
          const rec = sv[key]
          return { videoId: id, title, thumb: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`, today: rec?.todayDate === today ? (rec.today || 0) : 0, total: rec?.total || 0 }
        })
        setSongs(result)
        setLoading(false)
      }
    }

    fetchFromInvidious()
    const iv = setInterval(fetchFromInvidious, 30000)
    return () => { cancelled = true; clearInterval(iv) }
  }, [playlistId, worldKey])

  return { songs, loading }
}

function WorldDetail({ worldKey, worldTrend, worldHourly, onBack }) {
  const name = WORLD_NAMES[worldKey] || worldKey
  const { songs: playlistSongs, loading } = usePlaylistSongs(worldKey)

  // 7-day trend
  const LABELS7 = ['6d','5d','4d','3d','2d','Yest','Today']
  const rawTrend = worldTrend[worldKey] || []
  const trendData = LABELS7.map(label => ({ label, value: rawTrend.find(s => s.label === label)?.value || 0 }))

  // 24h hourly
  const HOUR_LABELS = ['12A','1A','2A','3A','4A','5A','6A','7A','8A','9A','10A','11A','12P','1P','2P','3P','4P','5P','6P','7P','8P','9P','10P','11P']
  const rawHourly = worldHourly[worldKey] || Array(24).fill(0)
  const hourlyData = rawHourly.map((value, i) => ({ label: HOUR_LABELS[i], value }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'rgba(180,30,30,0.25)', border: '1px solid rgba(200,50,50,0.2)', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,150,150,0.8)', fontSize: 18 }}>‹</button>
        <div>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>🎵 {name}</div>
          <div style={{ color: 'rgba(255,150,150,0.4)', fontSize: 10 }}>Live • refreshes every 3s</div>
        </div>
      </div>

      {/* both graphs side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={CARD_BOX}>
          <div style={CARD_TITLE}>Hourly Activity</div>
          <div style={CARD_SUB}>Today’s visits by hour</div>
          <LineChart data={hourlyData} color="#ff6b6b" height={80} labels={HOUR_LABELS} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['12A','3A','6A','9A','12P','3P','6P','9P'].map(t => <span key={t} style={{ color: 'rgba(255,150,150,0.3)', fontSize: 9 }}>{t}</span>)}
          </div>
        </div>
        <div style={CARD_BOX}>
          <div style={CARD_TITLE}>7-Day Trend</div>
          <div style={CARD_SUB}>Daily visits this week</div>
          <LineChart data={trendData} color="#ff9f43" height={80} labels={LABELS7} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {LABELS7.map(l => <span key={l} style={{ color: 'rgba(255,150,150,0.3)', fontSize: 9, flex: 1, textAlign: 'center' }}>{l}</span>)}
          </div>
        </div>
      </div>

      {/* songs list */}
      <div style={{ background: 'rgba(55,6,6,0.55)', border: '1px solid rgba(200,50,50,0.18)', borderRadius: 14, overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '13px 20px', borderBottom: '1px solid rgba(200,50,50,0.12)', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,180,180,0.65)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Playlist Songs
            {playlistSongs.length > 0 && <span style={{ color: 'rgba(255,150,150,0.4)', fontWeight: 400, marginLeft: 8 }}>({playlistSongs.length})</span>}
          </span>
          <div style={{ display: 'flex', gap: 28 }}>
            <span style={{ color: 'rgba(255,150,150,0.45)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Today</span>
            <span style={{ color: 'rgba(255,150,150,0.45)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>All Time</span>
          </div>
        </div>
        {loading && playlistSongs.length === 0 && (
          <div style={{ padding: '24px 20px', color: 'rgba(255,150,150,0.3)', fontSize: 12 }}>Fetching playlist…</div>
        )}
        {!loading && playlistSongs.length === 0 && (
          <div style={{ padding: '24px 20px', color: 'rgba(255,150,150,0.3)', fontSize: 12 }}>No songs found in this playlist.</div>
        )}
        {playlistSongs.map((s, i) => (
          <div key={s.videoId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid rgba(200,50,50,0.07)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(180,30,30,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ color: 'rgba(255,150,150,0.3)', fontSize: 11, width: 18, flexShrink: 0 }}>#{i + 1}</span>
            <div style={{ width: 48, height: 34, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'rgba(180,30,30,0.3)' }}>
              <img src={s.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.style.display = 'none' }} />
            </div>
            <span style={{ color: s.title ? '#fff' : 'rgba(255,150,150,0.25)', fontSize: 13, fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.title || 'Fetching title…'}
            </span>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, width: 40, textAlign: 'right' }}>{s.today}</span>
            <span style={{ color: 'rgba(255,180,180,0.6)', fontSize: 13, fontWeight: 600, width: 56, textAlign: 'right' }}>{fmtNum(s.total)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const WORLD_NAMES_MAP = WORLD_NAMES

function DeviceIcon({ device }) {
  if (device === 'Mobile') return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>
  if (device === 'Tablet') return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H3V6h18v12z"/></svg>
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>
}

function LiveViewers() {
  const [viewers, setViewers] = useState([])
  useEffect(() => {
    function load() {
      try {
        const raw = JSON.parse(localStorage.getItem('sb_live_viewers') || '{}')
        const now = Date.now()
        const active = Object.values(raw).filter(v => now - v.ts < 10000)
        setViewers(active)
      } catch { setViewers([]) }
    }
    load()
    const iv = setInterval(load, 2000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1dd1a1', boxShadow: '0 0 8px #1dd1a1', display: 'inline-block' }} />
        <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{viewers.length} Live {viewers.length === 1 ? 'Viewer' : 'Viewers'}</span>
        <span style={{ color: 'rgba(255,150,150,0.4)', fontSize: 10 }}>updates every 2s</span>
      </div>

      {viewers.length === 0 && (
        <div style={{ ...CARD_BOX, color: 'rgba(255,150,150,0.3)', fontSize: 13 }}>No one is on the site right now.</div>
      )}

      {viewers.map((v, i) => (
        <div key={i} style={{ background: 'rgba(55,6,6,0.55)', border: '1px solid rgba(200,50,50,0.18)', borderRadius: 14, padding: '16px 20px', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* thumbnail */}
          <div style={{ width: 64, height: 46, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'rgba(180,30,30,0.3)' }}>
            {v.videoId
              ? <img src={`https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎵</div>
            }
          </div>
          {/* info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {v.song || 'Loading...'}
            </div>
            <div style={{ color: 'rgba(255,150,150,0.5)', fontSize: 11, marginTop: 3 }}>
              {WORLD_NAMES_MAP[v.world] || v.world}
            </div>
          </div>
          {/* device badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(180,30,30,0.25)', border: '1px solid rgba(200,50,50,0.2)', borderRadius: 8, padding: '5px 10px', flexShrink: 0, color: 'rgba(255,180,180,0.8)', fontSize: 11, fontWeight: 600 }}>
            <DeviceIcon device={v.device} />
            {v.device || 'Desktop'}
          </div>
          {/* live dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1dd1a1', boxShadow: '0 0 6px #1dd1a1', display: 'inline-block' }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>live</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function Overview({ data, online, onOpenWorld }) {
  const topWorldName = data.topWorld ? `♪ ${data.topWorld.name}` : '—'
  const topWorldSub = data.topWorld ? `${data.topWorld.value} visits (${data.topWorld.pct.toFixed(0)}%)` : 'No visits yet'

  const cards = [
    { label: 'Total Visits',     value: data.totalVisits,          sub: 'All time visits',          color: '#ff6b6b' },
    { label: "Today's Visits",   value: data.todayVisits,          sub: 'Since midnight',           color: '#ff9f43' },
    { label: 'Unique Today',     value: data.uniqueToday,          sub: 'Unique devices today',     color: '#48dbfb' },
    { label: 'Live on Site',     value: online,                    sub: 'Active right now 🟢',      color: '#1dd1a1' },
    { label: 'Time Spent Today', value: fmtTime(data.timeToday),   sub: 'Total listening today',    color: '#a29bfe' },
    { label: 'Total Time Ever',  value: fmtTime(data.timeTotal),   sub: 'All time listening',       color: '#fd79a8' },
    { label: 'Most Played',      value: topWorldName,              sub: topWorldSub,                color: '#fdcb6e' },
    { label: 'Return Visitors',  value: data.returnVisitors,       sub: 'Came back more than once', color: '#e17055' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* 8 stat cards — 4 per row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={CARD_BOX}>
          <div style={CARD_TITLE}>Hourly Activity</div>
          <div style={CARD_SUB}>Today's visits by hour</div>
          <LineChart data={data.hourly} color="#ff6b6b" height={90}
            labels={['12A','1A','2A','3A','4A','5A','6A','7A','8A','9A','10A','11A','12P','1P','2P','3P','4P','5P','6P','7P','8P','9P','10P','11P']}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['12A','3A','6A','9A','12P','3P','6P','9P'].map(t => (
              <span key={t} style={{ color: 'rgba(255,150,150,0.3)', fontSize: 9 }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={CARD_BOX}>
          <div style={CARD_TITLE}>7-Day Trend</div>
          <div style={CARD_SUB}>Daily visits this week</div>
          <LineChart data={data.trend} color="#ff9f43" height={90}
            labels={data.trend.map(d => d.label)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {data.trend.map((d, i) => (
              <span key={i} style={{ color: 'rgba(255,150,150,0.3)', fontSize: 9, flex: 1, textAlign: 'center' }}>{d.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Devices + Browsers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={CARD_BOX}>
          <div style={CARD_TITLE}>Devices</div>
          <div style={CARD_SUB}>Mobile vs Desktop</div>
          {data.devices.length === 0 && <p style={{ color: 'rgba(255,150,150,0.3)', fontSize: 12 }}>No data yet</p>}
          {data.devices.map(d => (
            <BarRow key={d.name} name={d.name} value={d.value} pct={d.pct} color="rgba(72,219,251,0.75)" />
          ))}
        </div>
        <div style={CARD_BOX}>
          <div style={CARD_TITLE}>Browsers</div>
          <div style={CARD_SUB}>Browser breakdown</div>
          {data.browsers.length === 0 && <p style={{ color: 'rgba(255,150,150,0.3)', fontSize: 12 }}>No data yet</p>}
          {data.browsers.map(b => (
            <BarRow key={b.name} name={b.name} value={b.value} pct={b.pct} color="rgba(255,159,67,0.75)" />
          ))}
        </div>
      </div>

      {/* Worlds table */}
      <WorldsTable worlds={data.worlds} onOpen={onOpenWorld} />

    </div>
  )
}

const NAV = ['Overview', 'Live', 'Worlds', 'Devices', 'Settings']

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const emptyData = {
    totalVisits: 0, todayVisits: 0, uniqueToday: 0,
    timeToday: 0, timeTotal: 0, avgSession: 0,
    topWorld: null, returnVisitors: 0,
    hourly: Array(24).fill(0).map((_, i) => ({ hour: i, value: 0 })),
    trend: Array(7).fill(0).map((_, i) => ({ label: `${6 - i}d`, value: 0 })),
    worlds: [], worldTrend: {}, worldHourly: {}, devices: [], browsers: [],
  }
  const [data, setData] = useState(emptyData)
  const [online, setOnline] = useState(0)
  const [tick, setTick] = useState(new Date())
  const navigate = useNavigate()
  const params = useParams()
  const section = params['*'] || params.section || ''
  const worldKey = section?.startsWith('world/') ? section.replace('world/', '') : null
  const active = worldKey ? 'WorldDetail' : (section ? section.charAt(0).toUpperCase() + section.slice(1) : 'Overview')
  const goTo = (name) => navigate(name === 'Overview' ? '/xb7k2-control-9f3m' : '/xb7k2-control-9f3m/' + name.toLowerCase())

  const refresh = useCallback(() => {
    setData(buildData())
    setOnline(getOnlineCount())
    setTick(new Date())
  }, [])

  useEffect(() => {
    if (!authed) return
    refresh()
    const iv = setInterval(refresh, 3000)
    return () => clearInterval(iv)
  }, [authed, refresh])

  const login = (e) => {
    e.preventDefault()
    if (pass === PASSKEY) { sessionStorage.setItem(SESSION_KEY, '1'); setAuthed(true) }
    else setErr('Wrong passkey.')
  }

  if (!authed) return (
    <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg,#0a0202,#1a0505)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 340, padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 50, height: 50, background: 'linear-gradient(135deg,#b91c1c,#ea580c)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 22 }}>🎵</div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0 }}>Suno Bharat</h1>
          <p style={{ color: 'rgba(255,150,150,0.45)', fontSize: 12, marginTop: 4 }}>Admin Access</p>
        </div>
        <form onSubmit={login} style={{ background: 'rgba(80,10,10,0.5)', border: '1px solid rgba(200,50,50,0.2)', borderRadius: 14, padding: 22, backdropFilter: 'blur(20px)' }}>
          <input type="password" autoFocus value={pass}
            onChange={e => { setPass(e.target.value); setErr('') }}
            placeholder="Enter passkey"
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,50,50,0.25)', borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14, outline: 'none', marginBottom: 10 }}
          />
          {err && <p style={{ color: '#ff6b6b', fontSize: 12, marginBottom: 8 }}>{err}</p>}
          <button type="submit" style={{ width: '100%', padding: '11px', background: 'linear-gradient(90deg,#b91c1c,#ea580c)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', fontFamily: 'Inter,sans-serif', background: 'linear-gradient(135deg,#0a0202,#150404)' }}>

      {/* SIDEBAR */}
      <aside style={{ width: 190, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'linear-gradient(175deg,rgba(90,10,10,0.65),rgba(6,1,1,0.92))', borderRight: '1px solid rgba(200,50,50,0.18)', backdropFilter: 'blur(20px)' }}>
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(200,50,50,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#b91c1c,#ea580c)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🎵</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Suno Bharat</div>
              <div style={{ color: 'rgba(255,150,150,0.45)', fontSize: 9 }}>Admin Panel</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '10px 8px' }}>
          {NAV.map(name => (
            <button key={name} onClick={() => goTo(name)} style={{
              width: '100%', padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: active === name ? 'rgba(160,25,25,0.5)' : 'transparent',
              color: active === name ? '#fff' : 'rgba(255,170,170,0.45)',
              fontSize: 13, fontWeight: active === name ? 600 : 400,
              borderLeft: active === name ? '2px solid rgba(255,90,90,0.7)' : '2px solid transparent',
              marginBottom: 2, textAlign: 'left', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>{name}</span>
              {name === 'Live' && online > 0 && (
                <span style={{ background: '#1dd1a1', color: '#000', fontSize: 9, fontWeight: 800, borderRadius: 99, padding: '1px 6px' }}>{online}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(200,50,50,0.12)' }}>
          <div style={{ color: 'rgba(255,150,150,0.35)', fontSize: 9, textAlign: 'center', marginBottom: 8 }}>
            🟢 Live refresh every 3s
          </div>
          <button onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false) }}
            style={{ width: '100%', padding: '9px 12px', background: 'none', border: '1px solid rgba(200,50,50,0.18)', borderRadius: 9, color: 'rgba(255,130,130,0.55)', fontSize: 12, cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: '14px 24px', borderBottom: '1px solid rgba(200,50,50,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0 }}>{worldKey ? (WORLD_NAMES[worldKey] || worldKey) + ' — Songs' : active}</h1>
            <p style={{ color: 'rgba(255,150,150,0.4)', fontSize: 10, marginTop: 2 }}>
              Last updated: {tick.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1dd1a1', boxShadow: '0 0 7px #1dd1a1', display: 'inline-block' }} />
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}><strong style={{ color: '#fff' }}>{online}</strong> live</span>
            </div>
            <button onClick={refresh} style={{ padding: '6px 14px', background: 'linear-gradient(90deg,#b91c1c,#ea580c)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Refresh
            </button>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {active === 'WorldDetail' && <WorldDetail worldKey={worldKey} worldTrend={data.worldTrend} worldHourly={data.worldHourly} onBack={() => navigate('/xb7k2-control-9f3m')} />}
          {active === 'Overview' && <Overview data={data} online={online} onOpenWorld={key => navigate('/xb7k2-control-9f3m/world/' + key)} />}
          {active === 'Live' && <LiveViewers />}

          {active === 'Worlds' && (
            <div style={CARD_BOX}>
              <div style={CARD_TITLE}>All Worlds — Visit Count</div>
              <div style={CARD_SUB}>Real-time from localStorage</div>
              {data.worlds.length === 0 && <p style={{ color: 'rgba(255,150,150,0.3)', fontSize: 13 }}>No visits yet. Open the main site first.</p>}
              {data.worlds.map((w, i) => (
                <div key={w.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid rgba(200,50,50,0.08)' }}>
                  <span style={{ color: 'rgba(255,150,150,0.35)', fontSize: 12, width: 18 }}>#{i + 1}</span>
                  <span style={{ fontSize: 18 }}>{w.icon}</span>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, flex: 1 }}>{w.name}</span>
                  <span style={{ color: 'rgba(255,180,180,0.6)', fontSize: 12 }}>{w.value} visits</span>
                  <span style={{ color: 'rgba(255,150,150,0.4)', fontSize: 11 }}>{w.pct.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}

          {active === 'Devices' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={CARD_BOX}>
                <div style={CARD_TITLE}>Devices</div>
                <div style={CARD_SUB}>Mobile vs Desktop</div>
                {data.devices.length === 0 && <p style={{ color: 'rgba(255,150,150,0.3)', fontSize: 12 }}>No data yet</p>}
                {data.devices.map(d => <BarRow key={d.name} name={d.name} value={d.value} pct={d.pct} color="rgba(72,219,251,0.75)" />)}
              </div>
              <div style={CARD_BOX}>
                <div style={CARD_TITLE}>Browsers</div>
                <div style={CARD_SUB}>Browser breakdown</div>
                {data.browsers.length === 0 && <p style={{ color: 'rgba(255,150,150,0.3)', fontSize: 12 }}>No data yet</p>}
                {data.browsers.map(b => <BarRow key={b.name} name={b.name} value={b.value} pct={b.pct} color="rgba(255,159,67,0.75)" />)}
              </div>
            </div>
          )}

          {active === 'Settings' && (
            <div style={CARD_BOX}>
              <div style={CARD_TITLE}>Settings</div>
              <div style={CARD_SUB}>Manage analytics data</div>
              <button onClick={() => {
                localStorage.removeItem('sb_visit_log')
                localStorage.removeItem('sb_stats')
                localStorage.removeItem('sb_world_visits')
                localStorage.removeItem('sb_time_spent')
                refresh()
              }} style={{ padding: '10px 20px', background: 'rgba(180,30,30,0.35)', border: '1px solid rgba(200,50,50,0.25)', borderRadius: 10, color: '#ff6b6b', fontSize: 13, cursor: 'pointer' }}>
                🗑 Clear All Analytics Data
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
