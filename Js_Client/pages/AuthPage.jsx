import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'

/* ─── States ───────────────────────────────────────── */
const S = {
  IDLE:     'idle',
  SCANNING: 'scanning',
  SUCCESS:  'success',
  INTRUDER: 'intruder',  // unknown face — OTP sent to email, enter on keypad
}
const delay = ms => new Promise(r => setTimeout(r, ms))

/* ─── Camera ───────────────────────────────────────── */
function CameraFeed({ webcamRef, scanning }) {
  const [avail, setAvail] = useState(true)
  if (!avail) return (
    <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-2xl">
      <div className="text-center text-slate-400">
        <div className="text-4xl mb-2">📷</div>
        <div className="text-sm font-semibold">NO CAMERA</div>
      </div>
    </div>
  )
  return (
    <div className="relative w-full h-full">
      <Webcam
        ref={webcamRef} audio={false} mirrored={true}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover rounded-2xl"
        onUserMediaError={() => setAvail(false)}
        videoConstraints={{ facingMode:'user', width:640, height:480 }}
      />
      {/* Corner guides */}
      {['top-3 left-3 border-t-2 border-l-2','top-3 right-3 border-t-2 border-r-2',
        'bottom-3 left-3 border-b-2 border-l-2','bottom-3 right-3 border-b-2 border-r-2'].map((cls,i) => (
        <div key={i} className={`absolute w-6 h-6 ${cls} ${scanning ? 'border-orange-400/70' : 'border-slate-500/40'} rounded-sm pointer-events-none transition-colors`}/>
      ))}
      {/* Scan line */}
      {scanning && (
        <div className="absolute left-0 right-0 h-0.5 bg-orange-400/70 blur-[1px] pointer-events-none"
          style={{animation:'scanLine 1.8s ease-in-out infinite'}}/>
      )}
    </div>
  )
}

/* ─── Door animation ───────────────────────────────── */
function Door({ success }) {
  return (
    <div className="relative w-20 h-32 mx-auto mt-4" style={{perspective:'800px'}}>
      <div className="absolute inset-0 bg-emerald-50 border-4 border-slate-200 rounded-t-xl flex items-center justify-center">
        {success ? <span className="text-3xl">👋</span> : <span className="text-3xl text-slate-200 opacity-30">🔒</span>}
      </div>
      <div className={`absolute inset-0 border-4 rounded-t-xl z-10 bg-white transition-all duration-1000 origin-left
        ${success ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'border-slate-300'}`}
        style={{transform: success ? 'rotateY(-105deg)' : 'rotateY(0deg)'}}>
        <div className="w-full h-full flex flex-col p-2 gap-2 opacity-50">
          <div className="flex-1 border-2 border-slate-200 rounded"/>
          <div className="flex-1 border-2 border-slate-200 rounded"/>
        </div>
        <div className={`absolute top-1/2 right-2 w-2 h-4 rounded-full -translate-y-1/2 transition-colors duration-500
          ${success ? 'bg-green-500' : 'bg-slate-300'}`}/>
      </div>
    </div>
  )
}

