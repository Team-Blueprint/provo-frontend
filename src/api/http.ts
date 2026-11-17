import { clearSession, getSession, setSession } from './session'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  const session = getSession()
  if (!session?.refreshToken) return null

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refreshToken }),
      })
      if (!res.ok) {
        clearSession()
        return null
      }
      const data = (await res.json()) as {
        access_token: string
        refresh_token: string
        user_id: string
        name: string
        phone: string
        is_worker: boolean
        is_client: boolean
      }
      setSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: {
          id: data.user_id,
          name: data.name,
          phone: data.phone,
          isWorker: data.is_worker,
          isClient: data.is_client,
        },
      })
      return data.access_token
    } catch {
      clearSession()
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...init } = options
  const headers = new Headers(customHeaders)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (!skipAuth) {
    const token = getSession()?.accessToken
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  let res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })

  if (res.status === 401 && !skipAuth && path !== '/auth/refresh') {
    const nextToken = await refreshAccessToken()
    if (nextToken) {
      headers.set('Authorization', `Bearer ${nextToken}`)
      res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const errBody = (await res.json()) as { detail?: string | Array<{ msg?: string }> }
      if (typeof errBody.detail === 'string') {
        message = errBody.detail
      } else if (Array.isArray(errBody.detail) && errBody.detail[0]?.msg) {
        message = errBody.detail[0].msg
      }
    } catch {
      // keep default status message when body is non-JSON
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}
