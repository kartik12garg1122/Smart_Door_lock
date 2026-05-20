import { useRef, useState } from 'react'
import ProductCard from './ProductCard'
import { ScrollBtn } from './DealsCarousel'

const KEEP_SHOPPING = [
  { id: 1, name: 'Logitech MX Master 3S Mouse', category: 'Peripherals', price: 79.99, originalPrice: 99.99, discount: 20, rating: 4.8, reviews: 44123, emoji: '🖱️', badge: 'Top Pick' },
  { id: 2, name: 'Keychron K2 Mechanical Keyboard', category: 'Keyboards', price: 89.99, originalPrice: 109.99, discount: 18, rating: 4.7, reviews: 22430, emoji: '⌨️' },
  { id: 3, name: 'LG 27" 4K UHD IPS Monitor', category: 'Monitors', price: 349.99, originalPrice: 499.99, discount: 30, rating: 4.6, reviews: 13210, emoji: '🖥️', badge: 'Deal' },
  { id: 4, name: 'Hydro Flask 32 oz Water Bottle', category: 'Kitchen', price: 34.95, originalPrice: 49.95, discount: 30, rating: 4.9, reviews: 89012, emoji: '🍶' },
  { id: 5, name: 'Bose QuietComfort 45 Headphones', category: 'Audio', price: 229.00, originalPrice: 329.00, discount: 30, rating: 4.7, reviews: 28330, emoji: '🎧', badge: 'Best Seller' },
  { id: 6, name: 'Tile Mate Bluetooth Tracker 4-Pack', category: 'Accessories', price: 59.99, originalPrice: 79.99, discount: 25, rating: 4.5, reviews: 61220, emoji: '📡' },
]

export default function KeepShoppingCarousel() {
  const ref = useRef(null)
  const [drag, setDrag] = useState({ active: false, startX: 0, scrollLeft: 0 })

  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 460, behavior: 'smooth' })
  const onDown = (e) => setDrag({ active: true, startX: e.pageX - ref.current.offsetLeft, scrollLeft: ref.current.scrollLeft })
  const onMove = (e) => {
    if (!drag.active) return
    e.preventDefault()
    ref.current.scrollLeft = drag.scrollLeft - (e.pageX - ref.current.offsetLeft - drag.startX)
  }

  return (
    <section style={{ margin: '28px 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: 'Orbitron, sans-serif' }}>
            Keep Shopping For
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#8899aa' }}>
            Based on your recent activity.
          </p>
        </div>
        <a href="#" style={{ fontSize: '13px', color: '#FF9900', fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
        >
          View all →
        </a>
      </div>
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
            display: 'flex', gap: '12px', overflowX: 'auto',
            paddingBottom: '12px', paddingTop: '4px',
            scrollbarWidth: 'none',
            cursor: drag.active ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
        >
          {KEEP_SHOPPING.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}
