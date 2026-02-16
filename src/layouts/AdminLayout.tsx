import { NavLink, Outlet } from "react-router-dom"
import {
    Upload,
    Database,
    RotateCcw,
    Clock,
    LayoutDashboard,
    BarChart,
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
    return (
        <div className="flex min-h-[calc(100vh-64px)] w-full">
            <aside className="hidden border-r bg-muted/40 md:block md:w-64 lg:w-72">
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

            <main className="relative flex-1 overflow-hidden p-4 md:p-8 lg:p-10">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(hsl(var(--primary)/0.4)_1px,transparent_1px)] [background-size:18px_18px]" />
                </div>
                <div className="relative mx-auto max-w-5xl space-y-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
