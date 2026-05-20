import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDES = [
  {
    id: 0,
    badge: "Today's Big Deal",
    headline: 'Shop Smarter.',
    headlineAccent: 'Save Bigger.',
    sub: 'Millions of products. Unbeatable prices. Fast delivery right to your door.',
    ctaPrimary: 'Shop Now',
    ctaSecondary: "See Today's Deals",
    tag: 'UP TO 60% OFF',
    bg: 'linear-gradient(120deg, #131921 0%, #1a2332 50%, #131921 100%)',
    accent: '#FF9900',
    icon: '🚀',
    stats: [{ v: '300M+', l: 'Products' }, { v: '50K+', l: 'Brands' }, { v: '1-Day', l: 'Delivery' }],
  },
  {
    id: 1,
    badge: 'Electronics Sale',
    headline: 'Tech at Your',
    headlineAccent: 'Fingertips.',
    sub: 'Latest gadgets, laptops, smartphones, and more — all in one place.',
    ctaPrimary: 'Explore Electronics',
    ctaSecondary: 'New Arrivals',
    tag: 'LOWEST PRICES',
    bg: 'linear-gradient(120deg, #0f1923 0%, #1b2a3a 50%, #0f1923 100%)',
    accent: '#FF9900',
    icon: '💻',
    stats: [{ v: '500K+', l: 'Gadgets' }, { v: '1,200+', l: 'Brands' }, { v: '60%', l: 'Off Top Picks' }],
  },
  {
    id: 2,
    badge: 'Fashion Week',
    headline: 'Style for',
    headlineAccent: 'Every Season.',
    sub: "Top fashion brands at prices that won't break the bank. Delivered fast.",
    ctaPrimary: 'Shop Fashion',
    ctaSecondary: 'New Season Picks',
    tag: 'FREE RETURNS',
    bg: 'linear-gradient(120deg, #14121f 0%, #1f1932 50%, #14121f 100%)',
    accent: '#FF9900',
    icon: '👗',
    stats: [{ v: '200K+', l: 'Styles' }, { v: '5K+', l: 'Designers' }, { v: 'Free', l: 'Returns' }],
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 6000)
    return () => clearInterval(t)
  }, [])

  const slide = SLIDES[current]

  return (
    <section style={{ position: 'relative', overflow: 'hidden', minHeight: '480px', background: slide.bg, transition: 'background 0.6s' }}>
      {/* Subtle gradient overlay on edges */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to right, rgba(19,25,33,0.6) 0%, transparent 40%, transparent 60%, rgba(19,25,33,0.6) 100%)',
      }} />

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '64px 32px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '48px', alignItems: 'center' }}>

        {/* Left: content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current + '-left'}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Badge */}
            <span style={{
              display: 'inline-block',
              padding: '5px 14px',
              background: '#FF9900',
              color: '#131921',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              borderRadius: '4px',
              width: 'fit-content',
            }}>
              {slide.badge}
            </span>

            {/* Headline */}
            <h1 style={{ margin: 0, fontSize: '52px', fontWeight: 900, lineHeight: 1.08, fontFamily: 'Orbitron, sans-serif', color: '#fff' }}>
              {slide.headline}{' '}
              <span style={{ color: '#FF9900' }}>{slide.headlineAccent}</span>
            </h1>

            <p style={{ margin: 0, fontSize: '16px', color: '#b0b8c4', lineHeight: 1.65, maxWidth: '520px' }}>
              {slide.sub}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 6px 24px rgba(255,153,0,0.45)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '13px 30px',
                  background: '#FF9900',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#131921',
                  boxShadow: '0 4px 16px rgba(255,153,0,0.3)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FFA41C')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FF9900')}
              >
                {slide.ctaPrimary}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '13px 30px',
                  background: 'transparent',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF9900'; e.currentTarget.style.background = 'rgba(255,153,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent' }}
              >
                {slide.ctaSecondary}
              </motion.button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px', paddingTop: '8px' }}>
              {slide.stats.map(s => (
                <div key={s.l}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#FF9900', fontFamily: 'Orbitron, sans-serif' }}>{s.v}</div>
                  <div style={{ fontSize: '12px', color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right: visual card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current + '-right'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div style={{
              background: '#1e2835',
              border: '1px solid rgba(255,153,0,0.25)',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,153,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Tag ribbon */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '-30px',
                background: '#FF9900',
                color: '#131921',
                fontSize: '11px',
                fontWeight: 800,
                padding: '5px 40px',
                transform: 'rotate(45deg)',
                letterSpacing: '0.5px',
              }}>
                {slide.tag}
              </div>

              <div style={{ fontSize: '96px', marginBottom: '16px', display: 'block' }}>{slide.icon}</div>
              <div style={{ fontSize: '14px', color: '#8899aa', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>Featured Deal</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>Best value picks</div>
              <div style={{
                display: 'inline-block',
                padding: '10px 28px',
                background: '#FF9900',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#131921',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255,153,0,0.3)',
              }}>
                Shop This Deal →
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide dots */}
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              borderRadius: '4px',
              background: i === current ? '#FF9900' : 'rgba(255,255,255,0.25)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
              padding: 0,
            }}
          />
        ))}
      </div>
    </section>
  )
}
