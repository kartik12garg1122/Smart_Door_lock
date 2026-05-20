import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const CATEGORIES = [
  'Electronics', 'Computers', 'Smart Home', 'Fashion', 'Beauty',
  'Grocery', 'Home & Garden', 'Sports & Outdoors', 'Automotive',
  'Toys & Games', 'Books', 'Music & Movies',
]

const NAV_LINKS = [
  "Today's Deals",
  'Customer Service',
  'Registry',
  'Gift Cards',
  'Sell',
  'New Arrivals',
  'Prime',
]

export default function ShopNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [cartCount] = useState(3)
  const [searchFocus, setSearchFocus] = useState(false)
  const megaRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-300"
      style={{
        boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      {/* ── Top Strip ── */}
      <div style={{ background: '#131921' }}>
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Logo */}
          <Link
            to="/shop"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid transparent',
              transition: 'border-color 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF9900')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
          >
            <span
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 900,
                fontSize: '22px',
                color: '#fff',
                letterSpacing: '-0.5px',
              }}
            >
              orbit
            </span>
            <span
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 900,
                fontSize: '22px',
                color: '#FF9900',
              }}
            >
              nova
            </span>
            <span style={{ fontSize: '9px', color: '#aaa', marginTop: '8px', marginLeft: '2px' }}>.com</span>
          </Link>

          {/* Deliver to */}
          <div
            style={{
              flexShrink: 0,
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid transparent',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF9900')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
          >
            <div style={{ fontSize: '11px', color: '#ccc', lineHeight: 1 }}>📍 Deliver to</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>United States</div>
          </div>

          {/* Search bar */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              borderRadius: '8px',
              overflow: 'hidden',
              border: `2px solid ${searchFocus ? '#FF9900' : 'transparent'}`,
              transition: 'border-color 0.2s',
              boxShadow: searchFocus ? '0 0 0 2px rgba(255,153,0,0.25)' : 'none',
            }}
          >
            <select
              style={{
                background: '#f3f3f3',
                border: 'none',
                padding: '0 8px',
                fontSize: '12px',
                color: '#333',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option>All</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              type="text"
              placeholder="Search ObitNova"
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              style={{
                flex: 1,
                border: 'none',
                padding: '10px 14px',
                fontSize: '14px',
                background: '#fff',
                outline: 'none',
                color: '#131921',
              }}
            />
            <button
              style={{
                background: '#FF9900',
                border: 'none',
                padding: '0 16px',
                cursor: 'pointer',
                fontSize: '18px',
                transition: 'background 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FFA41C')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FF9900')}
            >
              🔍
            </button>
          </div>

          {/* Account */}
          <div
            ref={megaRef}
            style={{ position: 'relative', flexShrink: 0 }}
            onClick={() => setProfileOpen(p => !p)}
          >
            <div
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid transparent',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF9900')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
            >
              <div style={{ fontSize: '11px', color: '#ccc' }}>Hello, sign in</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Account & Lists ▾</div>
            </div>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '200px',
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    zIndex: 100,
                  }}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
                    <button
                      style={{
                        width: '100%',
                        padding: '8px 0',
                        background: '#FF9900',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                        color: '#131921',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FFA41C')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#FF9900')}
                    >
                      Sign In
                    </button>
                    <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#555', textAlign: 'center' }}>
                      New customer? <a href="#" style={{ color: '#007185', textDecoration: 'none' }}>Start here</a>
                    </p>
                  </div>
                  {['Your Account', 'Your Orders', 'Your Wishlist', 'Recommendations'].map(item => (
                    <a
                      key={item}
                      href="#"
                      style={{
                        display: 'block',
                        padding: '10px 16px',
                        fontSize: '13px',
                        color: '#131921',
                        textDecoration: 'none',
                        borderBottom: '1px solid #f5f5f5',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f7f7f7')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {item}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Returns */}
          <div
            style={{
              flexShrink: 0,
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid transparent',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF9900')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
          >
            <div style={{ fontSize: '11px', color: '#ccc' }}>Returns</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>& Orders</div>
          </div>

          {/* Cart */}
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid transparent',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF9900')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
          >
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: '28px', lineHeight: 1 }}>🛒</span>
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  background: '#FF9900',
                  color: '#131921',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 900,
                }}
              >
                {cartCount}
              </span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '10px' }}>Cart</span>
          </div>
        </div>
      </div>

      {/* ── Sub-nav ── */}
      <div style={{ background: '#232F3E' }}>
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0',
            overflowX: 'auto',
          }}
        >
          {/* All button */}
          <div
            ref={megaRef}
            style={{ position: 'relative' }}
          >
            <button
              onClick={() => setMegaOpen(m => !m)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: megaOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: megaOpen ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!megaOpen) e.currentTarget.style.border = '1px solid rgba(255,255,255,0.3)' }}
              onMouseLeave={e => { if (!megaOpen) e.currentTarget.style.border = '1px solid transparent' }}
            >
              ☰ All
            </button>
            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    width: '240px',
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    zIndex: 100,
                    overflow: 'hidden',
                  }}
                >
                  {CATEGORIES.map((cat, i) => (
                    <a
                      key={cat}
                      href="#"
                      style={{
                        display: 'block',
                        padding: '10px 18px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#131921',
                        textDecoration: 'none',
                        borderBottom: i < CATEGORIES.length - 1 ? '1px solid #f0f0f0' : 'none',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fef9f0')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {cat}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {NAV_LINKS.map(link => (
            <a
              key={link}
              href="#"
              style={{
                padding: '8px 14px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                borderRadius: '4px',
                border: '1px solid transparent',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
            >
              {link === 'Prime' ? <span style={{ color: '#00A8E1', fontWeight: 700 }}>prime</span> : link}
            </a>
          ))}
        </div>
      </div>
    </header>
  )
}
