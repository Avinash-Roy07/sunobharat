import { useReducer, useRef, useEffect } from 'react'
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react'

const YT_TRACKS = [
  { id: 'gYtMOFBkHkE', title: 'Till I Collapse',  artist: 'Eminem'          },
  { id: 'btPJPFnesV4', title: 'Eye of the Tiger',  artist: 'Survivor'        },
  { id: '_Yhyp-_hX2s', title: 'Lose Yourself',     artist: 'Eminem'          },
  { id: 'PsO6ZnUZI0g', title: 'Stronger',          artist: 'Kanye West'      },
  { id: 'ZSM3w1v-A_Y', title: 'Pump It',           artist: 'Black Eyed Peas' },
]
const SPOTIFY_URL = 'https://open.spotify.com/embed/playlist/1OiRSxaH5bNrvVOj9UMEAg?utm_source=generator&theme=0'

// ── Reducer ───────────────────────────────────────────────────────────────────
const INIT = { source: 'youtube', ytIdx: 0, playing: false, vol: 80 }

function reducer(state, action) {
  switch (action.type) {
    case 'PLAY':   return { ...state, playing: true }
    case 'PAUSE':  return { ...state, playing: false }
    case 'GO_YT':  return { ...state, source: 'youtube', ytIdx: action.idx, playing: true }
    case 'GO_SP':  return { ...state, source: 'spotify', playing: false }
    case 'VOL':    return { ...state, vol: action.vol }
    default:       return state
  }
}

// ── Load YT API once ──────────────────────────────────────────────────────────
function loadYTApi() {
  return new Promise(resolve => {
    if (window.YT?.Player) { resolve(); return }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve() }
    if (!document.getElementById('yt-api')) {
      const s = document.createElement('script')
      s.id = 'yt-api'
      s.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(s)
    }
  })
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MusicPlayer() {
  const [state, dispatch] = useReducer(reducer, INIT)
  const { source, ytIdx, playing, vol } = state

  // stateRef is updated synchronously before any effect runs
  const stateRef  = useRef(state)
  stateRef.current = state          // ← sync update, no useEffect needed

  const playerRef = useRef(null)    // YT.Player instance
  const ytReady   = useRef(false)
  const ytDivId   = 'yt-player-mount'

  // ── next / prev always read stateRef.current — never stale ───────────────
  function next() {
    const s = stateRef.current
    if (s.source === 'youtube') {
      s.ytIdx + 1 < YT_TRACKS.length
        ? dispatch({ type: 'GO_YT', idx: s.ytIdx + 1 })
        : dispatch({ type: 'GO_SP' })
    } else {
      dispatch({ type: 'GO_YT', idx: 0 })
    }
  }

  function prev() {
    const s = stateRef.current
    if (s.source === 'youtube') {
      s.ytIdx - 1 >= 0
        ? dispatch({ type: 'GO_YT', idx: s.ytIdx - 1 })
        : dispatch({ type: 'GO_SP' })
    } else {
      dispatch({ type: 'GO_YT', idx: YT_TRACKS.length - 1 })
    }
  }

  // Keep refs to next/prev so YT callbacks always call the latest version
  const nextRef = useRef(next)
  const prevRef = useRef(prev)
  nextRef.current = next   // sync update every render
  prevRef.current = prev

  // ── Init YT player once ───────────────────────────────────────────────────
  useEffect(() => {
    loadYTApi().then(() => {
      const el = document.getElementById(ytDivId)
      if (!el || playerRef.current) return

      playerRef.current = new window.YT.Player(ytDivId, {
        height: '1',
        width: '1',
        videoId: YT_TRACKS[0].id,
        playerVars: { autoplay: 0, controls: 0, rel: 0, playsinline: 1 },
        events: {
          onReady(e) {
            ytReady.current = true
            e.target.setVolume(stateRef.current.vol)
          },
          onStateChange(e) {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) dispatch({ type: 'PLAY' })
            if (e.data === S.PAUSED)  dispatch({ type: 'PAUSE' })
            if (e.data === S.ENDED)   nextRef.current()
          },
        },
      })
    })
    return () => { try { playerRef.current?.destroy(); playerRef.current = null } catch {} }
  }, [])

  // ── Drive YT player whenever state changes ────────────────────────────────
  useEffect(() => {
    const p = playerRef.current
    if (!ytReady.current || !p) return

    if (source === 'spotify') {
      p.pauseVideo()
      return
    }

    const vid = YT_TRACKS[ytIdx].id
    if (playing) {
      p.loadVideoById(vid)
      p.setVolume(vol)
    } else {
      p.cueVideoById(vid)
    }
  }, [source, ytIdx, playing])

  // ── Volume ────────────────────────────────────────────────────────────────
  function handleVol(e) {
    const v = Number(e.target.value)
    dispatch({ type: 'VOL', vol: v })
    playerRef.current?.setVolume(v)
  }

  // ── Toggle play/pause ─────────────────────────────────────────────────────
  function togglePlay() {
    if (!ytReady.current) return
    playing ? playerRef.current?.pauseVideo() : playerRef.current?.playVideo()
  }

  const track = YT_TRACKS[ytIdx]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[420px] max-w-[92vw]">

      {/* YT player node — stays in DOM always, 1px so browser allows audio */}
      <div id={ytDivId} style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0.01, pointerEvents: 'none' }} />

      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">

        {source === 'spotify' ? (
          <>
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span className="text-white/70 text-xs font-medium">Spotify Playlist</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => prevRef.current()} className="text-white/50 hover:text-white transition-colors">
                  <SkipBack size={14} />
                </button>
                <button onClick={() => nextRef.current()} className="text-white/50 hover:text-white transition-colors">
                  <SkipForward size={14} />
                </button>
              </div>
            </div>
            <iframe
              src={SPOTIFY_URL}
              width="100%" height="152"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ border: 'none', display: 'block' }}
            />
            <div className="text-center py-2">
              <button onClick={() => dispatch({ type: 'GO_YT', idx: 0 })}
                className="text-xs text-white/30 hover:text-white/60 transition-colors">
                ↩ Switch to YouTube
              </button>
            </div>
          </>
        ) : (
          <div className="px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-700 to-orange-600 flex items-center justify-center shrink-0 text-xl">
                🎵
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{track.title}</p>
                    <p className="text-white/50 text-xs truncate">{track.artist}</p>
                    <p className="text-white/25 text-xs">{ytIdx + 1} / {YT_TRACKS.length} · YouTube</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <button onClick={() => prevRef.current()} className="text-white/60 hover:text-white transition-colors">
                      <SkipBack size={16} />
                    </button>
                    <button onClick={togglePlay}
                      className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors">
                      {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                    </button>
                    <button onClick={() => nextRef.current()} className="text-white/60 hover:text-white transition-colors">
                      <SkipForward size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 px-1">
              <Volume2 size={12} className="text-white/40" />
              <input type="range" min="0" max="100" value={vol}
                onChange={handleVol} className="flex-1" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
