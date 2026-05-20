import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const HARDWARE_GROUPS = [
  {
    title: 'Processing',
    color: '#00ff88',
    items: [
      { icon: '🤖', name: 'Arduino Uno', desc: 'Central controller for sensor logic and hardware triggers.' }
    ]
  },
  {
    title: 'Control & Actuation',
    color: '#ffa500',
    items: [
      { icon: '🔓', name: 'Solenoid Lock', desc: '12V electronic lock that physically secures the entry.' },
      { icon: '⚡', name: 'Relay Module', desc: 'Safely toggles high-current lock circuit from Arduino.' }
    ]
  },
  {
    title: 'Identity & Auth',
    color: '#3b82f6',
    items: [
      { icon: '📡', name: 'SIM800L GSM', desc: 'Sends backup OTP via SMS when face ID is unavailable.' },
      { icon: '⌨️', name: '4x4 Keypad', desc: 'Tactile input for manual OTP and admin commands.' },
      { icon: '📟', name: '16x2 LCD', desc: 'Real-time feedback and system status interface.' }
    ]
  }
]

export default function HardwareSlide() {
  const [ref, inView] = useInView(0.1)

  return (
    <section id="techstack" className="min-h-screen flex flex-col items-center justify-center py-20 px-6 relative overflow-hidden bg-[#050505]" ref={ref}>
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#00ff8811] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#ffa50009] rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        className="text-center mb-16 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <span className="font-orbitron text-xs tracking-[0.3em] text-[#00ff88] mb-4 block uppercase leading-none">
          Integrated Systems
        </span>
        <h2 className="font-orbitron text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter italic">
          HARDWARE <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>STACK</span>
        </h2>
        <div className="w-24 h-1 bg-[#00ff88] mx-auto mb-8 shadow-[0_0_15px_#00ff88]" />
      </motion.div>

      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {HARDWARE_GROUPS.map((group, gIdx) => (
          <motion.div
            key={group.title}
            className="glass-card p-8 border-[#ffffff11] hover:border-[#ffffff22] transition-colors overflow-hidden"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: gIdx * 0.2 }}
          >
            <h3 className="font-orbitron text-xl font-bold mb-8 flex items-center gap-3" style={{ color: group.color }}>
              <span className="w-2 h-6 rounded-full" style={{ background: group.color }} />
              {group.title}
            </h3>
            
            <div className="space-y-8">
              {group.items.map((item, iIdx) => (
                <motion.div 
                    key={item.name} 
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: gIdx * 0.2 + iIdx * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-orbitron text-sm font-bold text-white mb-1">{item.name}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Connection Mesh Graphic (Simplified) */}
      <div className="mt-20 flex items-center gap-4 text-gray-500 font-orbitron text-[10px] tracking-widest opacity-30">
        <span>SERIAL BUS</span>
        <div className="w-12 h-px bg-gray-700" />
        <span>GPIO LINKS</span>
        <div className="w-12 h-px bg-gray-700" />
        <span>POWER GRID</span>
      </div>
    </section>
  )
}
