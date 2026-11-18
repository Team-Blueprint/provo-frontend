import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { queryClient } from '@/api/queryClient'
import { AppPreloader } from '@/components/pw/AppPreloader'
import { DemoSimulator } from '@/components/pw/DemoSimulator'
import { RequireAuth } from '@/components/pw/RequireAuth'
import { ToastViewport } from '@/components/ui/toast'
import { AdminPage } from '@/pages/AdminPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { ClientJobsPage } from '@/pages/ClientJobsPage'
import { ClientPage } from '@/pages/ClientPage'
import { DesignSystemPage } from '@/pages/DesignSystemPage'
import { DocsPage } from '@/pages/DocsPage'
import { LandingPage } from '@/pages/LandingPage'
import { LegalPage } from '@/pages/LegalPage'
import { LenderReportPage } from '@/pages/LenderReportPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SetPinPage } from '@/pages/SetPinPage'
import { SignInPage } from '@/pages/SignInPage'
import { SupervisorPage } from '@/pages/SupervisorPage'
import { SupervisorVerifyPage } from '@/pages/SupervisorVerifyPage'
import { UssdSimulatorPage } from '@/pages/UssdSimulatorPage'
import { WorkerConsentPage } from '@/pages/WorkerConsentPage'
import { WorkerHelpPage } from '@/pages/WorkerHelpPage'
import { WorkerJobsPage } from '@/pages/WorkerJobsPage'
import { WorkerPage } from '@/pages/WorkerPage'
import { WorkerProfilePage } from '@/pages/WorkerProfilePage'
import { WorkerSettingsPage } from '@/pages/WorkerSettingsPage'
import { WorkerShareLinkPage } from '@/pages/WorkerShareLinkPage'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [pathname, hash])
  return null
}

export function App() {
  useEffect(() => {
    const onUpdated = () => {
      queryClient.invalidateQueries()
    }
    window.addEventListener('proofwork:demo-updated', onUpdated)
    return () => window.removeEventListener('proofwork:demo-updated', onUpdated)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppPreloader />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/docs/*" element={<DocsPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route
          path="/worker"
          element={
            <RequireAuth role="worker">
              <WorkerPage />
            </RequireAuth>
          }
        />
        <Route
          path="/worker/jobs"
          element={
            <RequireAuth role="worker">
              <WorkerJobsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/worker/consent"
          element={
            <RequireAuth role="worker">
              <WorkerConsentPage />
            </RequireAuth>
          }
        />
        <Route
          path="/worker/share-link"
          element={
            <RequireAuth role="worker">
              <WorkerShareLinkPage />
            </RequireAuth>
          }
        />
        <Route
          path="/worker/profile"
          element={
            <RequireAuth role="worker">
              <WorkerProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/worker/settings"
          element={
            <RequireAuth role="worker">
              <WorkerSettingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/worker/help"
          element={
            <RequireAuth role="worker">
              <WorkerHelpPage />
            </RequireAuth>
          }
        />
        <Route
          path="/client"
          element={
            <RequireAuth role="employer">
              <ClientPage />
            </RequireAuth>
          }
        />
        <Route
          path="/client/jobs"
          element={
            <RequireAuth role="employer">
              <ClientJobsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/employer"
          element={
            <RequireAuth role="employer">
              <ClientPage />
            </RequireAuth>
          }
        />
        <Route
          path="/employer/jobs"
          element={
            <RequireAuth role="employer">
              <ClientJobsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/jobs"
          element={
            <RequireAuth role="employer">
              <ClientJobsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout/:jobId"
          element={
            <RequireAuth role="employer">
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/supervisor"
          element={
            <RequireAuth role="supervisor">
              <SupervisorPage />
            </RequireAuth>
          }
        />
        <Route path="/supervisor/verify" element={<SupervisorVerifyPage />} />
        <Route path="/ussd" element={<UssdSimulatorPage />} />
        <Route path="/report/:reportToken" element={<LenderReportPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminPage />
            </RequireAuth>
          }
        />
        <Route path="/privacy" element={<LegalPage initialPolicy="privacy" />} />
        <Route path="/terms" element={<LegalPage initialPolicy="terms" />} />
        <Route path="/cookies" element={<LegalPage initialPolicy="cookies" />} />
        <Route path="/ndpa" element={<LegalPage initialPolicy="ndpa" />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/set-pin" element={<SetPinPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <DemoSimulator />
      <ToastViewport />
    </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
