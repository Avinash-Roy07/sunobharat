import { useState } from 'react'
import { ChevronLeft, CheckCircle2, Circle } from 'lucide-react'

const plans = [
  { name: 'MONTHLY', price: '₹999', duration: '1 Month', popular: false },
  { name: 'QUARTERLY', price: '₹2,499', duration: '3 Months', popular: true },
  { name: 'HALF-YEARLY', price: '₹4,499', duration: '6 Months', popular: false },
  { name: 'YEARLY', price: '₹7,999', duration: '12 Months', popular: false },
]

export default function Membership({ onBack }) {
  const [selected, setSelected] = useState(1)

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      <div className="flex items-center gap-4 px-5 pt-12 pb-6">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
          <ChevronLeft size={18} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-xl">Membership</h1>
      </div>

      <div className="px-5 space-y-5">
        {/* Current */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-900/40 to-black border border-yellow-500/20 p-5">
          <p className="text-yellow-400/70 text-xs tracking-widest mb-1">ACTIVE MEMBERSHIP</p>
          <p className="text-white font-bold text-2xl font-bebas tracking-wide">GOLD</p>
          <p className="text-white/50 text-sm mt-1">01 Aug → 01 Nov 2026</p>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-white/40 text-xs">Days remaining</p>
              <p className="text-white font-bold text-3xl">83</p>
            </div>
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1 rounded-full border border-yellow-500/30">ACTIVE</span>
          </div>
        </div>

        {/* Plans */}
        <p className="text-white/50 text-xs tracking-widest">UPGRADE PLAN</p>
        <div className="space-y-3">
          {plans.map((p, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selected === i ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}>
              <div className="flex items-center gap-3">
                {selected === i ? <CheckCircle2 size={18} className="text-red-500" /> : <Circle size={18} className="text-white/20" />}
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">{p.name}</p>
                  <p className="text-white/40 text-xs">{p.duration}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{p.price}</p>
                {p.popular && <span className="text-red-400 text-xs">POPULAR</span>}
              </div>
            </button>
          ))}
        </div>

        <button className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bebas text-xl tracking-widest rounded-xl transition-colors">
          RENEW MEMBERSHIP
        </button>
      </div>
    </div>
  )
}
