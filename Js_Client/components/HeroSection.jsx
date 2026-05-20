import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HeroSection() {
  const navigate = useNavigate()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const [showPassModal, setShowPassModal] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [passError, setPassError] = useState(false)

  const handleLogin = () => {
    if (passInput === 'admin123') {
      sessionStorage.setItem('resident_authenticated', 'true')
      setShowPassModal(false)
      navigate('/register')
    } else {
      setPassError(true)
      setPassInput('')
    }
  }

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0e17 0%, #0d1321 50%, #0a0e17 100%)' }}
    >
      {/* Ambient glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #fb923c, transparent 70%)' }} />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* Parallax content */}
      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-10"
          style={{ background: 'rgba(52, 211, 153, 0.06)', border: '1px solid rgba(52, 211, 153, 0.15)' }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 8px rgba(52, 211, 153, 0.5)' }} />
          <span className="text-xs font-medium text-emerald-400/80 tracking-widest uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
            Biometric Security System v2.0
          </span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          className="font-orbitron mb-6 leading-none"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="gradient-text block font-black" style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', lineHeight: 1.1 }}>
            SHALIMAR
          </span>
          <span className="gradient-text block font-black" style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', lineHeight: 1.1 }}>
            SECURITY
          </span>
          <span
            className="text-slate-400/60 block mt-4"
            style={{ fontSize: 'clamp(0.75rem, 1.8vw, 1.25rem)', fontWeight: 400, letterSpacing: '0.4em', fontFamily: "'Inter', sans-serif" }}
          >
            AUTOMATED DOOR LOCKING SYSTEM
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          A next-generation biometric security system combining{' '}
          <span className="text-white font-medium">face recognition</span> and{' '}
          <span className="text-orange-400 font-medium">OTP verification</span> for seamless, passwordless door access control.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.button
            id="initiate-scan-btn"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/auth')}
            className="btn-cyber pulse-glow"
            style={{ padding: '1rem 2.5rem', fontSize: '0.8rem' }}
          >
            <span>⬡</span> INITIATE SCAN
          </motion.button>
          
          <motion.button
            id="resident-login-btn"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPassModal(true)}
            className="btn-cyber"
            style={{ borderColor: '#fb923c', color: '#fb923c', padding: '1rem 2.5rem', fontSize: '0.8rem', background: 'rgba(251, 146, 60, 0.06)' }}
          >
            <span>👤</span> RESIDENT LOGIN
          </motion.button>
        </motion.div>

        {/* Password Modal */}
        <AnimatePresence>
          {showPassModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(12px)' }}
              onClick={() => setShowPassModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="glass-card p-8 w-full max-w-sm relative"
                onClick={(e) => e.stopPropagation()}
                style={{ borderColor: passError ? '#ef4444' : 'rgba(251,146,60,0.2)' }}
              >
                <div className="mb-6 text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.2)' }}>
                    <span className="text-2xl">🔐</span>
                  </div>
                  <h3 className="font-orbitron text-lg font-bold text-white mb-1">Administrative Access</h3>
                  <p className="text-xs text-slate-500">Enter resident password to continue</p>
                </div>

                <div className="space-y-4">
                  <input
                    autoFocus
                    type="password"
                    placeholder="••••••••"
                    value={passInput}
                    onChange={(e) => {
                      setPassInput(e.target.value)
                      setPassError(false)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white text-center tracking-[0.5em] focus:outline-none transition-all"
                  />
                  
                  {passError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400 text-center font-medium"
                    >
                      Invalid Credentials
                    </motion.p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowPassModal(false)}
                      className="flex-1 py-3 rounded-xl text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white hover:bg-white/5 transition-all border border-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogin}
                      className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                      style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', color: '#000', border: 'none' }}
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats row */}
        <motion.div
          className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {[
            { val: '99%', label: 'Accuracy' },
            { val: '<1s', label: 'Unlock Time' },
            { val: '256-bit', label: 'Encryption' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="font-orbitron text-2xl font-bold text-white">{val}</div>
              <div className="text-[10px] text-slate-500 tracking-[0.2em] mt-1.5 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="text-[10px] text-slate-500 tracking-[0.3em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>Scroll</div>
        <div className="w-px h-10 bg-gradient-to-b from-slate-500/40 to-transparent" />
      </motion.div>
    </section>
  )
}
