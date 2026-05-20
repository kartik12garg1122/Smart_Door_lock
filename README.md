# Smart Secure – Automated Door Locking System

A biometric smart door lock using **Face Recognition + OTP** with React frontend and Python Flask backend.

---

## 🚀 Quick Start

### 1. Frontend (React)

```bash
cd "E:\IP Project II\Attempt2"
npm install
npm run dev
```

Opens at **http://localhost:5173**

### 2. Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Runs at **http://localhost:5000**

> **Demo Mode**: If no `trainer/trainer.yml` exists, the backend runs in **mock mode** and always returns success. Perfect for demonstrating the UI without hardware.

---

## 📁 Project Structure

```
Attempt2/
├── src/
│   ├── pages/
│   │   ├── AuthPage.jsx       # Face scan login page
│   │   └── MainSite.jsx       # Main animated website
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── HeroSection.jsx
│   │   ├── AboutSection.jsx
│   │   ├── FeaturesSection.jsx
│   │   ├── ArchitectureSection.jsx
│   │   ├── HardwareSection.jsx
│   │   ├── DemoSection.jsx
│   │   ├── TechStackSection.jsx
│   │   └── FooterSection.jsx
│   └── hooks/
│       └── useInView.js       # Scroll IntersectionObserver hook
├── backend/
│   ├── app.py                 # Flask + OpenCV face recognition
│   ├── requirements.txt
│   └── trainer/               # Place trainer.yml here after training
└── ...
```

---

## 🔐 Authentication Flow

```
User opens site (/)
    → Webcam activates
    → User clicks "Scan Face to Enter"
    → GET /recognize called
    → Flask captures webcam frame + runs LBPH
    → If success → redirect to /main (animated site)
    → If fail → "Access Denied" animation shown
```

---

## 🏗️ Training the Face Model

If you have training data, use your existing `generate_dataset.py` and `train_model.py` scripts and place the resulting `trainer.yml` in `backend/trainer/trainer.yml`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS 3 + Framer Motion |
| Backend | Python Flask + Flask-CORS |
| Face Recognition | OpenCV + LBPH Face Recognizer |
| Hardware | Arduino + Relay + Solenoid Lock + SIM800L |

---

Built by **Team Shalimar** Respected Members are -**Katyayni Sood**;**Harsh Bhardawaj**;**Kartik Garg**;**Jhanavi Abrol** · Computer Science Project
