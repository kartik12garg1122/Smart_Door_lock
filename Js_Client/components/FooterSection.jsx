import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { useNavigate } from 'react-router-dom'

const FOOTER_LINKS = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#features', label: 'Features' },
  { href: '#architecture', label: 'Architecture' },
  { href: '#hardware', label: 'Hardware' },
  { href: '#demo', label: 'Workflow' },
  { href: '#techstack', label: 'Stack' },
]

export default function FooterSection() {
  const navigate = useNavigate()
  const [ref, inView] = useInView(0.2)
  const year = new Date().getFullYear()

  return (
    <footer
      id="footer"
      ref={ref}
      className="relative py-16 px-6"
      style={{
        background: 'linear-gradient(180deg, #0a0e17, #060a12)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Top row */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
              <div className="w-5 h-5 rounded border-2 border-emerald-400/50" />
            </div>
            <div>
              <div className="font-orbitron text-base font-bold gradient-text">SHALIMAR SECURITY</div>
              <div className="text-[10px] text-slate-600 tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>
                Automated Door Locking System
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/auth')}
            className="btn-cyber"
            style={{ padding: '0.65rem 1.75rem', fontSize: '0.7rem' }}
          >
            <span>⬡</span> Access System
          </button>
        </motion.div>

        {/* Section divider */}
        <div className="section-divider mb-8" />

        {/* Nav links */}
        <motion.div
          className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          {FOOTER_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {label}
            </a>
          ))}
        </motion.div>

        {/* Bottom row */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <p className="text-[11px] text-slate-600" style={{ fontFamily: "'Inter', sans-serif" }}>
            © {year} Shalimar Security. Built for IP Project II.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 animate-pulse" />
            <span className="text-[10px] text-slate-600 tracking-widest font-orbitron">SYSTEM ACTIVE</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
