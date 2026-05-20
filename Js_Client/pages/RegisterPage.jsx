import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'

/* ─── Status ───────────────────────────────────────── */
const S = { IDLE:'idle', CAPTURING:'capturing', UPLOADING:'uploading', SUCCESS:'success', ERROR:'error' }
const delay = ms => new Promise(r => setTimeout(r, ms))

/* ─── Corner brackets ──────────────────────────────── */
function CornerBrackets({ color = '#cbd5e1', size = 20 }) {
  const st = { position:'absolute', width:size, height:size }
  const ln = { background: color }
  return (<>
    <div style={{...st,top:0,left:0}}><div style={{...ln,width:'100%',height:3,position:'absolute',top:0,left:0}}/><div style={{...ln,height:'100%',width:3,position:'absolute',top:0,left:0}}/></div>
    <div style={{...st,top:0,right:0}}><div style={{...ln,width:'100%',height:3,position:'absolute',top:0,right:0}}/><div style={{...ln,height:'100%',width:3,position:'absolute',top:0,right:0}}/></div>
    <div style={{...st,bottom:0,left:0}}><div style={{...ln,width:'100%',height:3,position:'absolute',bottom:0,left:0}}/><div style={{...ln,height:'100%',width:3,position:'absolute',bottom:0,left:0}}/></div>
    <div style={{...st,bottom:0,right:0}}><div style={{...ln,width:'100%',height:3,position:'absolute',bottom:0,right:0}}/><div style={{...ln,height:'100%',width:3,position:'absolute',bottom:0,right:0}}/></div>
  </>)
}

/* ─── Camera feed ──────────────────────────────────── */
function CameraFeed({ capturing, webcamRef }) {
  const [camAvail, setCamAvail] = useState(true)
  if (!camAvail) return (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl">
      <div className="text-center text-slate-400">
        <div className="text-4xl mb-2">📷</div>
        <div className="text-sm font-semibold">NO CAMERA — allow camera access</div>
      </div>
    </div>
  )
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <Webcam
        ref={webcamRef} audio={false} mirrored={true}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover bg-slate-900"
        onUserMediaError={() => setCamAvail(false)}
        videoConstraints={{ facingMode:'user', width:640, height:480 }}
      />
      {capturing && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 w-full h-0.5 bg-orange-400/70 blur-[1px]"
            style={{animation:'scanLine 1.8s ease-in-out infinite',top:'50%'}} />
        </div>
      )}
    </div>
  )
}

