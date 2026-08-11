import { useState, useEffect, useRef } from 'react'

const PASSKEY = 'SunoBharat@2026#Admin'
const ADMIN_SESSION = 'sb_admin_auth'
const STATS_KEY = 'sb_stats'
const ONLINE_STORE = 'gym_online_tabs'
const WORLD_VISITS_KEY = 'sb_world_visits'
const VISIT_LOG_KEY = 'sb_visit_log'

const WORLDS = {
  truck: { name: 'Truck Driver', icon: '🚛' },
  salon: { name: 'Salon', icon: '💈' },
  chai: { name: 'Chai Adda', icon: '☕' },
  nightdrive: { name: 'Night Drive', icon: '🌙' },
  bhojpuri: { name: 'Bhojpuri', icon: '🎉' },
  punjabi: { name: 'Punjabi', icon: '🕺' },
  gym: { name: 'Gym', icon: '🏋️' },
}

function getStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY)) || { totalVisits: 0, todayVisits: 0, lastDate: '' } } catch { return { totalVisits: 0, todayVisits: 0, lastDate: '' } }
}
function getWorldVisits() {
  try { return JSON.parse(localStorage.getItem(WORLD_VISITS_KEY)) || {} } catch { return {} }
}
function getVisitLog() {
  try { return JSON.parse(localStorage.getItem(VISIT_LOG_KEY)) || [] } catch { return [] }
}
function getOnlineCount() {
  try {
    const tabs = JSON.parse(localStorage.getItem(ONLINE_STORE) || '{}')
    const now = Date.now()
    return Object.values(tabs).filter(t => now - t < 8000).length
  } catch { return 0 }
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 24px' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 8px' }}>{label}</p>
      <p style={{ color: color || '#fff', fontSize: 32, fontWeight: 700, margin: '0 0 4px' }}>{value}</p>
      {sub && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>{sub}</p>}
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(ADMIN_SESSION) === '1')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [online, setOnline] = useState(0)
  const [stats, setStats] = useState(getStats)
  const [worldVisits, setWorldVisits] = useState(getWorldVisits)
  const [visitLog, setVisitLog] = useState(getVisitLog)
  const [now, setNow] = useState(new Date())
  const timerRef = useRef(null)

  const login = () => {
    if (pass === PASSKEY) { sessionStorage.setItem(ADMIN_SESSION, '1'); setAuthed(true); setErr('') }
    else setErr('Wrong passkey. Try again.')
  }

  useEffect(() => {
    if (!authed) return
    const tick = () => {
      setOnline(getOnlineCount())
      setStats(getStats())
      setWorldVisits(getWorldVisits())
      setVisitLog(getVisitLog())
      setNow(new Date())
    }
    tick()
    timerRef.current = setInterval(tick, 2000)
    return () => clearInterval(timerRef.current)
  }, [authed])

  const totalWorldVisits = Object.values(worldVisits).reduce((a, b) => a + b, 0) || 1
  const topWorld = Object.entries(worldVisits).sort((a, b) => b[1] - a[1])[0]

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: 'min(380px,90vw)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Admin Access</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>sunobharat.online</p>
        </div>
        <input
          type="password"
          placeholder="Enter passkey..."
          value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: `1px solid ${err ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 15, outline: 'none', marginBottom: 12 }}
        />
        {err && <p style={{ color: '#f87171', fontSize: 13, margin: '0 0 12px' }}>{err}</p>}
        <button onClick={login} style={{ width: '100%', background: 'linear-gradient(90deg,#dc2626,#b91c1c)', border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Login
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: 'Inter, sans-serif', color: '#fff', padding: 'clamp(16px,4vw,40px)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Suno Bharat <span style={{ color: '#dc2626' }}>Admin</span></h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{now.toLocaleString('en-IN')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px rgba(74,222,128,0.8)' }} />
          <span style={{ color: '#4ade80', fontWeight: 600, fontSize: 14 }}>{online} live now</span>
          <button onClick={() => { sessionStorage.removeItem(ADMIN_SESSION); setAuthed(false) }}
            style={{ marginLeft: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Live Users" value={online} sub="right now" color="#4ade80" />
        <StatCard label="Total Visits" value={stats.totalVisits} sub="all time" />
        <StatCard label="Today's Visits" value={stats.todayVisits} sub={new Date().toLocaleDateString('en-IN')} color="#fb923c" />
        <StatCard label="Top World" value={topWorld ? WORLDS[topWorld[0]]?.icon + ' ' + WORLDS[topWorld[0]]?.name : '—'} sub={topWorld ? topWorld[1] + ' visits' : ''} color="#a78bfa" />
      </div>

      {/* World Breakdown */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 20px' }}>World Visits Breakdown</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.entries(WORLDS).map(([key, w]) => {
            const visits = worldVisits[key] || 0
            const pct = Math.round((visits / totalWorldVisits) * 100)
            return (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{w.icon} {w.name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{visits} visits · {pct}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#dc2626,#f97316)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Visits Log */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 16px' }}>Recent Activity</p>
        {visitLog.length === 0
          ? <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No activity yet. Waiting for users...</p>
          : [...visitLog].reverse().slice(0, 20).map((v, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 14 }}>{WORLDS[v.world]?.icon} {WORLDS[v.world]?.name || v.world}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{new Date(v.time).toLocaleTimeString('en-IN')}</span>
            </div>
          ))
        }
      </div>

    </div>
  )
}
