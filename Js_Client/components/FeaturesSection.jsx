import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const FEATURES = [
  {
    icon: '👤',
    title: 'Face Recognition',
    desc: 'FaceNet deep-learning embeddings with AES-256-GCM encrypted templates — no raw images stored.',
    color: '#34d399',
    tag: 'AI POWERED'
  },
  {
    icon: '📱',
    title: 'OTP Fallback',
    desc: 'Automatic email OTP triggered for unknown visitors. 4-digit code sent to the homeowner instantly.',
    color: '#fb923c',
    tag: 'FALLBACK'
  },
  {
    icon: '⚙️',
    title: 'Serial Control',
    desc: 'Low-latency Arduino serial link for physical solenoid lock and relay triggering.',
    color: '#34d399',
    tag: 'HARDWARE'
  },
  {
    icon: '📊',
    title: 'Intruder Logs',
    desc: 'Automatic intruder snapshots saved with timestamps. Full audit trail in the dashboard.',
    color: '#94a3b8',
    tag: 'LOGGING'
  },
  {
    icon: '🔒',
    title: 'Biometric Revoke',
    desc: 'One-click permanent deletion of biometric data. GDPR-inspired explicit consent & revocation.',
    color: '#fb923c',
    tag: 'PRIVACY'
  },
]

export default function FeaturesSection() {
  const [ref, inView] = useInView(0.1)
  return (
    <section id="features" className="section-base" ref={ref} style={{ background: 'linear-gradient(180deg, #0d1321 0%, #0a0e17 50%, #0d1321 100%)' }}>
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <div className="inline-block px-4 py-1.5 rounded-full glass mb-4 font-orbitron text-xs tracking-widest" style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}>
          SYSTEM CAPABILITIES
        </div>
        <h2 className="font-orbitron text-4xl font-bold gradient-text">Key Features</h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mx-auto px-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            className="glass-card p-6 relative overflow-hidden group"
            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40, y: 20 }}
            animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.12 }}
          >
            {/* Glow accent */}
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle, ${f.color}22 0%, transparent 70%)` }}
            />
            {/* Tag */}
            <div className="mb-4 flex items-center justify-between">
              <div
                className="text-3xl w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${f.color}15`, border: `1px solid ${f.color}44` }}
              >
                {f.icon}
              </div>
              <span
                className="font-orbitron text-xs px-2 py-1 rounded"
                style={{ color: f.color, background: `${f.color}15`, border: `1px solid ${f.color}33` }}
              >
                {f.tag}
              </span>
            </div>
            <h3
              className="font-orbitron font-semibold text-base mb-2"
              style={{ color: f.color }}
            >
              {f.title}
            </h3>
            <p className="text-gray-300/55 text-sm leading-relaxed">{f.desc}</p>
            {/* Bottom accent line */}
            <div
              className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
              style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }}
            />
          </motion.div>
        ))}

        {/* CTA card */}
        <motion.div
          className="glass-card p-6 flex flex-col items-center justify-center text-center"
          style={{ border: '1px dashed rgba(255, 255, 255,0.2)' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="text-4xl mb-3 float-anim">🚀</div>
          <h3 className="font-orbitron text-base font-semibold text-white mb-2">And More</h3>
          <p className="text-gray-300/50 text-xs">Expandable with fingerprint, NFC, and cloud sync modules.</p>
        </motion.div>
      </div>
    </section>
  )
}
