import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const STACK = [
  { icon: '⚛️', name: 'React', desc: 'Frontend UI library', color: '#ffffff' },
  { icon: '🐍', name: 'Python', desc: 'Backend & AI logic', color: '#00ff88' },
  { icon: '👁️', name: 'OpenCV', desc: 'Computer vision', color: '#ffa500' },
  { icon: '🌶️', name: 'Flask', desc: 'REST API server', color: '#00ff88' },
  { icon: '🔌', name: 'Arduino', desc: 'Hardware control', color: '#ffa500' },
  { icon: '📡', name: 'Serial', desc: 'Device communication', color: '#ffffff' },
]

export default function TechStackSection() {
  const [ref, inView] = useInView(0.1)
  return (
    <section id="techstack" className="section-base" style={{ background: 'linear-gradient(180deg, #0a0a0a, #141414)' }} ref={ref}>
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <div className="inline-block px-4 py-1.5 rounded-full glass mb-4 font-orbitron text-xs tracking-widest" style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}>
          BUILT WITH
        </div>
        <h2 className="font-orbitron text-4xl font-bold gradient-text">Technology Stack</h2>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto px-4">
        {STACK.map((tech, i) => (
          <motion.div
            key={tech.name}
            className="glass-card flex flex-col items-center p-8 w-36 group cursor-default"
            style={{ borderColor: `${tech.color}22` }}
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1, type: 'spring', stiffness: 200 }}
            whileHover={{
              scale: 1.12,
              boxShadow: `0 0 40px ${tech.color}44`,
              borderColor: `${tech.color}77`,
              y: -8,
            }}
          >
            <motion.div
              className="text-5xl mb-3"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
            >
              {tech.icon}
            </motion.div>
            <div className="font-orbitron text-sm font-bold" style={{ color: tech.color }}>{tech.name}</div>
            <div className="text-xs text-gray-300/40 mt-1 text-center">{tech.desc}</div>
            {/* Glow underline on hover */}
            <div
              className="w-0 group-hover:w-full h-0.5 mt-3 transition-all duration-500 rounded-full"
              style={{ background: tech.color }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
