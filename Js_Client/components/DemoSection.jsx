import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { useState, useEffect } from 'react'

// Biometric face scan demo animation
function FaceScanDemo() {
  const [phase, setPhase] = useState(0)
  const phases = ['DETECTING FACE...', 'MAPPING LANDMARKS...', 'CROSS-REFERENCING...', 'IDENTITY CONFIRMED ✓']
  const colors = ['#ffffff', '#8b5cf6', '#ffa500', '#00ff88']

  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % phases.length), 1800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="glass-card p-6 text-center flex flex-col items-center gap-4">
      <div className="font-orbitron text-xs text-gray-400/60 tracking-widest mb-2">FACE RECOGNITION</div>
      {/* Face outline with scan */}
      <div
        className="relative rounded-full overflow-hidden flex items-center justify-center"
        style={{ width: 150, height: 150, border: `2px solid ${colors[phase]}`, boxShadow: `0 0 20px ${colors[phase]}44`, transition: 'all 0.4s ease' }}
      >
        {/* Scan line */}
        <div className="scan-line" />
        {/* Face emoji placeholder */}
        <div style={{ fontSize: 72, filter: 'grayscale(0.3)' }}>🧑</div>
        {/* Corner brackets */}
        {[['top-2 left-2', '2px 0 0 0', '0 2px 0 0'], ['top-2 right-2', '2px 0 0 0', '0 0 0 2px'], ['bottom-2 left-2', '0 0 2px 0', '0 2px 0 0'], ['bottom-2 right-2', '0 0 2px 0', '0 0 0 2px']].map(([pos, bt, bl], i) => (
          <div key={i} className={`absolute ${pos} w-5 h-5`} style={{ borderTop: bt, borderLeft: bl, borderRight: bl === '0 2px 0 0' ? undefined : undefined, borderColor: colors[phase] }} />
        ))}
      </div>
      {/* Facial landmark dots */}
      {phase >= 1 && (
        <div className="flex gap-2 flex-wrap justify-center">
          {['👁 L-Eye', '👁 R-Eye', '👃 Nose', '👄 Mouth', '⬦ Jaw'].map((pt) => (
            <motion.span
              key={pt}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-orbitron px-2 py-0.5 rounded"
              style={{ background: '#ffffff11', border: '1px solid #ffffff33', color: '#ffffff' }}
            >
              {pt}
            </motion.span>
          ))}
        </div>
      )}
      <motion.div
        key={phase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-orbitron text-xs font-semibold"
        style={{ color: colors[phase] }}
      >
        {phases[phase]}
      </motion.div>
    </div>
  )
}

// Door unlock animation
function DoorUnlockDemo() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setOpen((o) => !o), 3000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="glass-card p-6 text-center flex flex-col items-center gap-4">
      <div className="font-orbitron text-xs text-gray-400/60 tracking-widest mb-2">DOOR CONTROL</div>
      <div className="relative" style={{ width: 120, height: 160 }}>
        {/* Door frame */}
        <div className="absolute inset-0 rounded-t-xl" style={{ border: '2px solid #ffffff44' }} />
        {/* Door panel */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-t-xl"
          style={{ background: 'linear-gradient(135deg, #141414, #0a0a0a)', border: '2px solid #ffffff', originX: 0 }}
          animate={{ rotateY: open ? -70 : 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Lock icon */}
          <div
            className="absolute top-1/2 right-3 -translate-y-1/2 text-2xl transition-all duration-500"
            style={{ filter: open ? 'drop-shadow(0 0 8px #00ff88)' : 'drop-shadow(0 0 8px #ff006e)' }}
          >
            {open ? '🔓' : '🔒'}
          </div>
        </motion.div>
      </div>
      <div
        className="font-orbitron text-sm font-bold"
        style={{ color: open ? '#00ff88' : '#ffa500' }}
      >
        {open ? 'DOOR UNLOCKED' : 'DOOR LOCKED'}
      </div>
      <div className="text-xs text-gray-300/40">Via Arduino Serial Command</div>
    </div>
  )
}

// System status demo
function SystemStatusDemo() {
  const logs = [
    { time: '23:09:42', msg: 'Camera feed initialized', color: '#ffffff' },
    { time: '23:09:43', msg: 'Face detected in frame', color: '#ffffff' },
    { time: '23:09:43', msg: 'Running LBPH recognizer...', color: '#ffa500' },
    { time: '23:09:44', msg: 'Match: Authorized Resident (92%)', color: '#00ff88' },
    { time: '23:09:44', msg: 'Sending UNLOCK via serial', color: '#ffffff' },
    { time: '23:09:44', msg: 'Door UNLOCKED ✓', color: '#00ff88' },
  ]
  return (
    <div className="glass-card p-5 text-left">
      <div className="font-orbitron text-xs text-gray-400/60 tracking-widest mb-4">SYSTEM LOG</div>
      <div className="space-y-2">
        {logs.map((log, i) => (
          <motion.div
            key={i}
            className="flex gap-3 items-start"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.3 + 0.5 }}
          >
            <span className="font-orbitron text-xs text-gray-400/30 shrink-0">{log.time}</span>
            <span className="font-orbitron text-xs" style={{ color: log.color }}>▶ {log.msg}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function DemoSection() {
  const [ref, inView] = useInView(0.1)
  return (
    <section id="demo" className="section-base cyber-bg" ref={ref}>
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <div className="inline-block px-4 py-1.5 rounded-full glass mb-4 font-orbitron text-xs tracking-widest" style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}>
          SYSTEM WORKFLOW
        </div>
        <h2 className="font-orbitron text-4xl font-bold gradient-text">System Process Visualization</h2>
        <p className="text-gray-300/50 mt-4 max-w-xl mx-auto text-sm">
          Real-time visualization of the face recognition and physical door unlock pipeline.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mx-auto px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <FaceScanDemo />
        <DoorUnlockDemo />
        <SystemStatusDemo />
      </motion.div>
    </section>
  )
}
