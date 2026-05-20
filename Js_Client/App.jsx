import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import MainSite from './pages/MainSite'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import ShopPage from './pages/ShopPage'
import StudioPage from './pages/StudioPage'
import DashboardPage from './pages/DashboardPage'
import ArchitecturePage from './pages/ArchitecturePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<DashboardPage />} />
        <Route path="/home"      element={<StudioPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/how-it-works" element={<ArchitecturePage />} />
        <Route path="/shop"      element={<ShopPage />} />
        <Route path="/auth"      element={<AuthPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route path="/settings"  element={<SettingsPage />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
