import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function UserSidebar() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [open, setOpen] = useState(false)
  const [currentName, setCurrentName] = useState('')
  const [systemStatus, setSystemStatus] = useState('checking')
  const [showPassModal, setShowPassModal] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const handlePasswordLogin = async () => {
    setLoginError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      })
      const data = await res.json()
      if (data.success) {
        sessionStorage.setItem('auth_token', data.token)
        sessionStorage.setItem('user_name', loginUsername)
        setShowPassModal(false)
        navigate('/settings')
      } else {
        setLoginError(data.error || 'Invalid credentials')
      }
    } catch (err) {
      setLoginError('Connection failed')
    }
  }

  useEffect(() => {
    setCurrentName(sessionStorage.getItem('user_name') || '')

    const fetchData = async () => {
      try {
        const [usersRes, healthRes] = await Promise.all([
          fetch('/users'),
          fetch('/health'),
        ])
        const usersData = await usersRes.json()
        const healthData = await healthRes.json()
        setUsers(usersData)
        setSystemStatus(healthData.status === 'ok' ? 'online' : 'error')
      } catch {
        setSystemStatus('offline')
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const statusColor = {
    online: '#34d399',
    offline: '#ef4444',
    checking: '#fb923c',
  }[systemStatus]

  const statusLabel = {
    online: 'System Online',
    offline: 'Backend Offline',
    checking: 'Connecting...',
  }[systemStatus]

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-[60] w-10 h-40 flex flex-col items-center justify-center gap-4 group transition-all"
        style={{
          background: 'rgba(10, 14, 23, 0.8)',
          backdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0 12px 12px 0',
          boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
        }}
        whileHover={{ x: 3 }}
      >
        <div className="absolute inset-0 rounded-r-xl opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to right, transparent, rgba(52, 211, 153, 0.04))' }} />

        <span
          className="font-medium text-slate-500 group-hover:text-slate-300 transition-colors"
          style={{ writingMode: 'vertical-lr', fontSize: '9px', letterSpacing: '0.2em', transform: 'rotate(180deg)' }}
        >
          RESIDENTS
        </span>

        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
      </motion.button>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 z-[70] flex flex-col"
            style={{
              background: 'rgba(8, 12, 20, 0.97)',
              backdropFilter: 'blur(24px)',
              borderRight: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '20px 0 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div>
                <h3 className="font-orbitron text-sm font-bold text-white tracking-wide">Residents</h3>
                <p className="text-[10px] text-slate-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {users.length} registered
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              >
                ✕
              </button>
            </div>

            {/* System Status Bar */}
            <div className="mx-4 mt-4 px-4 py-2.5 rounded-xl flex items-center gap-3"
              style={{ background: `${statusColor}0a`, border: `1px solid ${statusColor}20` }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: statusColor }} />
              <span className="text-[10px] font-medium" style={{ color: statusColor, fontFamily: "'Inter', sans-serif", letterSpacing: '0.05em' }}>
                {statusLabel}
              </span>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto px-4 mt-4 space-y-2 custom-scrollbar">
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-4xl mb-4 opacity-30">👥</span>
                  <p className="text-xs text-slate-600 font-medium">No residents registered yet</p>
                  <p className="text-[10px] text-slate-700 mt-1">Complete setup to add residents</p>
                </div>
              ) : (
                users.map((user, idx) => (
                  <motion.div
                    key={user}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="flex items-center gap-3 p-3 rounded-xl group cursor-default transition-all hover:bg-white/3"
                    style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.15)' }}>
                      👤
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white/90 truncate">{user}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
                        <span className="text-[10px] text-slate-600" style={{ fontFamily: "'Inter', sans-serif" }}>Verified Resident</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/5 space-y-3">
              {currentName ? (
                <div className="p-4 rounded-xl"
                  style={{ background: 'rgba(52, 211, 153, 0.05)', border: '1px solid rgba(52, 211, 153, 0.12)' }}>
                  <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Active Session
                  </p>
                  <p className="text-sm font-semibold text-white mb-3">{currentName}</p>
                  <button
                    onClick={() => { setOpen(false); navigate('/settings') }}
                    className="w-full py-2.5 rounded-lg text-[11px] font-medium text-slate-300 hover:text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    ⚙ Manage Security
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowPassModal(true)}
                  className="w-full py-3 rounded-xl text-[11px] font-semibold text-emerald-400 transition-all"
                  style={{ background: 'rgba(52, 211, 153, 0.06)', border: '1px solid rgba(52, 211, 153, 0.15)' }}
                >
                  Resident Login →
                </button>
              )}

              <button
                onClick={() => { setOpen(false); navigate('/register') }}
                className="w-full py-2.5 rounded-xl text-[11px] font-medium text-slate-400 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                + Register New Resident
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {open && !showPassModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[65] md:hidden"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>
      
      {/* Password Login Modal */}
      <AnimatePresence>
        {showPassModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(12px)' }}
            onClick={() => setShowPassModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="p-8 w-full max-w-sm relative rounded-3xl"
              onClick={(e) => e.stopPropagation()}
              style={{ 
                background: 'rgba(10, 14, 23, 0.95)', 
                border: `1px solid ${loginError ? '#ef4444' : 'rgba(52,211,153,0.3)'}`,
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}
            >
              <div className="mb-6 text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                  <span className="text-2xl">🔐</span>
                </div>
                <h3 className="font-orbitron text-lg font-bold text-white mb-1">Resident Login</h3>
                <p className="text-xs text-slate-500">Enter your credentials</p>
              </div>

              <div className="space-y-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="Username"
                  value={loginUsername}
                  onChange={(e) => {
                    setLoginUsername(e.target.value)
                    setLoginError('')
                  }}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white text-center focus:outline-none transition-all focus:border-emerald-500/50"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value)
                    setLoginError('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin()}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white text-center tracking-[0.5em] focus:outline-none transition-all focus:border-emerald-500/50"
                />
                
                {loginError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 text-center font-medium"
                  >
                    {loginError}
                  </motion.p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowPassModal(false)}
                    className="flex-1 py-3 rounded-xl text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white hover:bg-white/5 transition-all border border-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordLogin}
                    className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                    style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', color: '#000', border: 'none' }}
                  >
                    Login
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
