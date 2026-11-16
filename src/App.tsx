import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DemoSimulator } from '@/components/pw/DemoSimulator'
import { AdminPage } from '@/pages/AdminPage'
import { ConfirmPage } from '@/pages/ConfirmPage'
import { DesignSystemPage } from '@/pages/DesignSystemPage'
import { LandingPage } from '@/pages/LandingPage'
import { LenderReportPage } from '@/pages/LenderReportPage'
import { PayLinkPage } from '@/pages/PayLinkPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { TermsPage } from '@/pages/TermsPage'
import { WorkerConsentPage } from '@/pages/WorkerConsentPage'
import { WorkerPage } from '@/pages/WorkerPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/worker" element={<WorkerPage />} />
        <Route path="/worker/consent" element={<WorkerConsentPage />} />
        <Route path="/pay/:workerSlug" element={<PayLinkPage />} />
        <Route path="/confirm/:token" element={<ConfirmPage />} />
        <Route path="/report/:reportToken" element={<LenderReportPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
      <DemoSimulator />
    </BrowserRouter>
  )
}

export default App
