import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/dashboard.css'

/* ── Toast System ──────────────────────────────────────── */
function ToastContainer({ toasts, onClose }) {
  return (
    <div className="dash-toast-container" role="region" aria-label="Notifications">
      {toasts.map(t => (
        <div key={t.id} className={`dash-toast${t.exit ? ' exit' : ''}`}>
          <span className="dash-toast-icon">{t.icon}</span>
          <span className="dash-toast-text">{t.text}</span>
          <button className="dash-toast-close" onClick={() => onClose(t.id)}>×</button>
        </div>
      ))}
    </div>
  )
}

function useToasts() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const addToast = useCallback((text, icon = '🔔') => {
    const id = ++idRef.current
    setToasts(p => [...p, { id, text, icon, exit: false }])
    setTimeout(() => {
      setToasts(p => p.map(t => t.id === id ? { ...t, exit: true } : t))
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 350)
    }, 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(p => p.map(t => t.id === id ? { ...t, exit: true } : t))
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 350)
  }, [])

  return { toasts, addToast, removeToast }
}

/* ── Stat Card ─────────────────────────────────────────── */
function StatCard({ label, value, sub, icon, accentColor }) {
  return (
    <div className="dash-stat-card" style={accentColor ? { '--accent': accentColor } : {}}>
      <div className="dash-stat-icon">{icon}</div>
      <div className="dash-stat-label">{label}</div>
      <div className="dash-stat-value" style={accentColor ? { color: accentColor } : {}}>{value}</div>
      {sub && <div className="dash-stat-sub">{sub}</div>}
    </div>
  )
}

/* ── Event type helpers ─────────────────────────────────── */
const EVENT_META = {
  granted: { icon: '✅', label: 'Access Granted', cls: 'granted' },
  denied:  { icon: '🚫', label: 'Access Denied',  cls: 'denied'  },
  otp_sent:{ icon: '📧', label: 'OTP Dispatched', cls: 'otp'     },
  manual:  { icon: '🔓', label: 'Manual Unlock',  cls: 'manual'  },
}

function confidenceCls(c) {
  if (!c) return ''
  if (c >= 75) return 'high'
  if (c >= 55) return 'med'
  return 'low'
}

