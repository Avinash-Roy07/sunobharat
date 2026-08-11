import { Calendar, Dumbbell, BarChart2, CreditCard, Salad, User, QrCode, Bell } from 'lucide-react'

const actions = [
  { icon: Calendar, label: 'Book Trainer', color: 'from-purple-600 to-purple-800', page: 'trainer' },
  { icon: Dumbbell, label: 'Workout', color: 'from-red-600 to-red-800', page: 'workout' },
  { icon: BarChart2, label: 'Progress', color: 'from-blue-600 to-blue-800', page: 'progress' },
  { icon: CreditCard, label: 'Membership', color: 'from-yellow-600 to-yellow-800', page: 'membership' },
  { icon: QrCode, label: 'Check In', color: 'from-green-600 to-green-800', page: 'checkin' },
  { icon: User, label: 'Profile', color: 'from-gray-600 to-gray-800', page: 'profile' },
]

export default function Dashboard({ user, onNavigate }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const daysLeft = 18
  const pct = (daysLeft / 90) * 100

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-6">
        <div className="font-bebas text-2xl text-white">IRON<span className="text-red-500">HOUSE</span></div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
            <Bell size={16} className="text-white/60" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>
      </div>

      <div className="px-5 space-y-5">
        {/* Greeting */}
        <div>
          <p className="text-white/50 text-sm">{greeting},</p>
          <h1 className="text-white text-2xl font-bold">{user?.name || 'Athlete'} 👋</h1>
        </div>

        {/* Membership card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900/60 to-black border border-red-500/20 p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/50 text-xs tracking-widest">YOUR MEMBERSHIP</p>
              <p className="text-white font-bold text-lg mt-1">GOLD MEMBERSHIP</p>
            </div>
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1 rounded-full border border-yellow-500/30">ACTIVE</span>
          </div>
          <p className="text-white/40 text-xs mb-3">Valid until: 25 Sept 2026</p>
          <div className="w-full h-1.5 bg-white/10 rounded-full mb-2">
            <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-white/60 text-xs">{daysLeft} days remaining</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Workouts', value: '24', sub: 'this month' },
            { label: 'Streak', value: '7', sub: 'days' },
            { label: 'Weight', value: '76kg', sub: '↓ 6kg' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <p className="text-white font-bold text-xl">{s.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              <p className="text-green-400 text-xs">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-white/50 text-xs tracking-widest mb-3">QUICK ACTIONS</p>
          <div className="grid grid-cols-3 gap-3">
            {actions.map(a => (
              <button key={a.label} onClick={() => onNavigate(a.page)}
                className="flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 transition-all active:scale-95">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center`}>
                  <a.icon size={18} className="text-white" />
                </div>
                <span className="text-white/70 text-xs font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's workout preview */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/50 text-xs tracking-widest">TODAY'S WORKOUT</p>
            <span className="text-red-400 text-xs">CHEST + TRICEPS</span>
          </div>
          {['Bench Press 4×10', 'Incline DB Press 3×12', 'Cable Fly 3×15'].map((ex, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <span className="text-white/20 text-xs w-4">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-white/70 text-sm">{ex}</span>
            </div>
          ))}
          <button onClick={() => onNavigate('workout')}
            className="w-full mt-3 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors">
            START WORKOUT
          </button>
        </div>
      </div>
    </div>
  )
}
