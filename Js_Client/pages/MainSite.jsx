import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'
import FeaturesSection from '../components/FeaturesSection'
import ArchitectureSection from '../components/ArchitectureSection'
import HardwareSection from '../components/HardwareSection'
import DemoSection from '../components/DemoSection'
import TechStackSection from '../components/TechStackSection'
import FooterSection from '../components/FooterSection'
import UserSidebar from '../components/UserSidebar'
import IntruderGallery from '../components/IntruderGallery'
import { motion, AnimatePresence } from 'framer-motion'

export default function MainSite() {
  const [intruderOpen, setIntruderOpen] = useState(false)

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden" style={{ background: '#0a0e17', colorScheme: 'dark' }}>
      <Navbar />
      <UserSidebar />
      <IntruderGallery isOpen={intruderOpen} onClose={() => setIntruderOpen(false)} />
      
      {/* Intruder Alert Button */}
      <motion.button
        onClick={() => setIntruderOpen(true)}
        className="fixed bottom-8 right-8 z-[55] flex items-center gap-3 px-5 py-3 rounded-full group transition-all backdrop-blur-md"
        style={{
          background: 'rgba(10, 14, 23, 0.85)',
          border: '1px solid rgba(251, 146, 60, 0.35)',
          boxShadow: '0 0 20px rgba(251, 146, 60, 0.08)',
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(251, 146, 60, 0.2)' }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <span className="text-orange-400 text-base">⚠️</span>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        </div>
        <span className="font-orbitron text-[10px] tracking-widest text-slate-300">VIEW INTRUDERS</span>
      </motion.button>

      {/* Main Content Sections */}
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <ArchitectureSection />
      <HardwareSection />
      <DemoSection />
      <TechStackSection />
      <FooterSection />
    </div>
  )
}
