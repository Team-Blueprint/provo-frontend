import { Navigate, useLocation } from 'react-router-dom'
import { getSession } from '@/api/session'

interface RequireAuthProps {
  children: React.ReactNode
  role?: 'worker' | 'employer' | 'supervisor'
}

export function RequireAuth({ children, role }: RequireAuthProps) {
  const location = useLocation()
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'

  if (useMock) {
    return <>{children}</>
  }

  const session = getSession()
  if (!session?.accessToken) {
    const query = role ? `?role=${role}` : ''
    return <Navigate to={`/sign-in${query}`} state={{ from: location }} replace />
  }

  return <>{children}</>
}
