import { useState } from 'react'

// SVG icons per world key
const ICONS = {
  chai: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 9h12v1.5a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6V9z" fill="#f59e0b" opacity=".2" stroke="#f59e0b" strokeWidth="1.4"/>
      <path d="M16 10.5h1a2.5 2.5 0 0 1 0 5h-1" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 9V7M10 9V6M13 9V7" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M6 18h8" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  gym: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M6.5 8.5v7M17.5 8.5v7" stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M4 10v4M20 10v4" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M6.5 12h11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  salon: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M6 5.5C7.5 4 9 5 9 6.5c0 1-1 1.5-1 2.5L12 19l4-10c0-1-1-1.5-1-2.5C15 5 16.5 4 18 5.5" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 6.5h6" stroke="#e9d5ff" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="12" cy="19" r="2" fill="#c084fc" opacity=".8"/>
    </svg>
  ),
  truck: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="1" y="7" width="13" height="9" rx="1" fill="#fb923c" opacity=".25" stroke="#fb923c" strokeWidth="1.4"/>
      <path d="M14 10.5h5l3 4.5v1.5h-8v-6z" fill="#ea580c" opacity=".8" stroke="#fb923c" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="5" cy="18" r="2" stroke="#fb923c" strokeWidth="1.5" fill="none"/>
      <circle cx="18" cy="18" r="2" stroke="#fb923c" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  bhojpuri: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="9" width="18" height="9" rx="4.5" stroke="#f472b6" strokeWidth="1.5" fill="#f472b6" opacity=".1"/>
      <rect x="10" y="4" width="4" height="6" rx="2" fill="#f472b6" opacity=".9"/>
      <circle cx="3.5" cy="13.5" r="1.5" fill="#f472b6"/>
      <circle cx="20.5" cy="13.5" r="1.5" fill="#f472b6"/>
    </svg>
  ),
  punjabi: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M9 18V8l12-3v10" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="6" cy="18" r="3" fill="#38bdf8" opacity=".2" stroke="#38bdf8" strokeWidth="1.5"/>
      <circle cx="18" cy="15" r="3" fill="#38bdf8" opacity=".2" stroke="#38bdf8" strokeWidth="1.5"/>
      <path d="M9 12l12-3" stroke="#7dd3fc" strokeWidth="1.1" strokeLinecap="round" opacity=".6"/>
    </svg>
  ),
  nightdrive: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M3 17h18M5 17l1.5-5h11L19 17" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 12h3v2.5H8zM13 12h3v2.5h-3z" fill="#818cf8" opacity=".45"/>
      <circle cx="7.5" cy="18.5" r="2" stroke="#818cf8" strokeWidth="1.4" fill="none"/>
      <circle cx="16.5" cy="18.5" r="2" stroke="#818cf8" strokeWidth="1.4" fill="none"/>
      <path d="M16 6a4 4 0 0 1 5 5" stroke="#fde68a" strokeWidth="1.3" strokeLinecap="round" opacity=".8"/>
      <circle cx="17.5" cy="5" r="1.5" fill="#fde68a" opacity=".85"/>
    </svg>
  ),
  rajumistri: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 20h16M6 20V10l6-6 6 6v10" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="9" y="14" width="6" height="6" rx="1" fill="#f97316" opacity=".3" stroke="#f97316" strokeWidth="1.3"/>
      <path d="M3 10l9-7 9 7" stroke="#fdba74" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  hindi90s: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#a78bfa" strokeWidth="1.5" fill="#a78bfa" opacity=".1"/>
      <path d="M8 5V3M16 5V3" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 13h2M11 10v6M13 10h2a2 2 0 0 1 0 4h-2" stroke="#c4b5fd" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

// fallback for any new world added later
const DEFAULT_ICON = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M9 18V5l12-2v13" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6" cy="18" r="3" fill="#a78bfa" opacity=".25" stroke="#a78bfa" strokeWidth="1.5"/>
    <circle cx="18" cy="16" r="3" fill="#a78bfa" opacity=".25" stroke="#a78bfa" strokeWidth="1.5"/>
  </svg>
)

