import { useState, useEffect, useRef } from 'react'

function useOnlineCount() {
  const [count, setCount] = useState(1)
  useEffect(() => {
    const KEY = 'gym_tab_' + Math.random().toString(36).slice(2)
    const STORE = 'gym_online_tabs'
    const getTabs = () => { try { return JSON.parse(localStorage.getItem(STORE) || '{}') } catch { return {} } }
    const setTabs = t => localStorage.setItem(STORE, JSON.stringify(t))
    const bc = new BroadcastChannel('gym_online')
    const refresh = () => {
      const now = Date.now(), tabs = getTabs()
      Object.keys(tabs).forEach(k => { if (now - tabs[k] > 8000) delete tabs[k] })
      tabs[KEY] = now; setTabs(tabs); setCount(Object.keys(tabs).length); bc.postMessage('ping')
    }
    bc.onmessage = refresh
    const id = setInterval(refresh, 4000)
    refresh()
    return () => { clearInterval(id); bc.close(); const t = getTabs(); delete t[KEY]; setTabs(t) }
  }, [])
  return count
}

const WORLDS = {
  truck:      { name: 'Truck Driver', icon: '🚛', line1: 'ट्रक वाला', line2: 'सफ़र',    playlist: 'PLK0SeYSdwssE', bg: '/truck-bg.png'     },
  salon:      { name: 'Salon',        icon: '💈', line1: 'सैलून की', line2: 'धुन',     playlist: 'PLNvMd2ifvgjo', bg: '/barber-bg.jpg'    },
  chai:       { name: 'Chai Adda',    icon: '☕', line1: 'चाय वाला', line2: 'अड्डा',   playlist: 'PLcvn0G-x_awU', bg: '/chai-bg.png'      },
  nightdrive: { name: 'Night Drive',  icon: '🌙', line1: 'रात और',  line2: 'रास्ते',  playlist: 'PLV-fnvOKr6xE', bg: '/nightride-bg.png' },
  bhojpuri:   { name: 'Bhojpuri',     icon: '🎉', line1: 'भोजपुरी', line2: 'धमाका',   playlist: 'PLdWXnMeQmWHA', bg: '/bhojpuri-bg.png'  },
  punjabi:    { name: 'Punjabi',      icon: '🕺', line1: 'पंजाबी',  line2: 'तशान',    playlist: 'PLXASzBhrVsnA', bg: '/punjabi-bg.png'   },
  gym:        { name: 'Gym',          icon: '🏋️', line1: 'जिम का',  line2: 'जोश',     playlist: 'PLM3AObkR-v04', bg: '/gym-bg.png'       },
}

// pill is same dark red for all worlds
const PILL = ['rgba(160,40,40,0.92)', 'rgba(60,10,10,0.96)']

