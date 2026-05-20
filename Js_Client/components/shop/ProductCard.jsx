import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ProductCard({ product, index = 0 }) {
  const [wishlisted, setWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const savings = (product.originalPrice - product.price).toFixed(2)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2200)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{
        y: -4,
        boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
        transition: { duration: 0.2 },
      }}
      style={{
        width: '220px',
        flexShrink: 0,
        background: '#fff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        cursor: 'pointer',
        position: 'relative',
        border: '1px solid #e8e8e8',
      }}
    >
      {/* Discount badge */}
      {product.discount && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 2,
          background: '#CC0C39',
          color: '#fff',
          fontSize: '11px',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: '4px',
        }}>
          -{product.discount}%
        </div>
      )}

      {/* Wishlist */}
      <button
        onClick={() => setWishlisted(w => !w)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 2,
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid #ddd',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {wishlisted ? '❤️' : '🤍'}
      </button>

      {/* Image area */}
      <div style={{
        height: '180px',
        background: '#f7f8fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #f0f0f0',
      }}>
        <span style={{ fontSize: '72px' }}>{product.emoji}</span>
      </div>

      {/* Card body */}
      <div style={{ padding: '14px' }}>
        {/* Category */}
        <div style={{ fontSize: '11px', color: '#007185', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          {product.category}
        </div>

        {/* Name */}
        <h3 style={{
          margin: '0 0 8px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#0F1111',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.name}
        </h3>

        {/* Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '1px' }}>
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} style={{ fontSize: '12px', color: s <= Math.round(product.rating) ? '#FF9900' : '#d0d0d0' }}>★</span>
            ))}
          </div>
          <span style={{ fontSize: '12px', color: '#007185', fontWeight: 500 }}>
            {product.rating} ({product.reviews?.toLocaleString()})
          </span>
        </div>

        {/* Badge */}
        {product.badge && (
          <div style={{
            display: 'inline-block',
            marginBottom: '8px',
            padding: '2px 8px',
            background: '#232F3E',
            color: '#FF9900',
            fontSize: '10px',
            fontWeight: 700,
            borderRadius: '4px',
            letterSpacing: '0.4px',
          }}>
            {product.badge}
          </div>
        )}

        {/* Price */}
        <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#CC0C39', fontWeight: 600, verticalAlign: 'super', lineHeight: 1 }}>$</span>
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#0F1111', lineHeight: 1 }}>
            {Math.floor(product.price)}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F1111', alignSelf: 'flex-end' }}>
            .{(product.price % 1).toFixed(2).slice(2)}
          </span>
        </div>
        {product.originalPrice && (
          <div style={{ fontSize: '12px', color: '#565959', marginBottom: '4px' }}>
            List: <span style={{ textDecoration: 'line-through' }}>${product.originalPrice}</span>{' '}
            <span style={{ color: '#CC0C39', fontWeight: 600 }}>Save ${savings}</span>
          </div>
        )}

        {/* Delivery */}
        <div style={{ fontSize: '12px', color: '#007600', marginBottom: '12px', fontWeight: 500 }}>
          ✓ FREE Delivery Tomorrow
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAddToCart}
          style={{
            width: '100%',
            padding: '9px 0',
            background: addedToCart ? '#067D62' : '#FF9900',
            border: '1px solid',
            borderColor: addedToCart ? '#067D62' : '#FF8F00',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            color: addedToCart ? '#fff' : '#131921',
            transition: 'background 0.15s, border-color 0.15s',
            boxShadow: addedToCart ? 'none' : '0 2px 6px rgba(255,153,0,0.3)',
          }}
          onMouseEnter={e => { if (!addedToCart) e.currentTarget.style.background = '#FFA41C' }}
          onMouseLeave={e => { if (!addedToCart) e.currentTarget.style.background = '#FF9900' }}
        >
          {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  )
}