/* ─── Main ─────────────────────────────────────────── */
export default function AuthPage() {
  const navigate  = useNavigate()
  const webcamRef = useRef(null)

  const [status,     setStatus]     = useState(S.IDLE)
  const [progress,   setProgress]   = useState(0)
  const [msg,        setMsg]        = useState('Position your face in the frame')
  const [name,       setName]       = useState(null)
  const [confidence, setConfidence] = useState(null)
  const [snapshot,   setSnapshot]   = useState(null)  // intruder image
  const [otpSent,    setOtpSent]    = useState(false)

  const isScanning = status === S.SCANNING
  const isSuccess  = status === S.SUCCESS
  const isIntruder = status === S.INTRUDER

  const handleScan = useCallback(async () => {
    if (isScanning) return
    if (!webcamRef.current?.getScreenshot()) {
      setMsg('⚠ Camera not ready — allow camera access first')
      return
    }

    setStatus(S.SCANNING)
    setProgress(0)
    setSnapshot(null)
    setOtpSent(false)
    setMsg('Hold still — scanning…')

    const frames = []
    const TOTAL  = 8

    try {
      await delay(200)
      for (let i = 0; i < TOTAL; i++) {
        const f = webcamRef.current?.getScreenshot()
        if (f) frames.push(f)
        setProgress(Math.round((i + 1) / TOTAL * 80))
        if (i === 2) setMsg('Analyzing facial geometry…')
        if (i === 5) setMsg('Matching against registered residents…')
        await delay(60)
      }

      setMsg('Verifying identity…')
      setProgress(88)

      const res  = await fetch('/recognize', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ images: frames }),
      })

      setProgress(100)

      if (!res.ok && res.status !== 401) {
        throw new Error(`Server error ${res.status} — is the Python server running?`)
      }

      const data = await res.json()

      if (data.success) {
        /* ── RECOGNISED ── */
        setName(data.name || 'Resident')
        setConfidence(data.confidence ?? null)
        setMsg(`Access Granted — Welcome, ${data.name || 'Resident'}!`)
        setStatus(S.SUCCESS)
        setTimeout(() => navigate('/'), 3500)

      } else {
        /* ── UNKNOWN / INTRUDER ── */
        // Backend already: saved intruder photo, sent OTP to email, sent OTP to Arduino
        const snap = frames[frames.length - 1] || webcamRef.current?.getScreenshot()
        setSnapshot(snap)
        setOtpSent(!!data.otp_email_sent)
        const otpMsg = data.otp_email_sent
          ? 'Unknown face — intruder logged. OTP sent to registered email.'
          : `Unknown face — intruder logged. ⚠ OTP email failed: ${data.error || 'check server logs'}`
        setMsg(otpMsg)
        setStatus(S.INTRUDER)
      }

    } catch (err) {
      console.error('[AUTH]', err)
      setProgress(0)
      setMsg(`✗ ${err.message}`)
      setStatus(S.INTRUDER)  // show retry
    }
  }, [isScanning, navigate])

  const handleRetry = useCallback(() => {
    setStatus(S.IDLE)
    setProgress(0)
    setSnapshot(null)
    setOtpSent(false)
    setMsg('Position your face in the frame')
  }, [])

  /* ─── Colours ─── */
  const barColor = { [S.IDLE]:'bg-slate-300', [S.SCANNING]:'bg-orange-500', [S.SUCCESS]:'bg-green-500', [S.INTRUDER]:'bg-red-500' }[status]
  const msgColor = { [S.IDLE]:'text-slate-500', [S.SCANNING]:'text-orange-500', [S.SUCCESS]:'text-green-600', [S.INTRUDER]:'text-red-500' }[status]

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-800 max-w-md w-full rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col pt-8">

        {/* Header */}
        <div className="text-center px-8 mb-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-orange-400 animate-pulse' : isSuccess ? 'bg-green-400' : isIntruder ? 'bg-red-400' : 'bg-slate-500'}`}/>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Shalimar Security</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {isIntruder ? 'Intruder Detected' : 'Face Recognition'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isIntruder ? 'Unknown visitor — OTP dispatched' : 'Position your face clearly in frame'}
          </p>
        </div>

        {/* Camera / Snapshot */}
        <div className="px-8">
          <div className={`relative w-full aspect-square max-w-[280px] mx-auto rounded-3xl p-2 transition-colors duration-500
            ${isSuccess ? 'bg-green-900/30' : isIntruder ? 'bg-red-900/30' : isScanning ? 'bg-orange-900/20' : 'bg-slate-700'}`}>
            {isIntruder && snapshot ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <img src={snapshot} alt="Intruder" className="w-full h-full object-cover rounded-2xl"/>
                <div className="absolute inset-0 bg-red-500/15 rounded-2xl"/>
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full">
                  ⚠ Intruder Captured
                </div>
              </div>
            ) : (
              <CameraFeed webcamRef={webcamRef} scanning={isScanning}/>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="text-center py-3 px-8 min-h-[48px] flex items-center justify-center">
          <p className={`font-semibold text-sm transition-colors ${msgColor}`}>{msg}</p>
        </div>

        {/* Confidence */}
        {isSuccess && confidence !== null && (
          <div className="text-center -mt-1 mb-1">
            <span className="text-xs font-mono bg-green-900/40 text-green-400 px-3 py-0.5 rounded-full border border-green-700">
              {confidence}% confidence
            </span>
          </div>
        )}

        {/* Progress bar */}
        <div className="px-8 mb-2">
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{width:`${progress}%`}}/>
          </div>
        </div>

        {/* ── INTRUDER: hardware keypad instruction ── */}
        {isIntruder && (
          <div className="mx-8 mt-3 p-4 bg-orange-950/60 border border-orange-800/50 rounded-2xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⌨</span>
              <div>
                <p className="text-sm font-bold text-orange-300 mb-1">Enter OTP on Hardware Keypad</p>
                <p className="text-xs text-orange-400/80 leading-relaxed">
                  {otpSent
                    ? 'A 4-digit OTP has been sent to the registered email address. Enter it on the Arduino keypad at the door to grant entry.'
                    : 'Check the registered email for the OTP and enter it on the keypad at the door.'}
                </p>
                <div className="mt-3 flex gap-2">
                  {[1,2,3,4].map(n => (
                    <div key={n} className="w-9 h-10 bg-slate-800 border border-orange-700 rounded-lg flex items-center justify-center">
                      <span className="text-orange-400 font-mono text-lg">—</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-orange-500/60 mt-2 font-mono">Arduino keypad · 60-second window</p>
              </div>
            </div>
          </div>
        )}

        {/* Door graphic */}
        <Door success={isSuccess}/>

        {/* Action buttons */}
        <div className="p-8 pt-4 flex flex-col gap-3">
          {status === S.IDLE && (
            <button onClick={handleScan}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-orange-900/30 transition-all"
              id="start-scan-btn">
              ⬡ Start Face Scan
            </button>
          )}

          {status === S.SCANNING && (
            <button disabled className="w-full py-4 bg-slate-700 text-slate-400 font-bold rounded-2xl cursor-not-allowed">
              Scanning…
            </button>
          )}

          {isSuccess && (
            <button onClick={() => navigate('/')}
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-colors"
              id="success-home-btn">
              Go to Dashboard →
            </button>
          )}

          {isIntruder && (
            <>
              <button onClick={handleRetry}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors"
                id="retry-scan-btn">
                ↩ Retry Face Scan
              </button>
              <button onClick={() => navigate('/register')}
                className="w-full py-3 border border-slate-600 text-slate-300 font-semibold rounded-2xl hover:bg-slate-700 transition-colors text-sm"
                id="go-register-btn">
                Not registered? Register Now
              </button>
            </>
          )}

          <button onClick={() => navigate('/')}
            className="w-full py-2 text-slate-500 text-sm font-medium hover:text-slate-300 transition-colors"
            id="auth-back-btn">
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html:`
        @keyframes scanLine {
          0%   { top:4%;  opacity:0 }
          8%   { opacity:1 }
          92%  { opacity:1 }
          100% { top:96%; opacity:0 }
        }
      `}}/>
    </div>
  )
}
