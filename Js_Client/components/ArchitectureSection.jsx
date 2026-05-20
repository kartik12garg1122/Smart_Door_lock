import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const NODES = [
  { id: 'react', label: 'React UI', sub: 'Dashboard & Auth', icon: '⚛️', color: 'rgba(255,255,255,0.9)', x: 5 },
  { id: 'flask', label: 'Flask API', sub: 'REST Server', icon: '🌶️', color: 'rgba(0,255,136,0.9)', x: 30 },
  { id: 'cv', label: 'OpenCV', sub: 'Face Detection', icon: '👁️', color: 'rgba(255,165,0,0.9)', x: 55 },
  { id: 'arduino', label: 'Arduino', sub: 'Lock Control', icon: '🤖', color: 'rgba(0,255,136,0.9)', x: 80 },
]

const CONNECTIONS = [
  { from: 'react', to: 'flask', color: '#ffffff', label: 'HTTP GET /recognize' },
  { from: 'flask', to: 'cv', color: '#00ff88', label: 'OpenCV frame analysis' },
  { from: 'cv', to: 'arduino', color: '#ffa500', label: 'Serial unlock command' },
]

export default function ArchitectureSection() {
  const [ref, inView] = useInView(0.15)
  return (
    <section id="architecture" className="section-base cyber-bg" ref={ref}>
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <div className="inline-block px-4 py-1.5 rounded-full glass mb-4 font-orbitron text-xs tracking-widest" style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}>
          SYSTEM DESIGN
        </div>
        <h2 className="font-orbitron text-4xl font-bold gradient-text">System Architecture</h2>
        <p className="text-gray-300/50 mt-4 max-w-xl mx-auto">
          A three-tier architecture connecting the React UI through Flask to OpenCV and finally to the Arduino lock controller.
        </p>
      </motion.div>

      {/* Architecture diagram */}
      <div className="w-full max-w-5xl mx-auto px-4">
        {/* Desktop horizontal flow */}
        <div className="hidden md:block">
          <div className="relative" style={{ height: 200 }}>
            {/* SVG connection lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
              {CONNECTIONS.map((conn, i) => {
                const fromNode = NODES.find(n => n.id === conn.from)
                const toNode = NODES.find(n => n.id === conn.to)
                if (!fromNode || !toNode) return null
                const fromX = `${fromNode.x + 10}%`
                const toX = `${toNode.x}%`
                const y = '50%'
                return (
                  <g key={i}>
                    <motion.line
                      x1={fromX} y1={y} x2={toX} y2={y}
                      stroke={conn.color}
                      strokeWidth="2"
                      strokeDasharray="8 4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={inView ? { pathLength: 1, opacity: 0.7 } : {}}
                      transition={{ duration: 1, delay: 0.5 + i * 0.4 }}
                    />
                    {/* Animated arrow dot */}
                    {inView && (
                      <motion.circle
                        r="5"
                        fill={conn.color}
                        style={{ filter: `drop-shadow(0 0 6px ${conn.color})` }}
                        initial={{ cx: fromX, cy: y, opacity: 0 }}
                        animate={{ cx: toX, cy: y, opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.5, delay: 1 + i * 0.4, repeat: Infinity, repeatDelay: 2 }}
                      />
                    )}
                  </g>
                )
              })}
            </svg>

            {/* Nodes */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              {NODES.map((node, i) => (
                <motion.div
                  key={node.id}
                  className="glass-card p-4 text-center flex-1 mx-2 relative"
                  style={{ borderColor: `${node.color.replace('0.9', '0.2')}` }}
                  initial={{ opacity: 0, scale: 0.9, y: 10, boxShadow: '0 0 0px rgba(0,0,0,0)' }}
                  animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, boxShadow: `0 0 15px ${node.color.replace('0.9', '0.3')}` }}
                >
                  <div className="text-2xl mb-2">{node.icon}</div>
                  <div className="font-orbitron text-xs font-bold" style={{ color: node.color }}>{node.label}</div>
                  <div className="text-[10px] text-gray-300/40 mt-1">{node.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Connection labels */}
          <div className="flex justify-around mt-4 px-16">
            {CONNECTIONS.map((conn, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 1.2 + i * 0.2 }}
              >
                <div className="text-xs font-orbitron" style={{ color: conn.color }}>{conn.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile vertical flow */}
        <div className="md:hidden space-y-4">
          {NODES.map((node, i) => (
            <motion.div
              key={node.id}
              className="glass-card p-4 flex items-center gap-4"
              style={{ borderColor: `${node.color.replace('0.9', '0.2')}` }}
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="text-3xl">{node.icon}</div>
              <div>
                <div className="font-orbitron text-sm font-bold" style={{ color: node.color }}>{node.label}</div>
                <div className="text-xs text-gray-300/40">{node.sub}</div>
              </div>
              {i < NODES.length - 1 && (
                <div className="ml-auto text-2xl" style={{ color: node.color }}>→</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
