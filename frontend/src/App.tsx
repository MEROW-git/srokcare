import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppLayout } from '@/layouts/AppLayout'

// Pages
import { LandingPage } from '@/pages/LandingPage'
import { FeedPage } from '@/pages/FeedPage'
import { MapPage } from '@/pages/MapPage'
import { CreateReportPage } from '@/pages/CreateReportPage'
import { ReportDetailsPage } from '@/pages/ReportDetailsPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { LoginPage } from '@/pages/LoginPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { MyReportsPage } from '@/pages/MyReportsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
    },
  },
})

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/reports/new" element={<CreateReportPage />} />
                <Route path="/reports/:id" element={<ReportDetailsPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:identifier" element={<ProfilePage />} />
                <Route path="/my-reports" element={<MyReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
)
}

export default App
