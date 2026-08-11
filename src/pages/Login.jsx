import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, ArrowRight } from 'lucide-react'

export default function Login({ onLogin }) {
  const [step, setStep] = useState('phone') // phone | otp | profile
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [profile, setProfile] = useState({ name: '', age: '', weight: '', goal: 'Build Muscle' })

  const handleOtp = (val, i) => {
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus()
  }

  const goals = ['Build Muscle', 'Lose Weight', 'Stay Fit', 'Increase Strength']

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/gym-bg.png')" }} />
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        <div className="font-bebas text-5xl text-white mb-1">IRON<span className="text-red-500">HOUSE</span></div>
        <p className="text-white/40 text-xs tracking-widest mb-8">YOUR FITNESS JOURNEY STARTS HERE</p>

        {step === 'phone' && (
          <div className="space-y-4">
            <p className="text-white/70 text-sm">Enter your mobile number</p>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <Phone size={16} className="text-white/40" />
              <span className="text-white/40 text-sm">+91</span>
              <input
                type="tel" maxLength={10} value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="9876543210"
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/20"
              />
            </div>
            <button
              onClick={() => phone.length === 10 && setStep('otp')}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              GET OTP <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <p className="text-white/70 text-sm">Enter OTP sent to +91 {phone}</p>
            <div className="flex gap-2 justify-between">
              {otp.map((d, i) => (
                <input
                  key={i} id={`otp-${i}`} type="text" maxLength={1} value={d}
                  onChange={e => handleOtp(e.target.value, i)}
                  className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-center text-white text-lg outline-none focus:border-red-500 transition-colors"
                />
              ))}
            </div>
            <button
              onClick={() => setStep('profile')}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              VERIFY <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 'profile' && (
          <div className="space-y-3">
            <p className="text-white/70 text-sm">Complete your profile</p>
            {[
              { key: 'name', placeholder: 'Full Name', type: 'text' },
              { key: 'age', placeholder: 'Age', type: 'number' },
              { key: 'weight', placeholder: 'Weight (kg)', type: 'number' },
            ].map(f => (
              <input key={f.key} type={f.type} placeholder={f.placeholder} value={profile[f.key]}
                onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-500 placeholder:text-white/20 transition-colors"
              />
            ))}
            <div className="grid grid-cols-2 gap-2">
              {goals.map(g => (
                <button key={g} onClick={() => setProfile(p => ({ ...p, goal: g }))}
                  className={`py-2 rounded-xl text-xs font-medium transition-colors ${profile.goal === g ? 'bg-red-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                  {g}
                </button>
              ))}
            </div>
            <button
              onClick={() => onLogin({ ...profile, phone })}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
            >
              ENTER GYM <ArrowRight size={16} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
