import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { useTheme } from '@/contexts/ThemeContext'
import { websocketService } from '@/services/websocketService'

export const AppLayout: React.FC = () => {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    websocketService.init()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-900 selection:text-white pb-16 md:pb-0 transition-colors duration-150">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <MobileBottomNav />
      <Toaster position="top-right" richColors closeButton theme={resolvedTheme} />
    </div>
  )
}
