import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IntruderGallery({ isOpen, onClose }) {
  const [intruders, setIntruders] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchIntruders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/intruders')
      const data = await res.json()
      if (data.success) {
        setIntruders(data.intruders)
      }
    } catch (err) {
      console.error('Failed to fetch intruders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (filename) => {
    if (!window.confirm('Delete this intruder log permanentely?')) return
    
    try {
      const res = await fetch(`/intruders/${filename}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        setIntruders(prev => prev.filter(i => i.id !== filename))
      }
    } catch (err) {
      console.error('Failed to delete intruder:', err)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchIntruders()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar/Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[70] p-8 flex flex-col"
            style={{ background: 'rgba(8, 12, 20, 0.98)', backdropFilter: 'blur(24px)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-orbitron text-xl font-bold text-white tracking-tight">INTRUDER LOGS</h2>
                <div className="w-10 h-0.5 mt-2" style={{ background: 'linear-gradient(90deg, #fb923c, transparent)' }} />
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="font-orbitron text-xs text-white/40 animate-pulse">SCANNING DATABASE...</div>
              </div>
            ) : intruders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                <div className="text-4xl mb-4">🛡️</div>
                <div className="font-orbitron text-xs tracking-[0.2em] text-white">NO THREATS DETECTED</div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                {intruders.map((intruder, idx) => (
                  <motion.div
                    key={intruder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card overflow-hidden border-orange-500/20 group"
                  >
                    <div className="aspect-video relative overflow-hidden bg-black">
                        <img 
                            src={intruder.url} 
                            alt={`Intruder ${intruder.timestamp}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[8px] font-bold text-white font-orbitron uppercase tracking-wide"
                          style={{ background: 'rgba(251, 146, 60, 0.9)', backdropFilter: 'blur(4px)' }}>
                            UNAUTHORIZED
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={() => handleDelete(intruder.id)}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-600 rounded flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                            title="Delete Log"
                        >
                            <span className="text-xs">🗑️</span>
                        </button>
                    </div>
                    <div className="p-4 bg-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium" style={{ color: '#fb923c', fontFamily: "'Inter', sans-serif" }}>Unknown Identity</span>
                            <span className="font-orbitron text-[9px] text-white/40">{intruder.timestamp}</span>
                        </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/5">
               <button 
                onClick={fetchIntruders}
                className="w-full py-3 rounded-xl font-orbitron text-[10px] tracking-widest text-slate-400 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
               >
                 REFRESH LOGS
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
