import { useEffect, useState } from "react"
import {
    exportAllConversations,
    getDashboardStats,
    postAdminRegister,
    ApiError,
} from "../../api/client"
import type { DashboardStats } from "../../types/api"
import ErrorMessage from "../../components/ErrorMessage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/auth/useAuth"
import { isValidUsername, validatePassword } from "@/utils/auth"
import { Loader2, RefreshCw, UserPlus } from "lucide-react"

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [exporting, setExporting] = useState(false)
    const [registerEmail, setRegisterEmail] = useState("")
    const [registerUsername, setRegisterUsername] = useState("")
    const [registerPassword, setRegisterPassword] = useState("")
    const [registerLoading, setRegisterLoading] = useState(false)
    const [registerSuccess, setRegisterSuccess] = useState<string | null>(null)
    const [registerError, setRegisterError] = useState<string | null>(null)
    const { user } = useAuth()

    const formatDate = (value?: string) =>
        value ? new Date(value).toLocaleString("id-ID") : "-"

    const loadStats = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getDashboardStats()
            setStats(data)
        } catch (err) {
            if (err instanceof ApiError) {
                setError(`Error ${err.status}: ${err.detail}`)
            } else {
                setError("Terjadi kesalahan jaringan.")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleExportAll = async () => {
        setExporting(true)
        setError(null)
        try {
            await exportAllConversations()
        } catch (err) {
            if (err instanceof ApiError) {
                setError(`Error ${err.status}: ${err.detail}`)
            } else {
                setError("Terjadi kesalahan jaringan.")
            }
        } finally {
            setExporting(false)
        }
    }

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault()
        setRegisterError(null)
        setRegisterSuccess(null)
        if (!registerEmail.trim()) {
            setRegisterError("Email wajib diisi.")
            return
        }
        if (!isValidUsername(registerUsername)) {
            setRegisterError("Username minimal 3 karakter.")
            return
        }
        const passwordErrors = validatePassword(registerPassword)
        if (passwordErrors.length > 0) {
            setRegisterError(passwordErrors[0])
            return
        }
        setRegisterLoading(true)
        try {
            const data = await postAdminRegister({
                email: registerEmail.trim(),
                username: registerUsername.trim(),
                password: registerPassword,
            })
            setRegisterSuccess(
                `Admin ${data.username} (${data.role}) berhasil ditambahkan.`,
            )
            setRegisterEmail("")
            setRegisterUsername("")
            setRegisterPassword("")
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 429) {
                    setRegisterError(
                        "Terlalu banyak percobaan registrasi, coba lagi nanti.",
                    )
                } else {
                    setRegisterError(`Error ${err.status}: ${err.detail}`)
                }
            } else {
                setRegisterError("Terjadi kesalahan jaringan.")
            }
        } finally {
            setRegisterLoading(false)
        }
    }

    useEffect(() => {
        loadStats()
    }, [])

    useEffect(() => {
        const handler = () => {
            loadStats()
        }
        window.addEventListener("history:deleted", handler)
        return () => {
            window.removeEventListener("history:deleted", handler)
        }
    }, [])

    return (
        <div className="space-y-6">
            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>Dashboard Statistik</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleExportAll}
                                disabled={exporting}
                            >
                                {exporting ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                )}
                                Export All (JSON)
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={loadStats}
                                disabled={loading}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <ErrorMessage
                            message={error}
                            onDismiss={() => setError(null)}
                        />
                    )}
                    {!stats && loading && (
                        <div className="flex items-center justify-center py-6">
                            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    {stats && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-md border px-4 py-3">
                                <div className="text-xs text-muted-foreground">
                                    Total Conversations
                                </div>
                                <div className="mt-2 text-2xl font-semibold">
                                    {stats.total_conversations}
                                </div>
                            </div>
                            <div className="rounded-md border px-4 py-3">
                                <div className="text-xs text-muted-foreground">
                                    Total Messages
                                </div>
                                <div className="mt-2 text-2xl font-semibold">
                                    {stats.total_messages}
                                </div>
                            </div>
                            <div className="rounded-md border px-4 py-3">
                                <div className="text-xs text-muted-foreground">
                                    Average Confidence
                                </div>
                                <div className="mt-2 text-2xl font-semibold">
                                    {(stats.avg_confidence * 100).toFixed(1)}%
                                </div>
                            </div>
                            <div className="rounded-md border px-4 py-3">
                                <div className="text-xs text-muted-foreground">
                                    Last Activity
                                </div>
                                <div className="mt-2 text-sm font-medium">
                                    {formatDate(stats.last_activity)}
                                </div>
                            </div>
                            <div className="rounded-md border px-4 py-3">
                                <div className="text-xs text-muted-foreground">
                                    Total Feedback
                                </div>
                                <div className="mt-2 text-2xl font-semibold">
                                    {stats.total_feedback}
                                </div>
                            </div>
                            <div className="rounded-md border px-4 py-3">
                                <div className="text-xs text-muted-foreground">
                                    Rata-rata Skor Feedback
                                </div>
                                <div className="mt-2 text-2xl font-semibold">
                                    {stats.avg_feedback_score == null
                                        ? "Belum ada feedback"
                                        : `${stats.avg_feedback_score.toFixed(
                                              1,
                                          )} / 5`}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-primary">
                        <UserPlus className="h-5 w-5" />
                        <CardTitle>Registrasi Admin Baru</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {user?.role !== "super_admin" ? (
                        <div className="rounded-md border border-dashed p-4 text-xs text-muted-foreground">
                            Hanya super_admin yang dapat menambahkan admin baru.
                        </div>
                    ) : (
                        <>
                            {registerError && (
                                <ErrorMessage
                                    message={registerError}
                                    onDismiss={() => setRegisterError(null)}
                                />
                            )}
                            {registerSuccess && (
                                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200">
                                    {registerSuccess}
                                </div>
                            )}
                            <form
                                onSubmit={handleRegister}
                                className="grid gap-4 sm:grid-cols-2"
                            >
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="admin-email">Email</Label>
                                    <Input
                                        id="admin-email"
                                        type="email"
                                        value={registerEmail}
                                        onChange={(event) =>
                                            setRegisterEmail(event.target.value)
                                        }
                                        placeholder="admin2@test.com"
                                        disabled={registerLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="admin-username">
                                        Username
                                    </Label>
                                    <Input
                                        id="admin-username"
                                        value={registerUsername}
                                        onChange={(event) =>
                                            setRegisterUsername(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="admin2"
                                        disabled={registerLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="admin-password">
                                        Password
                                    </Label>
                                    <Input
                                        id="admin-password"
                                        type="password"
                                        value={registerPassword}
                                        onChange={(event) =>
                                            setRegisterPassword(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="StrongPass1!"
                                        disabled={registerLoading}
                                    />
                                </div>
                                <div className="sm:col-span-2 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={registerLoading}
                                    >
                                        {registerLoading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : null}
                                        Tambah Admin
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
