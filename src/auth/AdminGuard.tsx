import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./useAuth"

export default function AdminGuard({ children }: { children: ReactNode }) {
    const { isAuthenticated, accessToken } = useAuth()
    const location = useLocation()

    if (!isAuthenticated || !accessToken) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: location.pathname }}
            />
        )
    }

    return <>{children}</>
}
