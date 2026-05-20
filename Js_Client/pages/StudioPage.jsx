import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/studio.css'

/* ── Data ─────────────────────────────────────────────────── */
const FEATURES = [
  { id:1, tag:'AI POWERED', icon:'🧠', iconCls:'red',   title:'Face Recognition',  size:'main', desc:'FaceNet deep-learning embeddings with AES-256-GCM encrypted templates — no raw images stored. 99% recognition accuracy sub-second.', route:'/auth',     cta:'Try Face Scan' },
  { id:2, tag:'FALLBACK',   icon:'📱', iconCls:'blue',  title:'OTP via Email',     size:'wide', desc:'Unknown visitor? An OTP fires instantly to the homeowner\'s email. 4-digit code, full control, zero friction.',                        route:'/auth',     cta:'See Auth Flow' },
  { id:3, tag:'LOGGING',    icon:'📡', iconCls:'yellow', title:'Intruder Logging',  size:'sm',   desc:'Automatic snapshot + timestamp on every failed attempt.',                                                                               route:'/',         cta:'Dashboard'     },
  { id:4, tag:'HARDWARE',   icon:'⚙️', iconCls:'purple', title:'Hardware Control',  size:'sm',   desc:'Low-latency Arduino serial triggers solenoid lock in <1s.',                                                                            route:'/',         cta:'Explore'       },
  { id:5, tag:'PRIVACY',    icon:'🔒', iconCls:'green',  title:'Biometric Revoke',  size:'sm',   desc:'One-click permanent deletion of biometric data. GDPR-inspired.',                                                                        route:'/settings', cta:'Settings'      },
]

const HARDWARE = [
  { name:'Arduino Uno',    desc:'Microcontroller hub for all actuators.' },
  { name:'Relay Module',   desc:'5V relay switches the 12V solenoid safely.' },
  { name:'Solenoid Lock',  desc:'Electromagnetic lock — physically secures the door.' },
  { name:'SIM800L GSM',    desc:'GSM module — SMS OTP fallback to mobile.' },
  { name:'4×4 Keypad',     desc:'Manual OTP entry directly on the panel.' },
  { name:'I²C LCD 16×2',  desc:'System status and access messages.' },
]

const TECH = [
  { name:'React',   role:'Frontend UI'      },
  { name:'Python',  role:'Backend & AI'     },
  { name:'OpenCV',  role:'Computer Vision'  },
  { name:'Flask',   role:'REST API'         },
  { name:'Arduino', role:'Hardware Layer'   },
  { name:'FaceNet', role:'Deep Learning'    },
]

/* ── Custom Cursor ─────────────────────────────────────────── */
function Cursor() {
  const ref  = useRef(null)
  const pos  = useRef({ x:-100, y:-100 })
  const cur  = useRef({ x:-100, y:-100 })
  const raf  = useRef(null)
  const [hov, setHov] = useState(false)
  const lerp = (a,b,t) => a+(b-a)*t

  useEffect(() => {
    const mv = e => { pos.current = { x:e.clientX, y:e.clientY } }
    const ov = e => { if(e.target.closest('a,button')) setHov(true) }
    const ou = e => { if(e.target.closest('a,button')) setHov(false) }
    window.addEventListener('mousemove', mv)
    document.addEventListener('mouseover', ov)
    document.addEventListener('mouseout',  ou)
    const tick = () => {
      if(ref.current) {
        cur.current.x = lerp(cur.current.x, pos.current.x, 0.12)
        cur.current.y = lerp(cur.current.y, pos.current.y, 0.12)
        ref.current.style.left = `${cur.current.x}px`
        ref.current.style.top  = `${cur.current.y}px`
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', mv)
      document.removeEventListener('mouseover', ov)
      document.removeEventListener('mouseout',  ou)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return <div ref={ref} className={`studio-cursor${hov?' cursor-hover':''}`} aria-hidden />
}

/* ── Fade-up reveal hook ─────────────────────────────────── */
function useFade(threshold=0.1) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if(!el) return
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){setVis(true);obs.disconnect()} }, {threshold})
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, vis]
}

/* ── Nav ─────────────────────────────────────────────────── */
function Nav({ onMenu, navigate }) {
  return (
    <div className="rn-nav-wrap">
      <nav className="rn-nav">
        <a href="#hero" className="rn-nav-logo" id="rn-logo">
          <img src="/logo.png" alt="Shalimar Security" />
          <span className="rn-nav-brand">Shalimar Security</span>
        </a>
        <div className="rn-nav-links">
          <a onClick={() => navigate('/dashboard')} id="nav-dashboard" style={{cursor:'pointer'}}>Dashboard</a>
          <a href="#features" id="nav-features">System</a>
          <a href="#hardware" id="nav-hardware">Hardware</a>
          <a href="#stack"    id="nav-stack">Stack</a>
        </div>
        <div className="rn-nav-actions">
          <button className="rn-nav-login" id="nav-login-btn" onClick={() => navigate('/auth')}>
            Auth
          </button>
          <button className="rn-btn-access" id="nav-access-btn" onClick={() => navigate('/register')}>
            Register <span>→</span>
          </button>
          <button className="rn-btn-access" id="nav-menu-btn" onClick={onMenu} aria-label="Menu" style={{marginLeft:4}}>
            +
          </button>
        </div>
      </nav>
    </div>
  )
}

