'use client'

import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@/lib/types'

const STORAGE_KEY = 'ai-forum-session'

type AuthSession = {
  user: User
  accessToken: string
}

type AuthContextValue = {
  user?: User
  setUser: Dispatch<SetStateAction<User | undefined>>
  accessToken?: string
  isAuthenticated: boolean
  setSession: (session: AuthSession) => void
  clearSession: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
)

function readStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>
    if (parsed.user && parsed.accessToken) {
      return parsed as AuthSession
    }
  } catch {
    // ignore malformed storage entries
  }

  window.localStorage.removeItem(STORAGE_KEY)
  return null
}

function writeStoredSession(session: AuthSession | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | undefined>()
  const [accessToken, setAccessToken] = useState<string | undefined>()

  useEffect(() => {
    const stored = readStoredSession()
    if (stored) {
      setUser(stored.user)
      setAccessToken(stored.accessToken)
    }
  }, [])

  const setSession = useCallback((session: AuthSession) => {
    setUser(session.user)
    setAccessToken(session.accessToken)
    writeStoredSession(session)
  }, [])

  const clearSession = useCallback(() => {
    setUser(undefined)
    setAccessToken(undefined)
    writeStoredSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      setUser,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      setSession,
      clearSession,
    }),
    [user, accessToken, setSession, clearSession]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
