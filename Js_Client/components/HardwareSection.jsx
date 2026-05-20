import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const HARDWARE = [
  { icon: '🤖', name: 'Arduino Uno', desc: 'Microcontroller hub that processes serial commands and controls all actuators.', color: '#00ff88' },
  { icon: '⚡', name: 'Relay Module', desc: '5V relay switches the 12V solenoid lock circuit safely from Arduino logic.', color: '#ffa500' },
  { icon: '🔓', name: 'Solenoid Lock', desc: 'Electromagnetic lock that physically secures/opens the door on relay trigger.', color: '#00ff88' },
  { icon: '📡', name: 'SIM800L GSM', desc: 'GSM module sends OTP SMS to registered mobile numbers for backup auth.', color: '#ffa500' },
  { icon: '⌨️', name: 'Keypad', desc: '4×4 matrix keypad for manual OTP entry on the device panel.', color: '#ffffff' },
  { icon: '📟', name: 'LCD Display', desc: '16×2 I2C LCD shows system status, prompts, and access messages.', color: '#ffffff' },
]

export default function HardwareSection() {
  const [ref, inView] = useInView(0.1)
  return (
    <section id="hardware" className="section-base" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)' }} ref={ref}>
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <div className="inline-block px-4 py-1.5 rounded-full glass mb-4 font-orbitron text-xs tracking-widest" style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}>
          HARDWARE
        </div>
        <h2 className="font-orbitron text-4xl font-bold gradient-text">Hardware Components</h2>
        <p className="text-gray-300/50 mt-4 max-w-xl mx-auto text-sm">
          The physical layer that makes Smart Secure a complete, real-world access control system.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl w-full mx-auto px-4">
        {HARDWARE.map((h, i) => (
          <motion.div
            key={h.name}
            className="glass-card p-5 text-center group cursor-default"
            style={{ borderColor: `${h.color}22` }}
            initial={{ opacity: 0, y: 40, rotateX: 30 }}
            animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 0 30px ${h.color}33, 0 0 60px ${h.color}11`,
              borderColor: `${h.color}66`,
            }}
          >
            <motion.div
              className="text-4xl mb-3 mx-auto"
              whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              {h.icon}
            </motion.div>
            <h3 className="font-orbitron text-xs font-bold mb-2" style={{ color: h.color }}>{h.name}</h3>
            <p className="text-gray-300/40 text-xs leading-relaxed">{h.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