/* ── Menu Overlay ────────────────────────────────────────── */
function MenuOverlay({ open, onClose, navigate }) {
  const links = [
    { label:'System',    href:'#features' },
    { label:'Hardware',  href:'#hardware' },
    { label:'Stack',     href:'#stack'    },
    { label:'Auth →',    route:'/auth'    },
    { label:'Register →',route:'/register'},
    { label:'Settings →',route:'/settings'},
  ]
  return (
    <div className={`rn-menu-overlay${open?' open':''}`} role="dialog" aria-hidden={!open}>
      <button className="rn-menu-close" onClick={onClose} id="menu-close-btn">×</button>
      <ul className="rn-menu-links">
        {links.map((l,i) => (
          <li key={i}>
            {l.route
              ? <a href="#" id={`menu-${i}`} onClick={e=>{e.preventDefault();onClose();navigate(l.route)}}>{l.label}</a>
              : <a href={l.href} id={`menu-${i}`} onClick={onClose}>{l.label}</a>
            }
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Password Modal ──────────────────────────────────────── */
function PassModal({ onClose, navigate }) {
  const [pass, setPass] = useState('')
  const [err, setErr]   = useState(false)
  const login = () => {
    if(pass === 'admin123') {
      sessionStorage.setItem('resident_authenticated','true')
      onClose(); navigate('/register')
    } else { setErr(true); setPass('') }
  }
  return (
    <div className="rn-modal-backdrop" onClick={onClose} role="dialog" aria-modal>
      <div className="rn-modal" onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:36,marginBottom:4}}>🔐</div>
        <p className="rn-modal-title">Administrative Access</p>
        <p className="rn-modal-sub">Enter resident password to continue</p>
        <input
          autoFocus type="password" value={pass}
          placeholder="••••••••"
          onChange={e=>{setPass(e.target.value);setErr(false)}}
          onKeyDown={e=>e.key==='Enter'&&login()}
          className={`rn-modal-input${err?' error':''}`}
          id="modal-pass-input"
        />
        {err && <p className="rn-modal-error">Invalid credentials — try again</p>}
        <div className="rn-modal-actions">
          <button className="rn-modal-cancel" onClick={onClose} id="modal-cancel">Cancel</button>
          <button className="rn-modal-confirm" onClick={login} id="modal-verify">Verify →</button>
        </div>
      </div>
    </div>
  )
}

/* ── Hero ────────────────────────────────────────────────── */
function Hero({ navigate }) {
  const [modal, setModal] = useState(false)
  return (
    <section className="rn-hero" id="hero">
      {/* Live badge */}
      <div className="rn-badge">
        <span className="rn-badge-dot" />
        Biometric Security System v2.0 · Live
        <span style={{color:'var(--red)'}}>→</span>
      </div>

      <h1 className="font-manrope">
        <span style={{display:'block'}}>Shalimar</span>
        <span style={{display:'block'}}>
          Security for the{' '}
          <span className="red-word">
            Future
            <svg viewBox="0 0 100 10" preserveAspectRatio="none" fill="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </span>
        </span>
      </h1>

      <p className="rn-hero-sub">
        Face recognition · OTP fallback · Hardware lock control.<br/>
        Passwordless access — built on real AI, real hardware.
      </p>

      <div className="rn-hero-ctas">
        <button className="rn-btn-shiny" id="hero-scan-btn" onClick={() => navigate('/auth')}>
          Initiate Face Scan <span>→</span>
        </button>
        <button className="rn-btn-ghost" id="hero-register-btn" onClick={() => setModal(true)}>
          <span>👤</span> Resident Login
        </button>
      </div>

      {/* Stats strip */}
      <div className="rn-stats-strip">
        {[['99%','Recognition Accuracy'],['<1s','Unlock Speed'],['AES-256','Encryption'],['6','Hardware Components']].map(([v,l]) => (
          <div className="rn-stat" key={l}>
            <div className="rn-stat-val font-manrope">{v}</div>
            <div className="rn-stat-label">{l}</div>
          </div>
        ))}
      </div>

      {modal && <PassModal onClose={()=>setModal(false)} navigate={navigate} />}
    </section>
  )
}

/* ── Features Bento ──────────────────────────────────────── */
function FeaturesBento({ navigate }) {
  const [ref, vis] = useFade()
  const main = FEATURES[0]
  const wide = FEATURES[1]
  const smCards = FEATURES.slice(2)
  return (
    <section className="rn-section" id="features" ref={ref}>
      <div className="rn-section-inner">
        <h2 className={`rn-section-title rn-fade${vis?' visible':''}`}>
          The Access Control OS for<br/><span className="red">Modern Security</span>
        </h2>
        <p className={`rn-section-sub rn-fade${vis?' visible':''}`} style={{transitionDelay:'.1s'}}>
          Replace fragmented locks with one AI-driven, hardware-integrated system.
        </p>

        <div className="rn-bento">
          {/* Main card */}
          <div className="rn-card rn-card--main">
            <div className="rn-card-glow" />
            <div className="rn-card-tag">{main.tag}</div>
            <div className={`rn-card-icon ${main.iconCls}`}>{main.icon}</div>
            <h3 className="font-manrope">{main.title}</h3>
            <p style={{fontSize:'16px',marginTop:8}}>{main.desc}</p>
            <div style={{marginTop:'auto',paddingTop:32}}>
              <button
                className="rn-btn-shiny"
                style={{fontSize:13,padding:'10px 24px'}}
                id={`feature-btn-${main.id}`}
                onClick={() => navigate(main.route)}
              >
                {main.cta} →
              </button>
            </div>
          </div>

          {/* Wide card */}
          <div className="rn-card rn-card--wide">
            <div className="rn-card-glow" style={{background:'radial-gradient(circle at top right,#3b82f6,transparent 65%)'}}/>
            <div className="rn-card-tag" style={{borderColor:'rgba(96,165,250,.3)',background:'rgba(96,165,250,.08)',color:'#60a5fa'}}>{wide.tag}</div>
            <div className={`rn-card-icon ${wide.iconCls}`}>{wide.icon}</div>
            <h3 className="font-manrope">{wide.title}</h3>
            <p>{wide.desc}</p>
          </div>

          {/* Small cards */}
          {smCards.map(f => (
            <div key={f.id} className="rn-card" style={{gridColumn:'span 1'}}>
              <div className="rn-card-glow" />
              <div className="rn-card-tag">{f.tag}</div>
              <div className={`rn-card-icon ${f.iconCls}`}>{f.icon}</div>
              <h3 className="font-manrope sm">{f.title}</h3>
              <p className="sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Red Banner ──────────────────────────────────────────── */
function RedBanner() {
  return (
    <div className="rn-banner">
      <div className="rn-banner-stars">{'★★★★★'.split('').map((s,i)=><span key={i}>{s}</span>)}</div>
      <h3 className="font-manrope">
        "Shalimar Security eliminated our manual check-in entirely. The face scanner is eerily accurate — visitors are identified before they even knock."
      </h3>
      <div className="rn-banner-author">
        <div className="rn-banner-avatar"><span style={{color:'#fff',fontSize:20}}>👤</span></div>
        <div style={{textAlign:'left'}}>
          <div style={{fontWeight:700,color:'#000',fontSize:16}}>Prof. R. Sharma</div>
          <div style={{color:'rgba(0,0,0,.65)',fontWeight:500,fontSize:13}}>CS Department Head</div>
        </div>
      </div>
    </div>
  )
}

/* ── Hardware ────────────────────────────────────────────── */
function Hardware() {
  const [ref, vis] = useFade()
  return (
    <section className="rn-section" id="hardware" ref={ref}>
      <div className="rn-section-inner">
        <h2 className={`rn-section-title rn-fade${vis?' visible':''}`}>
          Physical <span className="red">Hardware</span> Layer
        </h2>
        <p className={`rn-section-sub rn-fade${vis?' visible':''}`} style={{transitionDelay:'.1s'}}>
          Six purpose-built components forming a real-world access control system — no simulation.
        </p>
        <div className={`rn-hw-grid rn-fade${vis?' visible':''}`} style={{transitionDelay:'.2s'}}>
          {HARDWARE.map((h,i) => (
            <div key={i} className="rn-hw-item">
              <span className="rn-hw-num">{String(i+1).padStart(2,'0')}</span>
              <div>
                <div className="rn-hw-name">{h.name}</div>
                <div className="rn-hw-desc">{h.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Tech Stack ──────────────────────────────────────────── */
function TechStack() {
  const [ref, vis] = useFade()
  return (
    <section className="rn-section" id="stack" ref={ref} style={{borderTop:'1px solid var(--border)'}}>
      <div className="rn-section-inner">
        <h2 className={`rn-section-title rn-fade${vis?' visible':''}`}>
          Technology <span className="red">Stack</span>
        </h2>
        <p className={`rn-section-sub rn-fade${vis?' visible':''}`} style={{transitionDelay:'.08s'}}>
          Python AI · React UI · Arduino Hardware · Flask API
        </p>
        <div className={`rn-tech-grid rn-fade${vis?' visible':''}`} style={{transitionDelay:'.16s'}}>
          {TECH.map((t,i) => (
            <div key={i} className="rn-tech-pill">
              <div>
                <div className="rn-tech-name font-manrope">{t.name}</div>
                <div className="rn-tech-role">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA Section ─────────────────────────────────────────── */
function CTASection({ navigate }) {
  const [ref, vis] = useFade()
  return (
    <section className="rn-cta-section" ref={ref}>
      <h2 className={`font-manrope rn-fade${vis?' visible':''}`}>
        Ready to <span className="red">Secure?</span>
      </h2>
      <p className={`rn-fade${vis?' visible':''}`} style={{transitionDelay:'.1s'}}>
        Start a face scan, register a resident, or review system settings.
      </p>
      <div className={`rn-cta-btns rn-fade${vis?' visible':''}`} style={{transitionDelay:'.2s'}}>
        <button className="rn-btn-shiny" id="cta-scan-btn" onClick={() => navigate('/auth')}>
          ⬡ Initiate Face Scan
        </button>
        <button className="rn-btn-ghost" id="cta-register-btn" onClick={() => navigate('/register')}>
          Register Resident
        </button>
        <button className="rn-btn-ghost" id="cta-dashboard-btn" onClick={() => navigate('/')}>
          Dashboard →
        </button>
      </div>
    </section>
  )
}

/* ── Footer ──────────────────────────────────────────────── */
function Footer({ navigate }) {
  return (
    <footer className="rn-footer">
      <div className="rn-footer-inner">
        <div className="rn-footer-grid">
          <div>
            <div className="rn-footer-logo">
              <img src="/logo.png" alt="Shalimar Security" />
              <span className="rn-footer-brand font-manrope">Shalimar Security</span>
            </div>
            <p className="rn-footer-bio">
              An automated door locking system — Python AI, React dashboard, and Arduino hardware for frictionless, passwordless access control.
            </p>
          </div>
          <div>
            <p className="rn-footer-col-title">System Access</p>
            <ul className="rn-footer-links">
              <li><a href="#" id="ft-auth" onClick={e=>{e.preventDefault();navigate('/auth')}}>Face Scan Auth →</a></li>
              <li><a href="#" id="ft-reg"  onClick={e=>{e.preventDefault();navigate('/register')}}>Register Resident →</a></li>
              <li><a href="#" id="ft-set"  onClick={e=>{e.preventDefault();navigate('/settings')}}>System Settings →</a></li>
              <li><a href="/"  id="ft-dash">Main Dashboard →</a></li>
            </ul>
          </div>
          <div>
            <p className="rn-footer-col-title">Technology</p>
            <ul className="rn-footer-links">
              {TECH.map((t,i) => <li key={i}><a href="#stack" id={`ft-tech-${i}`}>{t.name} — {t.role}</a></li>)}
            </ul>
          </div>
        </div>

        <div className="rn-footer-watermark">SHALIMAR</div>

        <div className="rn-footer-bottom">
          <p>© 2024 Shalimar Security · CS Capstone Project</p>
          <div className="rn-footer-socials">
            <a href="#" id="ft-s1">Face Recognition</a>
            <a href="#" id="ft-s2">OTP Auth</a>
            <a href="#" id="ft-s3">Arduino</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── Root ────────────────────────────────────────────────── */
export default function StudioPage() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.classList.add('studio-active')
    window.scrollTo(0,0)
    return () => document.body.classList.remove('studio-active')
  }, [])

  useEffect(() => {
    const k = e => { if(e.key==='Escape') setMenuOpen(false) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  return (
    <div className="rn-wrapper">
      {/* Backgrounds */}
      <div className="rn-bg">
        <div className="rn-bg-glow" />
        <div className="rn-bg-grid" />
        <div className="stars-1" />
        <div className="stars-2" />
      </div>
      <div className="rn-header-blur" />

      <Cursor />
      <MenuOverlay open={menuOpen} onClose={()=>setMenuOpen(false)} navigate={navigate} />
      <Nav onMenu={()=>setMenuOpen(true)} navigate={navigate} />

      <main style={{position:'relative',zIndex:10}}>
        <Hero navigate={navigate} />
        <FeaturesBento navigate={navigate} />
        <RedBanner />
        <Hardware />
        <TechStack />
        <CTASection navigate={navigate} />
      </main>

      <Footer navigate={navigate} />
    </div>
  )
}
