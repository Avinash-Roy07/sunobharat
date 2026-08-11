import { motion } from 'framer-motion'
import TopBar from '../components/TopBar'
import MusicPlayer from '../components/MusicPlayer'

export default function Landing({ onEnter }) {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/gym-bg.png')" }}
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

      <TopBar onlineCount={42} />

      {/* Center branding */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Logo block */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="mb-6"
          >
            <div className="font-bebas text-[10rem] leading-none tracking-tight text-white drop-shadow-2xl">
              IRON
            </div>
            <div className="font-bebas text-[10rem] leading-none tracking-tight text-red-500 drop-shadow-2xl -mt-6">
              HOUSE
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-white/60 text-sm tracking-[0.4em] uppercase mb-12"
          >
            No Excuses. Just Results.
          </motion.p>

          {/* Enter button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onEnter}
            className="group relative px-12 py-4 border border-red-500/60 text-white font-bebas text-2xl tracking-[0.3em] hover:bg-red-600/20 transition-all duration-300 cursor-pointer"
          >
            <span className="relative z-10">ENTER GYM</span>
            <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-all duration-300" />
          </motion.button>
        </motion.div>
      </div>

      <MusicPlayer />
    </div>
  )
}
