import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import {
    Upload,
    Database,
    RotateCcw,
    Clock,
    LayoutDashboard,
    BarChart,
    Menu,
    X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

const isEvaluateEnabled =
    String(import.meta.env.VITE_ADMIN_EVALUATE_ENABLED ?? "true") === "true"
const navItems = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/history", icon: Clock, label: "History" },
    ...(isEvaluateEnabled
        ? [{ to: "/admin/evaluate", icon: BarChart, label: "Evaluate" }]
        : []),
    { to: "/admin/ingest", icon: Upload, label: "Ingest" },
    { to: "/admin/vectors/sources", icon: Database, label: "Sources" },
    { to: "/admin/vectors/reset", icon: RotateCcw, label: "Reset Vectors" },
]

export default function AdminLayout() {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="relative flex min-h-[calc(100vh-64px)] w-full">
            <aside className="sticky top-16 hidden h-[calc(100vh-64px)] border-r bg-muted/40 lg:block lg:w-72">
                <ScrollArea className="h-full py-6 pr-6 pl-4">
                    <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Admin Panel
                    </div>
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-sm"
                                            : "text-muted-foreground",
                                    )
                                }
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </ScrollArea>
            </aside>
            {mobileOpen && (
                <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden">
                    <div
                        className="absolute inset-0"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 h-full w-72 border-r bg-muted/95">
                        <div className="flex h-16 items-center justify-between border-b px-4">
                            <span className="text-sm font-semibold text-foreground">
                                Admin Panel
                            </span>
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground"
                                aria-label="Tutup menu"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <ScrollArea className="h-[calc(100%-64px)] py-6 pr-6 pl-4">
                            <nav className="flex flex-col gap-1">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setMobileOpen(false)}
                                        className={({ isActive }) =>
                                            cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                                isActive
                                                    ? "bg-primary/10 text-primary shadow-sm"
                                                    : "text-muted-foreground",
                                            )
                                        }
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </NavLink>
                                ))}
                            </nav>
                        </ScrollArea>
                    </aside>
                </div>
            )}

            <main className="relative flex-1 overflow-hidden p-4 md:p-8 lg:p-10">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(hsl(var(--primary)/0.4)_1px,transparent_1px)] [background-size:18px_18px]" />
                </div>
                <div className="relative mx-auto max-w-5xl space-y-8">
                    <div className="flex items-center justify-between gap-3 lg:hidden">
                        <div className="text-sm font-semibold text-foreground">
                            Admin Panel
                        </div>
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground"
                            aria-label="Buka menu"
                        >
                            <Menu className="h-4 w-4" />
                        </button>
                    </div>
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