/* ─── Main ─────────────────────────────────────────── */
export default function RegisterPage() {
  const navigate = useNavigate()
  const webcamRef  = useRef(null)
  const [name,     setName]     = useState('')
  const [status,   setStatus]   = useState(S.IDLE)
  const [progress, setProgress] = useState(0)
  const [msg,      setMsg]      = useState('Enter resident name and face the camera')
  const [captured, setCaptured] = useState(0)

  const isCapturing = status === S.CAPTURING
  const isUploading = status === S.UPLOADING
  const isSuccess   = status === S.SUCCESS
  const isError     = status === S.ERROR
  const busy        = isCapturing || isUploading

  const handleRegister = useCallback(async (e) => {
    e?.preventDefault()

    if (!name.trim()) {
      setMsg('⚠ Please enter the resident name first')
      setStatus(S.ERROR)
      setTimeout(() => { setStatus(S.IDLE); setMsg('Enter resident name and face the camera') }, 3000)
      return
    }

    if (!webcamRef.current?.getScreenshot()) {
      setMsg('⚠ Camera not ready — please allow camera access')
      setStatus(S.ERROR)
      setTimeout(() => { setStatus(S.IDLE); setMsg('Enter resident name and face the camera') }, 3000)
      return
    }

    setStatus(S.CAPTURING)
    setProgress(0)
    setCaptured(0)
    setMsg('Hold still — capturing facial data…')

    const frames = []
    const TOTAL  = 10  // 10 frames at 150ms = 1.5 seconds of varied angles

    try {
      for (let i = 0; i < TOTAL; i++) {
        const frame = webcamRef.current?.getScreenshot()
        if (frame) {
          frames.push(frame)
          setCaptured(frames.length)
          setProgress(Math.round((i + 1) / TOTAL * 70))
          if (i === 3)  setMsg('Slowly move head left and right…')
          if (i === 7) setMsg('Back to center — almost done…')
        }
        await delay(150)
      }

      if (frames.length < 5) {
        throw new Error(`Only ${frames.length} frames captured — check camera and try again`)
      }

      setStatus(S.UPLOADING)
      setProgress(75)
      setMsg(`Uploading ${frames.length} frames and training model…`)

      const res  = await fetch('/api/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim(), images: frames }),
      })

      setProgress(90)

      // Network error guard
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Server error ${res.status}`)
      }

      const data = await res.json()

      if (data.success) {
        setProgress(100)
        setMsg(`✓ ${name.trim()} registered successfully! Redirecting…`)
        setStatus(S.SUCCESS)
        setTimeout(() => navigate('/'), 3000)
      } else {
        throw new Error(data.error || 'Registration failed — please try again')
      }

    } catch (err) {
      console.error('[REGISTER]', err)
      setProgress(0)
      setCaptured(0)
      setMsg(`✗ ${err.message}`)
      setStatus(S.ERROR)
      setTimeout(() => {
        setStatus(S.IDLE)
        setMsg('Enter resident name and face the camera')
      }, 5000)
    }
  }, [name, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans" style={{background:'#060609', color:'#e4e4e7'}}>

      {/* Back button */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <button onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)'}}
          id="reg-back-btn">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div className="px-3 py-1.5 rounded-full flex items-center gap-2" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className={`w-2 h-2 rounded-full ${busy ? 'bg-orange-500 animate-pulse' : isSuccess ? 'bg-green-500' : 'bg-slate-600'}`}/>
          <span className="text-xs font-semibold text-slate-400">
            {isCapturing ? `Capturing ${captured}/10` : isUploading ? 'Training model…' : 'Face Enroller'}
          </span>
        </div>
      </div>

      <div className="w-full max-w-md rounded-3xl shadow-xl overflow-hidden p-8" style={{background:'#0c0c12', border:'1px solid rgba(255,255,255,0.06)'}}>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{color:'#fff'}}>
            {isSuccess ? '✓ Registration Complete' : 'Register Resident'}
          </h1>
          <p className={`text-sm font-medium min-h-[36px] flex items-center justify-center transition-colors
            ${isError ? 'text-orange-400' : isSuccess ? 'text-green-400' : isUploading ? 'text-blue-400' : 'text-slate-500'}`}>
            {msg}
          </p>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500
              ${isError ? 'bg-orange-500' : isSuccess ? 'bg-green-500' : isUploading ? 'bg-blue-500' : 'bg-orange-500'}`}
              style={{width:`${progress}%`}}/>
          </div>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center py-10 gap-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl">✓</div>
            <p className="text-slate-500 text-sm text-center">
              Facial data trained. You will be redirected to the dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-5">

            {/* Name input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'rgba(255,255,255,0.4)'}}>
                Resident Name
              </label>
              <input
                id="reg-name-input"
                type="text"
                placeholder="e.g. Kartik"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={busy}
                className="w-full rounded-xl py-3 px-4 focus:outline-none transition-all disabled:opacity-50"
                style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#fff'}}
              />
            </div>

            {/* Camera */}
            <div className="relative w-full aspect-[4/3] rounded-2xl border-2 border-slate-100 p-2 bg-slate-50 shadow-inner">
              <CornerBrackets
                color={isError ? '#f97316' : isCapturing ? '#f97316' : '#cbd5e1'}
                size={22}
              />
              <CameraFeed capturing={isCapturing} webcamRef={webcamRef} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              id="reg-capture-btn"
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-md shadow-orange-500/20 transition-all"
            >
              {isCapturing ? `Capturing… ${captured}/10` : isUploading ? 'Training model…' : '⬡ Capture Face Data'}
            </button>

            <p className="text-center text-xs text-slate-400">
              Slowly move your head left, right, up and down during capture for best results.
            </p>
          </form>
        )}
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