const COLORS = {
  chai: '#f59e0b', gym: '#ef4444', salon: '#c084fc',
  truck: '#fb923c', bhojpuri: '#f472b6', punjabi: '#38bdf8',
  nightdrive: '#818cf8', rajumistri: '#f97316', hindi90s: '#a78bfa',
}

const HINDI_NAMES = {
  chai: 'चाय अड्डा', gym: 'जिम का जोश', salon: 'सैलून की महफ़िल',
  truck: 'ट्रक वाला सफ़र', bhojpuri: 'भोजपुरी धमाल',
  punjabi: 'पंजाबी धमाका', nightdrive: 'रात का सफ़र',
  rajumistri: 'राजू मिस्त्री', hindi90s: '90s विडियो हिंदी',
}

const PAGE_SIZE = 6

// worlds prop = WORLDS object from App.jsx — auto-updates when new world added
export default function MusicExplorePopup({ onClose, onSelect, worlds = {} }) {
  const [page, setPage] = useState(0)

  const allCats = Object.entries(worlds).map(([key, w]) => ({
    key,
    name: HINDI_NAMES[key] || w.name,
    color: COLORS[key] || '#a78bfa',
    icon: ICONS[key] || DEFAULT_ICON,
  }))

  const totalPages = Math.ceil(allCats.length / PAGE_SIZE)
  const visible = allCats.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <>
      {/* OVERLAY */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.68)',
        animation: 'mepOverlay 0.25s ease',
      }} />

      {/* POPUP */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 10000,
        width: 'min(620px, 94vw)',
        background: '#0e0e0e',
        border: '1px solid #7f1d1d',
        borderRadius: 22,
        overflow: 'hidden',
        boxShadow: '0 0 0 1px #450a0a, 0 32px 90px #000, 0 0 80px rgba(220,38,38,0.18)',
        animation: 'mepPopup 0.32s cubic-bezier(.2,.8,.2,1)',
      }}>

        {/* TOP SECTION */}
        <div style={{ position: 'relative', display: 'flex', minHeight: 220 }}>

          {/* LEFT — red fade bg + text */}
          <div style={{
            flex: 1,
            padding: '30px 24px 24px 28px',
            background: 'linear-gradient(135deg, #5c0a0a 0%, #3b0606 40%, #1c0303 75%, #0e0e0e 100%)',
            position: 'relative', zIndex: 1,
          }}>
            <div style={{
              position: 'absolute', top: -40, left: -40,
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, #b91c1c, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <h2 style={{
              position: 'relative', margin: '0 0 14px', color: '#fff',
              fontFamily: "'Noto Sans Devanagari','Mangal',Arial,sans-serif",
              fontSize: 'clamp(26px,4.5vw,34px)', lineHeight: 1.18, fontWeight: 800,
              textShadow: '0 2px 16px rgba(0,0,0,0.6)',
            }}>
              अपने मूड का<br />
              <span style={{ color: '#ff3333', textShadow: '0 0 28px rgba(255,40,40,0.6)' }}>
                संगीत खोजें
              </span>
            </h2>
            <p style={{
              position: 'relative', margin: 0, color: 'rgba(255,195,195,0.75)',
              fontFamily: "'Noto Sans Devanagari','Mangal',Arial,sans-serif",
              fontSize: 12.5, lineHeight: 1.8,
            }}>
              अपने पसंदीदा प्लेलिस्ट चुनें और<br />
              हर पल को बनाएं खास —<br />
              <span style={{ color: '#f59e0b' }}>चाय अड्डा</span> से लेकर{' '}
              <span style={{ color: '#ff5555' }}>रात का सफ़र</span> तक।
            </p>
          </div>

          {/* RIGHT — hero image */}
          <div style={{
            position: 'relative', width: 230, flexShrink: 0,
            background: 'linear-gradient(180deg, #1c0303 0%, #0e0e0e 100%)',
          }}>
            <div style={{
              position: 'absolute', top: '20%', right: -30,
              width: 220, height: 220, borderRadius: '50%',
              background: 'radial-gradient(circle, #dc2626, transparent 68%)',
              pointerEvents: 'none',
            }} />
            <img src="/images/music-hero.png" alt="Music" style={{
              position: 'relative', zIndex: 1,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center', display: 'block',
            }} />
            {[
              { ch: '♪', top: 12,  left: 8,    color: '#ff6b6b', size: 22 },
              { ch: '♫', top: 30,  right: 10,  color: '#fbbf24', size: 20 },
              { ch: '♪', bottom: 30, left: 20, color: '#f9a8d4', size: 17 },
              { ch: '✦', top: 80,  left: 60,   color: '#fde68a', size: 13 },
              { ch: '✦', bottom: 40, right: 18, color: '#fca5a5', size: 11 },
            ].map(({ ch, color, size, ...pos }, i) => (
              <span key={i} style={{
                position: 'absolute', zIndex: 2,
                userSelect: 'none', pointerEvents: 'none',
                color, fontSize: size, textShadow: `0 0 9px ${color}`,
                animation: 'mepFloat 3s ease-in-out infinite',
                animationDelay: `${i * 0.3}s`, ...pos,
              }}>{ch}</span>
            ))}
          </div>

          {/* CLOSE */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 13, right: 14,
            background: '#3b0606', border: '1px solid #7f1d1d',
            borderRadius: '50%', width: 30, height: 30,
            color: 'rgba(255,255,255,0.55)', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', zIndex: 10,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.35)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
          >✕</button>
        </div>

        {/* BOTTOM */}
        <div style={{ padding: '20px 24px 22px', background: 'linear-gradient(180deg, #1c0303 0%, #0e0e0e 40%)' }}>

          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #7f1d1d, transparent)', marginBottom: 18 }} />

          {/* CATEGORIES — 6 per page, dynamic */}
          <div key={page} style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${visible.length}, 72px)`,
            justifyContent: 'center',
            gap: 4, marginBottom: 22, minHeight: 90,
            animation: 'mepSlide 0.28s ease',
          }}>
            {visible.map((c) => (
              <button key={c.key}
                onClick={() => { onSelect?.(c.key); onClose() }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9,
                  padding: '2px 0',
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${c.color}14`,
                  border: `1.5px solid ${c.color}50`,
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)'
                  e.currentTarget.style.boxShadow = `0 8px 24px ${c.color}55`
                  e.currentTarget.style.borderColor = `${c.color}bb`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = `${c.color}50`
                }}
                >
                  {c.icon}
                </div>
                <span style={{
                  color: 'rgba(255,215,215,0.72)',
                  fontFamily: "'Noto Sans Devanagari','Mangal',Arial,sans-serif",
                  fontSize: 9.5, textAlign: 'center', lineHeight: 1.3,
                  width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{c.name}</span>
              </button>
            ))}
          </div>

          {/* GOT IT */}
          <div style={{ textAlign: 'center', marginBottom: 13 }}>
            <button onClick={onClose} style={{
              background: 'linear-gradient(90deg,#b91c1c,#dc2626,#ea580c)',
              border: 'none', borderRadius: 50,
              width: 172, height: 46,
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(185,28,28,0.55)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(185,28,28,0.72)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(185,28,28,0.55)' }}
            >✦ Got it!</button>
          </div>

          {/* DOTS — dynamic based on total pages */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 7 }}>
              {Array.from({ length: totalPages }).map((_, d) => (
                <button key={d} onClick={() => setPage(d)} style={{
                  width: page === d ? 20 : 7, height: 7,
                  borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0,
                  background: page === d ? '#dc2626' : 'rgba(255,255,255,0.16)',
                  boxShadow: page === d ? '0 0 8px rgba(220,38,38,0.7)' : 'none',
                  transition: 'all 0.2s',
                }} />
              ))}
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes mepOverlay { from{opacity:0} to{opacity:1} }
        @keyframes mepPopup { from{opacity:0;transform:translate(-50%,-48%) scale(0.93)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes mepFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes mepSlide { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </>
  )
}
