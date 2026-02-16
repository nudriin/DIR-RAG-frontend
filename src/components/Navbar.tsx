import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"
import { LogOut, Menu, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/auth/useAuth"

export default function Navbar() {
    const location = useLocation()
    const { isAuthenticated, user, logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)
    const isAdminRoute = location.pathname.startsWith("/admin")

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

                <div className="flex items-center gap-3 md:gap-4">
                    <div className="hidden items-center gap-1 md:flex md:gap-2">
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
                        <div className="hidden items-center gap-3 rounded-full border px-3 py-1 text-xs text-muted-foreground lg:flex">
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
                    {!isAdminRoute && (
                        <button
                            type="button"
                            onClick={() => setMobileOpen((prev) => !prev)}
                            className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground md:hidden"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? (
                                <X className="h-4 w-4" />
                            ) : (
                                <Menu className="h-4 w-4" />
                            )}
                        </button>
                    )}
                    <ThemeToggle />
                </div>
            </div>
            {mobileOpen && !isAdminRoute && (
                <div className="border-t bg-background/95 px-4 py-4 md:hidden">
                    <div className="flex flex-col gap-2">
                        <NavLink
                            to="/conversation"
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
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
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
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
                            onClick={() => setMobileOpen(false)}
                            className={() =>
                                `rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                                    location.pathname.startsWith("/admin")
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground"
                                }`
                            }
                        >
                            Admin
                        </NavLink>
                        {isAuthenticated && user && (
                            <div className="mt-2 rounded-md border px-3 py-3 text-xs text-muted-foreground">
                                <div className="font-medium text-foreground">
                                    {user.username}
                                </div>
                                <div className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                                    {user.role}
                                </div>
                                <div className="mt-1">
                                    {formatLastLogin(user.last_login)}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setMobileOpen(false)
                                        logout()
                                    }}
                                    className="mt-2 h-8 px-2 text-xs"
                                >
                                    <LogOut className="mr-1 h-3 w-3" />
                                    Logout
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
