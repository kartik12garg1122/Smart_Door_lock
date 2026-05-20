import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// Cyber Lines Background
function CyberGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundSize: '50px 50px', backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)' }} />
  )
}

// Scene 1: Entrance View (Smart Door Zoom)
function Scene1({ progress }) {
  // Simple Fade out
  const opacity = useTransform(progress, [0, 0.1, 0.16], [1, 1, 0])
  const scale = useTransform(progress, [0, 0.14], [1, 1.2]) // Lighter scale, not 15x

  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0 flex flex-col items-center justify-center p-8 origin-center">
      
      {/* 2D Smart Door Container */}
      <div className="relative w-72 h-96 border-4 border-[#1a1a1a] bg-[#0a0a0a] rounded-md flex flex-col items-center justify-start overflow-hidden shadow-2xl">
        
        <div className="absolute top-0 w-full h-1 bg-white" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-800" />
        
        {/* Biometric Scanner Panel */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-24 bg-black border border-gray-700 rounded flex flex-col items-center py-2">
          <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center mb-1">
            <motion.div 
               animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity }}
               className="w-1.5 h-1.5 rounded-full bg-red-500" 
            />
          </div>
          <div className="w-5 h-5 border border-white/50 mt-auto flex items-center justify-center mb-1">
            <div className="w-3 h-px bg-orange-400 animate-pulse" />
          </div>
        </div>

      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-24">
        <h1 className="font-orbitron text-4xl md:text-6xl font-bold text-white tracking-wider mb-2">
          Shalimar Security
        </h1>
        <p className="font-orbitron text-white text-sm md:text-base tracking-widest max-w-2xl mb-8 uppercase">
          Automated Door Locking System
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="btn-cyber pulse-glow text-sm px-6 py-3 pointer-events-auto"
          style={{ borderColor: '#00ff88', color: '#00ff88' }}
        >
          ⬡ TRY THE SYSTEM
        </button>
      </div>

    </motion.div>
  )
}

