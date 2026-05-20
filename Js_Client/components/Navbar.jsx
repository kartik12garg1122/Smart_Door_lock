import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Hardware', href: '#hardware' },
  { label: 'Workflow', href: '#demo' },
  { label: 'Stack', href: '#techstack' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('#hero')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = NAV_LINKS.map((l) => l.href.replace('#', ''))
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActive(`#${sections[i]}`)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Primary Nav Bar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(10, 14, 23, 0.95)' : 'rgba(10, 14, 23, 0.6)',
          backdropFilter: 'blur(20px) saturate(150%)',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
        }}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Top bar */}
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Shalimar Security"
              className="h-10 w-auto"
            />
            <div className="hidden sm:block">
              <span className="font-orbitron text-sm font-bold text-white tracking-wider">SHALIMAR</span>
              <span className="font-orbitron text-[10px] text-emerald-400/60 block -mt-1 tracking-[0.3em]">SECURITY</span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-[11px] font-medium tracking-wide uppercase transition-all duration-200 ${
                  active === link.href
                    ? 'text-emerald-400 bg-emerald-400/8'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 border border-emerald-500/30 text-emerald-400 hover:border-emerald-400/60 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]"
              style={{ fontFamily: "'Orbitron', monospace" }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System Login
            </button>

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-btn"
              className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="text-xs font-medium">{open ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-white/5"
              style={{ background: 'rgba(10, 14, 23, 0.98)' }}
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      active === link.href
                        ? 'text-emerald-400 bg-emerald-400/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <button
                  onClick={() => { navigate('/auth'); setOpen(false) }}
                  className="w-full mt-2 px-4 py-3 rounded-lg text-sm font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 text-center"
                >
                  System Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}
