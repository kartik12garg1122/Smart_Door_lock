import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'

const DEALS = [
  { id: 1, name: 'Sony WH-1000XM5 Wireless Headphones', category: 'Electronics', price: 249.99, originalPrice: 399.99, discount: 38, rating: 4.8, reviews: 31247, emoji: '🎧', badge: 'Best Seller' },
  { id: 2, name: 'Apple Watch Series 9 GPS 41mm', category: 'Wearables', price: 299.00, originalPrice: 429.00, discount: 30, rating: 4.9, reviews: 18824, emoji: '⌚', badge: "Amazon's Choice" },
  { id: 3, name: 'Samsung 55" QLED 4K Smart TV', category: 'TVs', price: 649.99, originalPrice: 999.99, discount: 35, rating: 4.7, reviews: 9601, emoji: '📺', badge: 'Deal' },
  { id: 4, name: 'Kindle Paperwhite (16 GB) 2024', category: 'E-readers', price: 109.99, originalPrice: 149.99, discount: 27, rating: 4.9, reviews: 54312, emoji: '📖', badge: 'Great Deal' },
  { id: 5, name: 'Anker 65W USB-C GaN Fast Charger', category: 'Accessories', price: 24.99, originalPrice: 45.99, discount: 46, rating: 4.8, reviews: 72100, emoji: '🔌', badge: 'Top Pick' },
  { id: 6, name: 'Instant Pot Duo 7-in-1 6 Quart', category: 'Kitchen', price: 79.95, originalPrice: 129.99, discount: 38, rating: 4.7, reviews: 120430, emoji: '🍲', badge: 'Best Seller' },
  { id: 7, name: 'Ninja Air Fryer Pro XL 5.5 Qt', category: 'Kitchen', price: 99.99, originalPrice: 159.99, discount: 38, rating: 4.6, reviews: 47812, emoji: '🍟', badge: 'Sale' },
  { id: 8, name: 'SanDisk 2TB Extreme Portable SSD', category: 'Storage', price: 139.99, originalPrice: 249.99, discount: 44, rating: 4.8, reviews: 28450, emoji: '💾', badge: 'Flash Deal' },
]

export default function DealsCarousel() {
  const ref = useRef(null)
  const [drag, setDrag] = useState({ active: false, startX: 0, scrollLeft: 0 })
  const [timeLeft] = useState({ h: '07', m: '42', s: '18' })

  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 460, behavior: 'smooth' })

  const onDown = (e) => setDrag({ active: true, startX: e.pageX - ref.current.offsetLeft, scrollLeft: ref.current.scrollLeft })
  const onMove = (e) => {
    if (!drag.active) return
    e.preventDefault()
    ref.current.scrollLeft = drag.scrollLeft - (e.pageX - ref.current.offsetLeft - drag.startX)
  }

  return (
    <section style={{ margin: '28px 0' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: 'Orbitron, sans-serif' }}>
            Deals of the Day
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#8899aa' }}>
            Curated deals updated daily across all categories.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Countdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#8899aa' }}>Ends in</span>
            {[timeLeft.h, timeLeft.m, timeLeft.s].map((v, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{
                  background: '#FF9900',
                  color: '#131921',
                  fontWeight: 800,
                  fontSize: '13px',
                  padding: '3px 7px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                }}>
                  {v}
                </span>
                {i < 2 && <span style={{ color: '#FF9900', fontWeight: 700 }}>:</span>}
              </span>
            ))}
          </div>
          <a href="#" style={{ fontSize: '13px', color: '#FF9900', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            See all deals →
          </a>
        </div>
      </div>

      {/* Carousel */}
      <div style={{ position: 'relative' }}>
        <ScrollBtn dir={-1} onClick={() => scroll(-1)} />
        <ScrollBtn dir={1} onClick={() => scroll(1)} />
        <div
          ref={ref}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={() => setDrag(d => ({ ...d, active: false }))}
          onMouseLeave={() => setDrag(d => ({ ...d, active: false }))}
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '12px',
            paddingTop: '4px',
            scrollbarWidth: 'none',
            cursor: drag.active ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
        >
          {DEALS.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}

export function ScrollBtn({ dir, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [dir === -1 ? 'left' : 'right']: '-18px',
        zIndex: 10,
        width: '40px',
        height: '40px',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '50%',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#131921',
        fontWeight: 700,
        transition: 'box-shadow 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,153,0,0.4)'; e.currentTarget.style.borderColor = '#FF9900' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = '#ddd' }}
    >
      {dir === -1 ? '‹' : '›'}
    </button>
  )
}
