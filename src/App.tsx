import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DemoSimulator } from '@/components/pw/DemoSimulator'
import { AdminPage } from '@/pages/AdminPage'
import { ClientPage } from '@/pages/ClientPage'
import { DesignSystemPage } from '@/pages/DesignSystemPage'
import { LandingPage } from '@/pages/LandingPage'
import { LegalPage } from '@/pages/LegalPage'
import { LenderReportPage } from '@/pages/LenderReportPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SignInPage } from '@/pages/SignInPage'
import { SupervisorPage } from '@/pages/SupervisorPage'
import { UssdSimulatorPage } from '@/pages/UssdSimulatorPage'
import { WorkerConsentPage } from '@/pages/WorkerConsentPage'
import { WorkerHelpPage } from '@/pages/WorkerHelpPage'
import { WorkerJobsPage } from '@/pages/WorkerJobsPage'
import { WorkerPage } from '@/pages/WorkerPage'
import { WorkerProfilePage } from '@/pages/WorkerProfilePage'
import { WorkerSettingsPage } from '@/pages/WorkerSettingsPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/worker" element={<WorkerPage />} />
        <Route path="/worker/jobs" element={<WorkerJobsPage />} />
        <Route path="/worker/consent" element={<WorkerConsentPage />} />
        <Route path="/worker/profile" element={<WorkerProfilePage />} />
        <Route path="/worker/settings" element={<WorkerSettingsPage />} />
        <Route path="/worker/help" element={<WorkerHelpPage />} />
        <Route path="/client" element={<ClientPage />} />
        <Route path="/supervisor" element={<SupervisorPage />} />
        <Route path="/ussd" element={<UssdSimulatorPage />} />
        <Route path="/report/:reportToken" element={<LenderReportPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/privacy" element={<LegalPage initialPolicy="privacy" />} />
        <Route path="/terms" element={<LegalPage initialPolicy="terms" />} />
        <Route path="/cookies" element={<LegalPage initialPolicy="cookies" />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <DemoSimulator />
    </BrowserRouter>
  )
}

export default App
