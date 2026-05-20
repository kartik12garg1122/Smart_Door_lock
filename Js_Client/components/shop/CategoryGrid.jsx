import { motion } from 'framer-motion'

const CATEGORIES = [
  { id: 1, name: 'Electronics', sub: 'Phones, TVs, Cameras', emoji: '💻', count: '500K+' },
  { id: 2, name: 'Fashion', sub: 'Men, Women, Kids', emoji: '👗', count: '300K+' },
  { id: 3, name: 'Home & Garden', sub: 'Furniture, Décor, Tools', emoji: '🏠', count: '200K+' },
  { id: 4, name: 'Sports', sub: 'Gym, Outdoors, Yoga', emoji: '⚽', count: '150K+' },
  { id: 5, name: 'Beauty', sub: 'Skincare, Haircare, Makeup', emoji: '💄', count: '180K+' },
  { id: 6, name: 'Books', sub: 'Fiction, Non-fiction, Textbooks', emoji: '📚', count: '100K+' },
  { id: 7, name: 'Automotive', sub: 'Parts, Accessories, Tools', emoji: '🚗', count: '90K+' },
  { id: 8, name: 'Toys & Games', sub: 'Kids, Board Games, LEGO', emoji: '🧸', count: '120K+' },
  { id: 9, name: 'Health & Wellness', sub: 'Supplements, Medical, Fitness', emoji: '💊', count: '80K+' },
  { id: 10, name: 'Grocery', sub: 'Fresh, Pantry, Beverages', emoji: '🛒', count: '60K+' },
  { id: 11, name: 'Pet Supplies', sub: 'Food, Accessories, Grooming', emoji: '🐾', count: '45K+' },
  { id: 12, name: 'Smart Home', sub: 'Alexa, Lights, Security', emoji: '🏡', count: '35K+' },
]

export default function CategoryGrid() {
  return (
    <section style={{ margin: '28px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: 'Orbitron, sans-serif' }}>
          Shop by Category
        </h2>
        <a href="#" style={{ fontSize: '13px', color: '#FF9900', fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
        >
          Browse all categories →
        </a>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
      }}>
        {CATEGORIES.map((cat, i) => (
          <motion.a
            key={cat.id}
            href="#"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            style={{
              display: 'block',
              background: '#1e2835',
              border: '1px solid #2a3545',
              borderRadius: '8px',
              padding: '20px 16px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#FF9900'
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,153,0,0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#2a3545'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            {/* Orange accent top bar */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '3px',
              background: '#FF9900',
              opacity: 0.6,
              borderRadius: '8px 8px 0 0',
            }} />

            <div style={{ fontSize: '36px', marginBottom: '10px' }}>{cat.emoji}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{cat.name}</div>
            <div style={{ fontSize: '12px', color: '#8899aa', lineHeight: 1.4, marginBottom: '10px' }}>{cat.sub}</div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              background: 'rgba(255,153,0,0.12)',
              border: '1px solid rgba(255,153,0,0.25)',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#FF9900',
              fontWeight: 600,
            }}>
              {cat.count} items
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}
