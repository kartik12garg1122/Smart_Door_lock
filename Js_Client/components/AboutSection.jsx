import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const CARDS = [
  {
    icon: '🔐',
    title: 'THE PROBLEM',
    text: 'Traditional lock-and-key systems are vulnerable to theft, copying, and unauthorized duplication. They offer no audit trail and can be bypassed easily.',
    color: '#94a3b8',
  },
  {
    title: 'MISSION',
    text: 'To provide sophisticated biometric security solutions that are accessible, reliable, and easy to integrate into modern smart homes.',
    color: '#34d399',
    icon: '🎯'
  },
  {
    title: 'SECURITY',
    text: 'Our system prioritizes user privacy. Face data and verification logic are handled locally without relying on external cloud processing.',
    color: '#fb923c',
    icon: '🛡️'
  },
  {
    title: 'INNOVATION',
    text: 'By combining Python AI, React dashboards, and Arduino hardware, we bridge the gap between software intelligence and physical control.',
    color: '#94a3b8',
    icon: '💡'
  }
]

export default function AboutSection() {
  const [ref, inView] = useInView(0.1)
  return (
    <section id="about" className="section-base cyber-bg" ref={ref}>
      {/* Section title */}
      <motion.div
        className="text-center mb-16 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <div className="inline-block px-4 py-1.5 rounded-full glass mb-4 font-orbitron text-xs tracking-widest" style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}>
          ABOUT THE PROJECT
        </div>
        <h2 className="font-orbitron text-4xl font-bold mb-4">
          <span className="gradient-text">What is Smart Secure?</span>
        </h2>
        <p className="text-gray-300/60 text-lg leading-relaxed">
          Smart Secure is a Computer Science project that bridges the gap between software intelligence and physical hardware security — creating a frictionless, futuristic access control system.
        </p>
      </motion.div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mx-auto px-4">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            className="glass-card p-6"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            <div
              className="text-4xl mb-4 w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: `${card.color}15`, border: `1px solid ${card.color}44`, boxShadow: `0 0 20px ${card.color}22` }}
            >
              {card.icon}
            </div>
            <h3
              className="font-orbitron font-semibold text-lg mb-3"
              style={{ color: card.color, textShadow: `0 0 10px ${card.color}55` }}
            >
              {card.title}
            </h3>
            <p className="text-gray-300/60 leading-relaxed text-sm">{card.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