const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`



function SidebarWorldList({ worlds, currentWorld, onSelect }) {
  const [q, setQ] = useState('')
  const all = Object.entries(worlds)
  const list = q.trim()
    ? all.filter(([k, w]) => w.name.toLowerCase().includes(q.toLowerCase()) || k.toLowerCase().includes(q.toLowerCase()))
    : all
  return (
    <>
      <div style={{ padding: '0 18px 12px' }}>
        <div style={{ position: 'relative' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,150,150,0.45)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            value={q}
            placeholder="Search worlds..."
            onClick={e => e.stopPropagation()}
            onChange={e => setQ(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(200,60,60,0.22)',
              borderRadius: 10, padding: '9px 12px 9px 30px', color: '#fff', fontSize: 13, outline: 'none',
            }}
          />
        </div>
      </div>
      <div style={{ height: 1, background: 'rgba(200,60,60,0.15)', margin: '0 18px 6px' }} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {list.map(([key, w]) => (
          <button key={key} onClick={() => { onSelect(key); setQ('') }} style={{
            width: '100%', background: currentWorld === key ? 'rgba(160,25,25,0.4)' : 'none',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 18px', color: currentWorld === key ? '#fff' : 'rgba(255,210,210,0.6)',
            fontSize: 14, fontWeight: currentWorld === key ? 600 : 400, textAlign: 'left',
            borderLeft: currentWorld === key ? '3px solid rgba(255,90,90,0.75)' : '3px solid transparent',
            transition: 'background 0.15s',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: currentWorld === key ? 1 : 0.5, flexShrink: 0 }}><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
            {w.name}
            {currentWorld === key && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,120,120,0.9)', boxShadow: '0 0 6px rgba(255,80,80,0.8)' }} />}
          </button>
        ))}
        {list.length === 0 && <p style={{ color: 'rgba(255,150,150,0.4)', fontSize: 12, textAlign: 'center', marginTop: 12 }}>No worlds found</p>}
      </div>
    </>
  )
}


function getWorldFromPath() {
  const path = window.location.pathname.replace('/', '') || 'truck'
  return WORLDS[path] ? path : 'truck'
}

const SAVE_KEY = 'gym_player_state'
function loadSaved() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {} } catch { return {} }
}
function saveState(obj) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(obj)) } catch {}
}

function trackVisit(world) {
  try {
    // total + today stats
    const s = JSON.parse(localStorage.getItem('sb_stats') || '{}')
    const today = new Date().toDateString()
    s.totalVisits = (s.totalVisits || 0) + 1
    s.todayVisits = s.lastDate === today ? (s.todayVisits || 0) + 1 : 1
    s.lastDate = today
    localStorage.setItem('sb_stats', JSON.stringify(s))
    // per world
    const wv = JSON.parse(localStorage.getItem('sb_world_visits') || '{}')
    wv[world] = (wv[world] || 0) + 1
    localStorage.setItem('sb_world_visits', JSON.stringify(wv))
    // visit log
    const log = JSON.parse(localStorage.getItem('sb_visit_log') || '[]')
    log.push({ world, time: Date.now() })
    if (log.length > 200) log.splice(0, log.length - 200)
    localStorage.setItem('sb_visit_log', JSON.stringify(log))
  } catch {}
}

export default function App() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase())
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])

  const online    = useOnlineCount()
  const playerRef = useRef(null)
  const pollRef   = useRef(null)

  const saved = loadSaved()
  const [world,    setWorld]    = useState(() => {
    const path = window.location.pathname.replace('/', '')
    return WORLDS[path] ? path : (saved.world && WORLDS[saved.world] ? saved.world : 'truck')
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible,  setVisible]  = useState(true)
  const [ready,    setReady]    = useState(false)
  const [playing,  setPlaying]  = useState(false)
  const [elapsed,  setElapsed]  = useState(0)
  const [duration, setDuration] = useState(0)
  const [thumb,    setThumb]    = useState('')
  const [title,    setTitle]    = useState('Loading...')
  const [artist,   setArtist]   = useState('')
  const savedRef   = useRef(saved)

  const W   = WORLDS[world]
  const pct = duration ? Math.min((elapsed / duration) * 100, 100) : 0

  // sync URL on world change
  useEffect(() => {
    window.history.pushState({}, '', `/${world}`)
    document.title = `${W.name} — Music`
  }, [world])

  // handle browser back/forward
  useEffect(() => {
    const onPop = () => setWorld(getWorldFromPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const updateMetaRef = useRef(null)

  const updateMeta = () => {
    try {
      const p = playerRef.current
      const data = p.getVideoData()
      if (data?.title) {
        const parts = data.title.split(' - ')
        setTitle(parts[0] || data.title)
        setArtist(parts[1] || '')
      }
      if (data?.video_id) setThumb(`https://i.ytimg.com/vi/${data.video_id}/mqdefault.jpg`)
      setDuration(Math.floor(p.getDuration()) || 0)
    } catch {}
  }
  updateMetaRef.current = updateMeta

  const next = () => { try { playerRef.current?.nextVideo() } catch {} }
  const prev = () => { try { playerRef.current?.previousVideo() } catch {} }

  const createPlayer = (playlistId, isInitial = false) => {
    try { playerRef.current?.destroy() } catch {}
    const old = document.getElementById('yt-player')
    if (old) old.remove()
    const div = document.createElement('div')
    div.id = 'yt-player'
    div.style.cssText = 'position:fixed;bottom:0;right:0;width:1px;height:1px;opacity:0.01'
    document.body.appendChild(div)
    const sv = savedRef.current
    const startIndex = isInitial && sv.index ? sv.index : 0
    const startSeconds = isInitial && sv.elapsed ? sv.elapsed : 0
    playerRef.current = new window.YT.Player('yt-player', {
      height: '1', width: '1',
      playerVars: {
        listType: 'playlist', list: playlistId,
        autoplay: 1, controls: 0, rel: 0, playsinline: 1, enablejsapi: 1, loop: 1,
        origin: window.location.origin,
        index: startIndex,
        start: startSeconds,
      },
      events: {
        onReady(e) {
          setReady(true)
          // seek to saved position then pause so it shows metadata without forcing play
          if (startSeconds > 0) {
            try { e.target.seekTo(startSeconds, true) } catch {}
          }
          // load metadata immediately
          setTimeout(() => { updateMetaRef.current?.() }, 800)
        },
        onStateChange(e) {
          const S = window.YT.PlayerState
          if (e.data === S.PLAYING) {
            setPlaying(true); updateMetaRef.current?.()
            clearInterval(pollRef.current)
            pollRef.current = setInterval(() => {
              try {
                const t = Math.floor(playerRef.current.getCurrentTime())
                const d = Math.floor(playerRef.current.getDuration())
                setElapsed(t)
                setDuration(d)
                updateMetaRef.current?.()
                // persist every tick
                saveState({ world: stateWorldRef.current, index: playerRef.current.getPlaylistIndex?.() ?? 0, elapsed: t })
              } catch {}
            }, 500)
          }
          if (e.data === S.PAUSED) { setPlaying(false); clearInterval(pollRef.current) }
          if (e.data === S.ENDED)  { setPlaying(false); clearInterval(pollRef.current) }
        }
      }
    })
  }

  const stateWorldRef = useRef(world)
  useEffect(() => { stateWorldRef.current = world; saveState({ ...loadSaved(), world }); trackVisit(world) }, [world])

  useEffect(() => {
    const initWorld = stateWorldRef.current
    if (window.YT?.Player) createPlayer(WORLDS[initWorld].playlist, true)
    else {
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      window.onYouTubeIframeAPIReady = () => createPlayer(WORLDS[initWorld].playlist, true)
      document.head.appendChild(s)
    }
    return () => { clearInterval(pollRef.current); try { playerRef.current?.destroy() } catch {} }
  }, [])

  // fade out → switch → fade in
  const selectWorld = (key) => {
    if (key === world) { setMenuOpen(false); return }
    setMenuOpen(false)
    setVisible(false)
    setReady(false); setPlaying(false)
    setTimeout(() => {
      setWorld(key)
      savedRef.current = {}
      setElapsed(0); setDuration(0); setThumb(''); setTitle('Loading...'); setArtist('')
      createPlayer(WORLDS[key].playlist, false)
      setVisible(true)
    }, 350)
  }

  const togglePlay = () => {
    if (!playerRef.current) return
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', userSelect: 'none', fontFamily: 'Inter, sans-serif' }}>

      {/* YT player injected dynamically */}

      {/* Dark base to prevent white flash during transition */}
      <div style={{ position: 'absolute', inset: 0, background: '#0a0202' }} />

      {/* Fade wrapper */}
      <div style={{ position: 'absolute', inset: 0, opacity: visible ? 1 : 0, transition: 'opacity 0.35s ease' }}>

        {/* BG */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('${W.bg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.6) 100%)' }} />

        {/* BRANDING */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'clamp(-80px,-12vw,-60px)', pointerEvents: 'none' }}>
          <h1 style={{
            fontFamily: "'Tiro Devanagari Hindi', serif",
            fontSize: 'clamp(2.8rem, 14vw, 8.5rem)',
            lineHeight: 1.05, color: '#fff', textAlign: 'center',
            textShadow: '4px 4px 0 rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.35)',
            WebkitTextStroke: '2px rgba(255,255,255,0.15)', margin: 0, padding: '0 12px',
          }}>
            {W.line1}<br />{W.line2}
          </h1>
        </div>

        {/* PILL PLAYER */}
        <div style={{ position: 'absolute', bottom: 'clamp(50px,8vw,40px)', left: '50%', transform: 'translateX(-50%)', width: 'min(560px,92vw)', zIndex: 10 }}>
          <div style={{
            background: `linear-gradient(90deg, ${PILL[0]} 0%, ${PILL[1]} 100%)`,
            backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
            borderRadius: 999, padding: '8px 16px 8px 8px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 8px 40px rgba(0,0,0,0.55)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
              overflow: 'hidden', background: 'linear-gradient(135deg,#b91c1c,#ea580c)',
              animation: 'spin-thumb 5s linear infinite',
              animationPlayState: playing ? 'running' : 'paused',
              boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            }}>
              <img src={thumb} alt=""
                onError={e => { e.target.onerror = null; e.target.style.display = 'none' }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 1 }}>{title}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artist || W.name + ' Playlist'}</div>
              <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.18)', borderRadius: 99 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'rgba(255,255,255,0.9)', borderRadius: 99, transition: 'width 0.5s linear' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem' }}>{fmt(elapsed)}</span>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem' }}>{duration ? fmt(duration) : '--:--'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button onClick={prev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 3, display: 'flex' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
              </button>
              <button onClick={togglePlay} disabled={!ready} style={{
                width: 40, height: 40, borderRadius: '50%',
                background: ready ? '#fff' : 'rgba(255,255,255,0.25)',
                border: 'none', cursor: ready ? 'pointer' : 'wait',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}>
                {playing
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#111"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="#111" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>}
              </button>
              <button onClick={next} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 3, display: 'flex' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 3.9V8.1L8.5 12zM16 6h2v12h-2z"/></svg>
              </button>
            </div>
          </div>
        </div>

      </div>{/* end fade wrapper */}

      {/* TOP BAR */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(10px,2.5vw,14px) clamp(12px,3vw,20px) 0', zIndex: 20 }}>
        <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: 'clamp(11px,2.8vw,13px)', fontWeight: 300 }}>{time}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 7px 2px rgba(74,222,128,0.65)' }} />
          <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: 'clamp(11px,2.8vw,13px)' }}>{online}&nbsp;online</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px,2vw,14px)' }}>
          {/* Spotify — icon only on mobile */}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.88)', fontSize: 13 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
            <span className="hide-mobile">Spotify</span>
          </span>
          {/* YT Music — icon only on mobile */}
          <a href="https://music.youtube.com" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.88)', textDecoration: 'none', fontSize: 13 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0000"><path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L16.2 12l-6.516 3.54z"/></svg>
            <span className="hide-mobile">YT Music</span>
          </a>
          <button onClick={() => setMenuOpen(o => !o)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, backdropFilter: 'blur(10px)' }}>
            <span style={{ width: 15, height: 2, background: '#fff', borderRadius: 2 }} />
            <span style={{ width: 15, height: 2, background: '#fff', borderRadius: 2 }} />
            <span style={{ width: 15, height: 2, background: '#fff', borderRadius: 2 }} />
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 29, background: 'rgba(0,0,0,0.25)' }} />
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(280px,85vw)', zIndex: 30,
            background: 'linear-gradient(175deg, rgba(100,12,12,0.45) 0%, rgba(8,2,2,0.78) 60%, rgba(4,1,1,0.88) 100%)',
            backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            borderLeft: '1px solid rgba(220,60,60,0.2)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 18px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,120,120,0.8)"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
                <span style={{ color: 'rgba(255,200,200,0.7)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>Music Worlds</span>
              </div>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>

            {/* Search + filtered world list */}
            <SidebarWorldList worlds={WORLDS} currentWorld={world} onSelect={selectWorld} />
          </div>
        </>
      )}

    </div>
  )
}
