import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import UserSidebar from '../components/UserSidebar'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [hasBiometric, setHasBiometric] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('auth_token')
    if (!token) {
      navigate('/auth')
      return
    }

    // Fetch user status
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        setUser(data.user)
        setHasBiometric(data.has_biometric)
      } else {
        setError('Failed to load user profile')
      }
    })
    .catch(() => setError('Connection to security server failed'))
    .finally(() => setLoading(false))
  }, [navigate])

  const handleRevoke = async () => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete your biometric data? You will need to use your password for next login.')) return
    
    const token = sessionStorage.getItem('auth_token')
    try {
      const res = await fetch('/api/face/revoke', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setHasBiometric(false)
        alert('Biometric data revoked successfully.')
      }
    } catch (err) {
      alert('Error revoking data: ' + err.message)
    }
  }

  if (loading) return <div className="min-h-screen cyber-bg flex items-center justify-center font-orbitron text-white">INITIALIZING ENCRYPTED SESSION...</div>

  return (
    <div className="min-h-screen cyber-bg relative overflow-hidden flex flex-col items-center justify-center p-4">
      <UserSidebar />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card p-8 max-w-2xl w-full"
      >
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 className="font-orbitron text-2xl font-bold gradient-text">SECURITY SETTINGS</h1>
            <p className="text-[10px] text-white/40 tracking-[0.3em] uppercase">User Identity Control Panel</p>
          </div>
          <button onClick={() => navigate('/')} className="text-white/60 hover:text-white transition-colors">✕</button>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 p-4 rounded-lg text-red-500 text-xs font-orbitron mb-6">{error}</div>}

        <div className="grid md:grid-cols-2 gap-8">
          {/* User Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] text-white/40 font-orbitron uppercase mb-2">Account Identity</label>
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                <p className="font-orbitron text-white">{user?.username}</p>
                <p className="text-[9px] text-white/30 mt-1 uppercase">Resident UID: {String(user?.id ?? '').substring(0,8)}...</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-white/40 font-orbitron uppercase mb-2">Password Status</label>
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex items-center justify-between">
                <p className="text-sm font-semibold text-green-400">✓ Argon2id Secure</p>
                <button className="text-[9px] text-white/40 hover:text-white underline uppercase">Change</button>
              </div>
            </div>
          </div>

          {/* Biometrics */}
          <div className="space-y-6">
             <div>
              <label className="block text-[10px] text-white/40 font-orbitron uppercase mb-2">Biometric Status</label>
              <div className={`p-4 rounded-lg border flex flex-col gap-4 ${hasBiometric ? 'bg-green-500/5 border-green-500/30' : 'bg-orange-500/5 border-orange-500/30'}`}>
                {hasBiometric ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <p className="text-sm font-bold text-green-400 font-orbitron">FACE LOGIN ACTIVE</p>
                    </div>
                    <button 
                      onClick={handleRevoke}
                      className="w-full py-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 text-[10px] font-orbitron transition-all"
                    >
                      REVOKE BIOMETRIC ACCESS
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full" />
                      <p className="text-sm font-bold text-orange-400 font-orbitron">NO BIOMETRICS FOUND</p>
                    </div>
                    <button 
                      onClick={() => navigate('/register')}
                      className="btn-cyber w-full justify-center text-[10px]"
                      style={{ padding: '0.5rem' }}
                    >
                      ENABLE FACE LOGIN
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-[10px] text-white/40 leading-relaxed font-inter">
                Your face templates are never stored as raw images. We use **AES-256-GCM envelope encryption** with a dedicated KMS mock provider.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-center">
            <button 
               onClick={() => {
                 sessionStorage.clear();
                 navigate('/auth');
               }}
               className="text-[10px] text-white/30 hover:text-white/60 tracking-widest uppercase transition-colors"
            >
              Sign out of Administrative Interface
            </button>
        </div>
      </motion.div>
    </div>
  )
}
