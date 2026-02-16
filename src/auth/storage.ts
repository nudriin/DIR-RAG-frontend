import type { AuthUser } from "@/types/api"

const ACCESS_TOKEN_KEY = "auth_access_token"
const REFRESH_TOKEN_KEY = "auth_refresh_token"
const USER_KEY = "auth_user"
const AUTH_MESSAGE_KEY = "auth_message"

export type StoredAuth = {
    accessToken: string | null
    refreshToken: string | null
    user: AuthUser | null
}

export function loadAuth(): StoredAuth {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const userRaw = localStorage.getItem(USER_KEY)
    let user: AuthUser | null = null
    if (userRaw) {
        try {
            user = JSON.parse(userRaw) as AuthUser
        } catch {
            user = null
        }
    }
    return { accessToken, refreshToken, user }
}

export function saveAuth(params: {
    accessToken: string
    refreshToken: string
    user: AuthUser | null
}) {
    localStorage.setItem(ACCESS_TOKEN_KEY, params.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, params.refreshToken)
    if (params.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(params.user))
    } else {
        localStorage.removeItem(USER_KEY)
    }
}

export function clearAuth() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

export function setAuthMessage(message: string | null) {
    if (message) {
        localStorage.setItem(AUTH_MESSAGE_KEY, message)
    } else {
        localStorage.removeItem(AUTH_MESSAGE_KEY)
    }
}

export function getAuthMessage() {
    return localStorage.getItem(AUTH_MESSAGE_KEY)
}
