export interface AuthUser {
  id: string
  name: string
  phone: string
  isWorker: boolean
  isClient: boolean
  isSupervisor?: boolean
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

const SESSION_KEY = 'proofwork_auth_session_v1'

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function setSession(session: AuthSession): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SESSION_KEY)
}

export function getAccessToken(): string | null {
  return getSession()?.accessToken ?? null
}
