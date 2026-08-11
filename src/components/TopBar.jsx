import { useState, useEffect } from 'react'

export default function TopBar({ onlineCount = 42 }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      <span className="text-white/70 text-sm font-light tracking-widest">{time}</span>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-white/80 text-sm font-light tracking-wider">{onlineCount} ONLINE</span>
      </div>
      <div className="flex items-center gap-2 text-white/60 text-sm">
        <span>🎵</span>
        <span className="tracking-wider">SPOTIFY</span>
      </div>
    </div>
  )
}
