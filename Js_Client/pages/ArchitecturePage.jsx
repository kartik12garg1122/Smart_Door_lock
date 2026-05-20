import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/architecture.css';

export default function ArchitecturePage() {
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="arch-page">
      {/* Background from dashboard theme */}
      <div className="dash-bg">
        <div className="dash-bg-glow" />
        <div className="dash-bg-grid" />
      </div>

      <header className="dash-topbar" style={{ position: 'sticky', zIndex: 50 }}>
        <div className="dash-topbar-left">
          <img src="/logo.png" alt="Shalimar Security" className="dash-topbar-logo" />
          <div className="dash-topbar-title">
            Shalimar <span>Security</span>
          </div>
        </div>
        <div className="dash-topbar-right">
          <Link to="/dashboard" className="dash-topbar-btn" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#a1a1aa' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="arch-header" style={{ position: 'relative', zIndex: 10 }}>
        <h1>How It <span>Works</span></h1>
        <p>A deep dive into the hardware and software architecture powering the Shalimar Security biometric smart lock system.</p>
      </div>

      <div className="arch-section" style={{ position: 'relative', zIndex: 10 }}>
        <h2 className="arch-section-title">💻 Software Stack</h2>
        <div className="arch-grid">
          <div className="arch-card">
            <div className="arch-card-icon">⚛️</div>
            <h3 className="arch-card-title">React + Vite Frontend</h3>
            <p className="arch-card-desc">The user interface is built with React and Tailwind CSS, bundled by Vite for lightning-fast hot module replacement. It communicates with the Python backend via secure API proxies.</p>
          </div>
          <div className="arch-card">
            <div className="arch-card-icon">🐍</div>
            <h3 className="arch-card-title">Flask API Backend</h3>
            <p className="arch-card-desc">A robust Python Flask server handles route management, database transactions with SQLAlchemy, and coordinates the heavy-lifting of the facial recognition processes.</p>
          </div>
          <div className="arch-card">
            <div className="arch-card-icon">🧠</div>
            <h3 className="arch-card-title">DeepFace AI Engine</h3>
            <p className="arch-card-desc">Facial embeddings are extracted using FaceNet and verified using cosine similarity through the DeepFace library, providing extreme accuracy and L2-normalization for biometric matching.</p>
          </div>
        </div>
      </div>

      <div className="arch-section" style={{ position: 'relative', zIndex: 10 }}>
        <h2 className="arch-section-title">⚙️ Hardware Integration</h2>
        <div className="arch-grid">
          <div className="arch-card">
            <div className="arch-card-icon">🔌</div>
            <h3 className="arch-card-title">Arduino Microcontroller</h3>
            <p className="arch-card-desc">The brain of the physical lock. It listens for serial commands (OPEN/LOCK) over COM20 from the Python server and controls the high-voltage relay module.</p>
          </div>
          <div className="arch-card">
            <div className="arch-card-icon">🧲</div>
            <h3 className="arch-card-title">Solenoid Lock</h3>
            <p className="arch-card-desc">An electromagnetic solenoid lock that secures the door. It actuates instantly when the Arduino triggers the relay upon a successful face match or OTP verification.</p>
          </div>
          <div className="arch-card">
            <div className="arch-card-icon">🔢</div>
            <h3 className="arch-card-title">Matrix Keypad</h3>
            <p className="arch-card-desc">A 4x4 matrix keypad connected to the Arduino allows manual entry of Time-Based One Time Passwords (OTP) sent to the admin's email for emergency override.</p>
          </div>
        </div>
      </div>

      <div className="arch-section" style={{ position: 'relative', zIndex: 10 }}>
        <h2 className="arch-section-title">🔄 The Authentication Workflow</h2>
        <div className="arch-flow">
          <div className="arch-step">
            <div className="arch-step-num">1</div>
            <div className="arch-step-content">
              <h3>Face Capture</h3>
              <p>The React frontend accesses the webcam via the browser's MediaDevices API. It captures a frame when a face is detected and sends it to the Flask server as a base64 encoded string.</p>
            </div>
          </div>
          <div className="arch-step">
            <div className="arch-step-num">2</div>
            <div className="arch-step-content">
              <h3>Biometric Extraction & Matching</h3>
              <p>The server decodes the image and passes it to DeepFace. The AI extracts a 512-dimensional embedding and compares it against stored resident templates using cosine similarity.</p>
            </div>
          </div>
          <div className="arch-step">
            <div className="arch-step-num">3</div>
            <div className="arch-step-content">
              <h3>Hardware Actuation</h3>
              <p>If the match confidence exceeds the threshold, the server logs the "Granted" event and sends an 'OPEN' command over the COM port to the Arduino, which triggers the relay to open the door.</p>
            </div>
          </div>
          <div className="arch-step">
            <div className="arch-step-num">4</div>
            <div className="arch-step-content">
              <h3>Fallback Protocol (OTP)</h3>
              <p>If the face is unknown, an intruder snapshot is saved and the event is logged. An OTP is generated, sent to the admin via SMTP, and also transmitted to the Arduino. The visitor must enter this OTP on the physical keypad to gain entry.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