// Scene 2: Face Recognition
function Scene2({ progress }) {
  // Fade in, Fade out
  const opacity = useTransform(progress, [0.12, 0.18, 0.30, 0.36], [0, 1, 1, 0])
  const x = useTransform(progress, [0.12, 0.18, 0.30, 0.36], ['20%', '0%', '0%', '-20%'])

  return (
    <motion.div style={{ opacity, x }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-center p-8 gap-12">
      <div className="relative w-64 h-64 md:w-80 md:h-80 border-2 border-white/30 bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden">
        {/* Face Outline & Scanning lines */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1" className="w-48 h-48">
             <path d="M9 11a3 3 0 106 0a3 3 0 00-6 0z" />
             <path d="M12 18c3.866 0 7-1.343 7-3s-3.134-3-7-3s-7 1.343-7 3s3.134 3 7 3z" />
          </svg>
        </div>
        <motion.div 
          animate={{ y: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 left-0 right-0 h-1 bg-green-400" 
        />
      </div>
      <div className="max-w-md text-center md:text-left">
        <h2 className="font-orbitron text-3xl md:text-4xl neon-white mb-4">Face Recognition</h2>
        <p className="text-gray-300 leading-relaxed">
          The system uses advanced computer vision locally deployed to verify authorized users with high precision.
        </p>
      </div>
    </motion.div>
  )
}

// Scene 3: OTP Backup Security
function Scene3({ progress }) {
  const opacity = useTransform(progress, [0.30, 0.36, 0.48, 0.54], [0, 1, 1, 0])
  const x = useTransform(progress, [0.30, 0.36, 0.48, 0.54], ['-20%', '0%', '0%', '20%'])

  return (
    <motion.div style={{ opacity, x }} className="absolute inset-0 flex flex-col-reverse md:flex-row items-center justify-center p-8 gap-12">
      <div className="max-w-md text-center md:text-right">
        <h2 className="font-orbitron text-3xl md:text-4xl neon-green mb-4">OTP-Based Backup</h2>
        <p className="text-gray-300 leading-relaxed">
          If face recognition fails, our OTP mobile verification system ensures audited access.
        </p>
      </div>
      <div className="relative w-48 h-96 border-4 border-gray-700 rounded-3xl bg-black overflow-hidden flex flex-col items-center pt-12">
        <div className="w-full px-4 mb-4 mt-8">
          <div className="w-full text-center text-xs text-gray-400 mb-8 mt-4">Message Alert</div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <span className="text-orange-400 font-orbitron text-sm block mb-1">SMART SECURE</span>
            <span className="text-white font-mono text-xl tracking-widest">8 4 2 9</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Scene 4: Smart Hardware Control
function Scene4({ progress }) {
  const opacity = useTransform(progress, [0.48, 0.54, 0.66, 0.72], [0, 1, 1, 0])
  const y = useTransform(progress, [0.48, 0.54, 0.66, 0.72], ['20%', '0%', '0%', '-20%'])

  const nodes = [
    { label: 'Arduino', icon: '⚡', x: 0, y: -80 },
    { label: 'SIM800L', icon: '📡', x: -120, y: 0 },
    { label: 'Relay', icon: '🔌', x: 120, y: 0 },
    { label: 'Lock', icon: '🚪', x: 0, y: 80 },
  ]

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col items-center justify-center p-8">
      <div className="max-w-xl text-center mb-16">
        <h2 className="font-orbitron text-3xl md:text-4xl text-white mb-4 tracking-widest">Hardware Architecture</h2>
      </div>
      <div className="relative w-80 h-80">
        <svg className="absolute inset-0 w-full h-full" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', overflow: 'visible' }}>
          <motion.path 
             d="M0,-80 L-120,0 M0,-80 L120,0 M120,0 L0,80" 
             fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="5,5" 
          />
        </svg>
        {nodes.map((node, i) => (
          <div key={i} className="absolute flex flex-col items-center" style={{ left: `calc(50% + ${node.x}px)`, top: `calc(50% + ${node.y}px)`, transform: 'translate(-50%, -50%)' }}>
            <div className="w-16 h-16 rounded-full glass border border-white/50 flex items-center justify-center text-2xl bg-black">
              {node.icon}
            </div>
            <span className="mt-2 font-orbitron text-xs text-white/80 bg-black/50 px-2 py-1 rounded">{node.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Scene 5: System Architecture
function Scene5({ progress }) {
  const opacity = useTransform(progress, [0.66, 0.72, 0.84, 0.90], [0, 1, 1, 0])
  const scale = useTransform(progress, [0.66, 0.72], [1.2, 1])

  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0 flex flex-col items-center justify-center p-8">
      <h2 className="font-orbitron text-3xl font-bold gradient-text mb-12">Full System Flow</h2>
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full max-w-5xl justify-center">
        {['React UI', 'Flask API', 'OpenCV', 'Arduino'].map((step, i) => (
          <div key={i} className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="glass-card p-6 border-white/30 text-center min-w-[140px] bg-black/60">
              <div className="text-white font-orbitron tracking-widest">{step}</div>
            </div>
            {i < 3 && <div className="hidden md:flex text-orange-500 text-2xl">→</div>}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Scene 6: Final Demonstration
function Scene6({ progress }) {
  const navigate = useNavigate()
  const opacity = useTransform(progress, [0.84, 0.92], [0, 1])

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 flex flex-col items-center justify-center p-8">
      <div className="relative w-64 h-96 border-8 border-[#1a1a1a] rounded flex flex-col items-center justify-center mb-12 bg-[#0a0a0a] shadow-2xl">
        <div className="w-12 h-12 rounded-full border-4 border-green-500 flex items-center justify-center text-green-400">
          ✓
        </div>
        <div className="mt-4 font-orbitron text-xs text-green-400 tracking-widest">DOOR UNLOCKED</div>
      </div>
      
      <button 
        onClick={() => navigate('/auth')}
        className="btn-cyber pulse-glow text-lg px-8 py-4"
        style={{ borderColor: '#00ff88', color: '#00ff88' }}
      >
        ⬡ TRY THE SYSTEM
      </button>
    </motion.div>
  )
}

export default function CinematicExperience() {
  const containerRef = useRef(null)
  
  // Shorter scroll container since animations are simple fades now
  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ['start start', 'end end'] 
  })

  return (
    <div ref={containerRef} className="relative w-full bg-black text-white" style={{ height: '400vh' }}>
      <div className="sticky top-0 w-full h-screen overflow-hidden cyber-bg">
        <CyberGrid />
        
        {/* Render scenes individually instead of passing them to a spatial wrapper */}
        <Scene1 progress={scrollYProgress} />
        <Scene2 progress={scrollYProgress} />
        <Scene3 progress={scrollYProgress} />
        <Scene4 progress={scrollYProgress} />
        <Scene5 progress={scrollYProgress} />
        <Scene6 progress={scrollYProgress} />
        
      </div>

      {/* Navigation Anchors */}
      <div id="hero" className="absolute top-0 w-full h-px" />
      <div id="about" className="absolute top-[20%] w-full h-px" />
      <div id="features" className="absolute top-[40%] w-full h-px" />
      <div id="hardware" className="absolute top-[55%] w-full h-px" />
      <div id="architecture" className="absolute top-[75%] w-full h-px" />
      <div id="demo" className="absolute top-[90%] w-full h-px" />
    </div>
  )
}