/* ── Access Feed ───────────────────────────────────────── */
function AccessFeed({ logs, loading }) {
  if (loading) return (
    <div className="dash-feed-empty">
      <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>⏳</div>
      Loading access events…
    </div>
  )
  if (!logs.length) return (
    <div className="dash-feed-empty">
      <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.2 }}>🔒</div>
      No access events yet.<br />
      <span style={{ fontSize: 11 }}>Events appear here after each face scan.</span>
    </div>
  )
  return (
    <div className="dash-feed" id="access-feed">
      {logs.map(log => {
        const meta = EVENT_META[log.event_type] || EVENT_META.denied
        return (
          <div className="dash-feed-item" key={log.id}>
            <div className={`dash-feed-icon ${meta.cls}`}>{meta.icon}</div>
            <div className="dash-feed-info">
              <div className="dash-feed-name">{log.name}</div>
              <div className="dash-feed-meta">
                <span>{meta.label}</span>
                {log.confidence != null && (
                  <span className={`dash-feed-confidence ${confidenceCls(log.confidence)}`}>
                    {log.confidence}%
                  </span>
                )}
              </div>
            </div>
            <div className="dash-feed-time">{log.time_ago}</div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Door Control ──────────────────────────────────────── */
function DoorControl({ onToast }) {
  const [isOpen, setIsOpen]   = useState(false)
  const [modal, setModal]     = useState(null)   // 'unlock' | 'lock' | null
  const [pass, setPass]       = useState('')
  const [err, setErr]         = useState('')
  const [busy, setBusy]       = useState(false)

  const handleAction = async () => {
    setBusy(true); setErr('')
    try {
      const res = await fetch(`/api/door/${modal}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
      })
      const data = await res.json()
      if (data.success) {
        setIsOpen(modal === 'unlock')
        onToast(
          modal === 'unlock' ? 'Door unlocked remotely by admin.' : 'Door locked remotely by admin.',
          modal === 'unlock' ? '🔓' : '🔒'
        )
        setModal(null); setPass('')
      } else {
        setErr(data.error || 'Action failed')
      }
    } catch {
      setErr('Connection to server failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dash-card dash-door-panel">
      <div className="dash-card-header">
        <div>
          <div className="dash-card-title">Door Control</div>
          <div className="dash-card-sub">Remote admin override</div>
        </div>
      </div>

      <div className="dash-door-status">
        <div className={`dash-door-lock ${isOpen ? 'unlocked' : 'locked'}`}>
          {isOpen ? '🔓' : '🔒'}
        </div>
        <div className="dash-door-label">{isOpen ? 'Door Unlocked' : 'Door Locked'}</div>
        <div className="dash-door-sub">
          {isOpen ? 'Entry permitted — lock when done' : 'Secure — face scan or OTP to enter'}
        </div>
      </div>

      <div className="dash-door-actions">
        <button
          id="door-unlock-btn"
          className="dash-door-btn unlock"
          onClick={() => { setModal('unlock'); setPass(''); setErr('') }}
        >
          🔓 Remote Unlock
        </button>
        <button
          id="door-lock-btn"
          className="dash-door-btn lock"
          onClick={() => { setModal('lock'); setPass(''); setErr('') }}
        >
          🔒 Force Lock
        </button>
      </div>

      {modal && (
        <div className="dash-modal-backdrop" onClick={() => setModal(null)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <h3>{modal === 'unlock' ? '🔓 Confirm Unlock' : '🔒 Confirm Lock'}</h3>
            <p>Enter admin password to {modal} the door remotely.</p>
            <input
              autoFocus
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={e => { setPass(e.target.value); setErr('') }}
              onKeyDown={e => e.key === 'Enter' && handleAction()}
              id="door-pass-input"
            />
            {err && <div className="dash-modal-error">✗ {err}</div>}
            <div className="dash-modal-actions">
              <button className="dash-modal-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button
                className="dash-modal-confirm"
                onClick={handleAction}
                disabled={busy}
                id="door-confirm-btn"
              >
                {busy ? 'Sending…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Residents Panel ───────────────────────────────────── */
function ResidentsPanel({ residents, onDeleted, onToast }) {
  const [deleteTarget, setDeleteTarget] = useState(null) // name to delete
  const [pass,         setPass]         = useState('')
  const [err,          setErr]          = useState('')
  const [busy,         setBusy]         = useState(false)

  const openModal = (name) => { setDeleteTarget(name); setPass(''); setErr('') }
  const closeModal = () => { setDeleteTarget(null); setPass(''); setErr('') }

  const handleDelete = async () => {
    if (!pass) { setErr('Admin password is required'); return }
    setBusy(true); setErr('')
    try {
      const res = await fetch(`/api/residents/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: deleteTarget, password: pass }),
      })
      const data = await res.json()
      if (data.success) {
        onToast(`"${deleteTarget}" removed and model retrained.`, '🗑️')
        closeModal()
        onDeleted()
      } else {
        setErr(data.error || 'Delete failed')
      }
    } catch {
      setErr('Could not reach server')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div>
          <div className="dash-card-title">Registered Residents</div>
          <div className="dash-card-sub">{residents.length} face templates enrolled</div>
        </div>
        <Link to="/register" id="dash-add-resident" className="dash-topbar-btn" style={{ textDecoration: 'none' }}>
          + Add
        </Link>
      </div>
      {residents.length === 0 ? (
        <div className="dash-feed-empty">
          <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>👥</div>
          No residents registered yet.
        </div>
      ) : (
        <div className="dash-residents-grid">
          {residents.map((name, i) => (
            <div className="dash-resident-card" key={i} style={{ position: 'relative' }}>
              <button
                title={`Delete ${name}`}
                id={`delete-resident-${i}`}
                onClick={() => openModal(name)}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 6, color: '#f87171', cursor: 'pointer',
                  fontSize: 13, padding: '2px 6px', lineHeight: 1.4,
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                onMouseOut={e  => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
              >🗑</button>
              <div className="dash-resident-avatar">👤</div>
              <div className="dash-resident-name" title={name}>{name}</div>
              <div className="dash-resident-status">Verified</div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="dash-modal-backdrop" onClick={closeModal}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <h3>🗑️ Delete Resident</h3>
            <p>
              This will permanently remove <strong style={{ color: '#f87171' }}>{deleteTarget}</strong>'s
              face dataset and retrain the model. This cannot be undone.
            </p>
            <p style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>Enter admin password to confirm:</p>
            <input
              autoFocus
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={e => { setPass(e.target.value); setErr('') }}
              onKeyDown={e => e.key === 'Enter' && handleDelete()}
              id="delete-resident-pass-input"
            />
            {err && <div className="dash-modal-error">✗ {err}</div>}
            <div className="dash-modal-actions">
              <button className="dash-modal-cancel" onClick={closeModal}>Cancel</button>
              <button
                id="delete-resident-confirm-btn"
                onClick={handleDelete}
                disabled={busy}
                style={{ background: '#dc2626', color: '#fff', border: 'none',
                         padding: '8px 18px', borderRadius: 8, cursor: busy ? 'not-allowed' : 'pointer',
                         fontWeight: 600, fontSize: 14, opacity: busy ? 0.7 : 1 }}
              >
                {busy ? 'Deleting…' : 'Delete & Retrain'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── System Status Bar ─────────────────────────────────── */
function SysBar({ stats }) {
  const items = [
    {
      label: 'AI Recognition Engine',
      value: stats?.model_ready ? 'Loaded · FaceNet + DeepFace' : 'Not trained yet',
      on: stats?.model_ready,
    },
    {
      label: 'Hardware Serial (Arduino)',
      value: stats?.serial_connected ? 'COM port connected · 9600 baud' : 'No device on COM20',
      on: stats?.serial_connected,
    },
    {
      label: 'Flask API Server',
      value: 'Running on port 5000',
      on: true,
    },
  ]
  return (
    <div className="dash-sysbar">
      {items.map((item, i) => (
        <div className="dash-sysbar-item" key={i}>
          <div className={`dash-sysbar-dot ${item.on ? 'on' : 'off'}`} />
          <div>
            <div className="dash-sysbar-label">{item.label}</div>
            <div className="dash-sysbar-value">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Main Dashboard Page ───────────────────────────────── */
export default function DashboardPage() {
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToasts()

  const [logs,      setLogs]      = useState([])
  const [stats,     setStats]     = useState(null)
  const [residents, setResidents] = useState([])
  const [loading,   setLoading]   = useState(true)

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [logRes, statRes, resRes] = await Promise.all([
        fetch('/api/access-log?limit=40'),
        fetch('/api/access-stats'),
        fetch('/users'),
      ])
      const [logData, statData, resData] = await Promise.all([
        logRes.json(), statRes.json(), resRes.json(),
      ])
      if (logData.success)  setLogs(logData.logs)
      if (statData.success) setStats(statData.stats)
      if (Array.isArray(resData)) setResidents(resData)
    } catch {
      if (!silent) addToast('Could not reach the Flask server. Is it running?', '⚠️')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // Initial load + auto-refresh every 10s
  useEffect(() => {
    fetchAll()
    const interval = setInterval(() => fetchAll(true), 10000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const prevLogCount = useRef(0)
  useEffect(() => {
    if (logs.length > prevLogCount.current && prevLogCount.current > 0) {
      const newest = logs[0]
      const meta = EVENT_META[newest?.event_type] || EVENT_META.denied
      addToast(`${meta.label}: ${newest.name}`, meta.icon)
    }
    prevLogCount.current = logs.length
  }, [logs, addToast])

  const grantedToday = stats?.granted_today ?? '–'
  const deniedToday  = stats?.denied_today  ?? '–'
  const totalToday   = stats?.total_today   ?? '–'
  const totalRes     = stats?.total_residents ?? residents.length

  return (
    <div className="dash-page">
      {/* Background */}
      <div className="dash-bg">
        <div className="dash-bg-glow" />
        <div className="dash-bg-grid" />
      </div>

      {/* Top Bar */}
      <header className="dash-topbar">
        <div className="dash-topbar-left">
          <img src="/logo.png" alt="Shalimar Security" className="dash-topbar-logo" />
          <div className="dash-topbar-title">
            Shalimar <span>Security</span>
          </div>
        </div>
        <div className="dash-topbar-right">
          <div className="dash-topbar-badge">
            <div className="dash-topbar-dot" style={{ background: '#34d399' }} />
            System Online
          </div>
          <Link to="/how-it-works" id="dash-arch-link" className="dash-topbar-btn" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#a1a1aa' }}>How It Works</Link>
          <Link to="/auth" id="dash-scan-link" className="dash-topbar-btn">Face Scan →</Link>
          <Link to="/home"    id="dash-home-link" className="dash-topbar-btn" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#a1a1aa' }}>Home</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="dash-main">

        {/* System Status Bar */}
        <SysBar stats={stats} />

        {/* Stats Row */}
        <div className="dash-stats">
          <StatCard label="Accesses Today"    value={totalToday}   sub="total attempts"       icon="📊" />
          <StatCard label="Access Granted"    value={grantedToday} sub="successful unlocks"   icon="✅" accentColor="#34d399" />
          <StatCard label="Denied / OTP Sent" value={deniedToday}  sub="unknown visitors"     icon="⚠️" accentColor="#fbbf24" />
          <StatCard label="Residents"         value={totalRes}     sub="face templates enrolled" icon="👥" accentColor="#60a5fa" />
        </div>

        {/* Main Panels */}
        <div className="dash-panels">
          {/* Access Log Feed */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div>
                <div className="dash-card-title">Live Access Feed</div>
                <div className="dash-card-sub">Real-time door events · auto-refreshes every 10s</div>
              </div>
              <button
                id="dash-refresh-btn"
                onClick={() => fetchAll(true)}
                style={{ background: 'none', border: 'none', color: '#71717a', fontSize: 18, cursor: 'pointer', padding: 4 }}
                title="Refresh"
              >↻</button>
            </div>
            <AccessFeed logs={logs} loading={loading} />
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <DoorControl onToast={addToast} />
          </div>
        </div>

        {/* Residents */}
        <ResidentsPanel residents={residents} onDeleted={() => fetchAll(true)} onToast={addToast} />
      </main>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
