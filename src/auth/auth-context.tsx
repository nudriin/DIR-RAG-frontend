import { createContext } from "react"
import type { AuthUser, LoginResponse, RefreshResponse } from "@/types/api"

export type AuthState = {
    isAuthenticated: boolean
    accessToken: string | null
    refreshToken: string | null
    user: AuthUser | null
    authMessage: string | null
    login: (payload: LoginResponse) => void
    updateFromRefresh: (payload: RefreshResponse) => void
    logout: (message?: string) => void
    clearMessage: () => void
}

export const AuthContext = createContext<AuthState | null>(null)
