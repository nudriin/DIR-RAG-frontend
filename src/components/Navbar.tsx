import { NavLink, useLocation } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"
import { Sparkles, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/auth/useAuth"

export default function Navbar() {
    const location = useLocation()
    const { isAuthenticated, user, logout } = useAuth()

    const formatLastLogin = (value?: string | null) =>
        value ? new Date(value).toLocaleString("id-ID") : "-"

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-8">
                <NavLink
                    to="/"
                    className="flex items-center gap-2 font-bold transition-colors hover:text-primary/80"
                >
                    <Sparkles className="h-6 w-6 text-primary" />
                    <span className="hidden text-xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent sm:inline-block">
                        Huma Betang
                    </span>
                </NavLink>

                <div className="flex items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-1 md:gap-2">
                        <NavLink
                            to="/conversation"
                            className={({ isActive }) =>
                                `px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-accent-foreground ${
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground"
                                }`
                            }
                        >
                            Conversation
                        </NavLink>
                        <NavLink
                            to="/chat"
                            className={({ isActive }) =>
                                `px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-accent-foreground ${
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground"
                                }`
                            }
                        >
                            Debug Chat
                        </NavLink>
                        <NavLink
                            to="/admin"
                            className={() =>
                                `px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-accent-foreground ${
                                    location.pathname.startsWith("/admin")
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground"
                                }`
                            }
                        >
                            Admin
                        </NavLink>
                    </div>
                    {isAuthenticated && user && (
                        <div className="flex items-center gap-3 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                                {user.username}
                            </span>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                                {user.role}
                            </span>
                            <span>{formatLastLogin(user.last_login)}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => logout()}
                                className="h-7 px-2 text-xs"
                            >
                                <LogOut className="mr-1 h-3 w-3" />
                                Logout
                            </Button>
                        </div>
                    )}
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    )
}
