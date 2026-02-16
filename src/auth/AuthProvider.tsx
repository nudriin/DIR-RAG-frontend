import { useCallback, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import type { AuthUser, LoginResponse, RefreshResponse } from "@/types/api"
import {
    clearAuth,
    getAuthMessage,
    loadAuth,
    saveAuth,
    setAuthMessage,
} from "./storage"
import { AuthContext, type AuthState } from "./auth-context"

export function AuthProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate()
    const stored = loadAuth()
    const [accessToken, setAccessToken] = useState<string | null>(
        stored.accessToken,
    )
    const [refreshToken, setRefreshToken] = useState<string | null>(
        stored.refreshToken,
    )
    const [user, setUser] = useState<AuthUser | null>(stored.user)
    const [authMessage, setAuthMessageState] = useState<string | null>(
        getAuthMessage(),
    )

    const isAuthenticated = Boolean(accessToken)

    const login = useCallback((payload: LoginResponse) => {
        setAccessToken(payload.access_token)
        setRefreshToken(payload.refresh_token)
        setUser(payload.user)
        saveAuth({
            accessToken: payload.access_token,
            refreshToken: payload.refresh_token,
            user: payload.user,
        })
        setAuthMessage(null)
        setAuthMessageState(null)
    }, [])

    const updateFromRefresh = useCallback(
        (payload: RefreshResponse) => {
            if (!refreshToken) return
            const nextUser = payload.user ?? user ?? null
            setAccessToken(payload.access_token)
            setRefreshToken(payload.refresh_token)
            setUser(nextUser)
            saveAuth({
                accessToken: payload.access_token,
                refreshToken: payload.refresh_token,
                user: nextUser,
            })
        },
        [refreshToken, user],
    )

    const logout = useCallback(
        (message?: string) => {
            setAccessToken(null)
            setRefreshToken(null)
            setUser(null)
            clearAuth()
            if (message) {
                setAuthMessage(message)
                setAuthMessageState(message)
            } else {
                setAuthMessage(null)
                setAuthMessageState(null)
            }
            navigate("/admin/login", { replace: true })
        },
        [navigate],
    )

    const clearMessage = useCallback(() => {
        setAuthMessage(null)
        setAuthMessageState(null)
    }, [])

    useEffect(() => {
        const handleUpdated = () => {
            const next = loadAuth()
            setAccessToken(next.accessToken)
            setRefreshToken(next.refreshToken)
            setUser(next.user)
        }
        const handleExpired = (event: Event) => {
            const detail = (event as CustomEvent<{ message?: string }>).detail
            logout(detail?.message ?? "Sesi berakhir, silakan login lagi")
        }
        window.addEventListener("auth:updated", handleUpdated)
        window.addEventListener("auth:expired", handleExpired)
        return () => {
            window.removeEventListener("auth:updated", handleUpdated)
            window.removeEventListener("auth:expired", handleExpired)
        }
    }, [logout])

    const value: AuthState = {
        isAuthenticated,
        accessToken,
        refreshToken,
        user,
        authMessage,
        login,
        updateFromRefresh,
        logout,
        clearMessage,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
