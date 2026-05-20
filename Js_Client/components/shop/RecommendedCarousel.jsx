import { useRef, useState } from 'react'
import ProductCard from './ProductCard'
import { ScrollBtn } from './DealsCarousel'

const RECOMMENDED = [
  { id: 1, name: 'Philips Hue Starter Kit 4 Bulbs', category: 'Smart Home', price: 149.99, originalPrice: 199.99, discount: 25, rating: 4.7, reviews: 35820, emoji: '💡', badge: "Amazon's Choice" },
  { id: 2, name: 'Nespresso Vertuo Next Coffee Maker', category: 'Kitchen', price: 119.00, originalPrice: 179.00, discount: 34, rating: 4.8, reviews: 27441, emoji: '☕', badge: 'Best Seller' },
  { id: 3, name: 'Fitbit Charge 6 Activity Tracker', category: 'Fitness', price: 139.95, originalPrice: 179.95, discount: 22, rating: 4.5, reviews: 19330, emoji: '🏃', badge: 'Deal' },
  { id: 4, name: 'Ring Video Doorbell 4', category: 'Smart Home', price: 149.99, originalPrice: 219.99, discount: 32, rating: 4.6, reviews: 42110, emoji: '🔔' },
  { id: 5, name: 'Echo Dot (5th Gen) Smart Speaker', category: 'Smart Speakers', price: 34.99, originalPrice: 54.99, discount: 36, rating: 4.8, reviews: 201340, emoji: '🔊', badge: 'Top Seller' },
  { id: 6, name: 'LEGO Technic Bugatti Chiron Set', category: 'Toys', price: 259.99, originalPrice: 349.99, discount: 26, rating: 4.9, reviews: 12890, emoji: '🧱' },
  { id: 7, name: 'Vitamix 5200 Blender Pro', category: 'Kitchen', price: 349.95, originalPrice: 549.95, discount: 36, rating: 4.9, reviews: 8720, emoji: '🥤', badge: 'Pro Pick' },
  { id: 8, name: 'Greenworks 40V Cordless Mower', category: 'Garden', price: 269.99, originalPrice: 399.99, discount: 33, rating: 4.6, reviews: 6130, emoji: '🌿' },
]

export default function RecommendedCarousel() {
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
    <section style={{ margin: '28px 0 40px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: 'Orbitron, sans-serif' }}>
            Recommended for You
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#8899aa' }}>
            Handpicked based on what customers love.
          </p>
        </div>
        <a href="#" style={{ fontSize: '13px', color: '#FF9900', fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
        >
          See all →
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
          {RECOMMENDED.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}
