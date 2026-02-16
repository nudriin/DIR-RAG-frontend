import { useEffect, useState } from "react"
import {
    exportAllConversations,
    getDashboardStats,
    ApiError,
} from "../../api/client"
import type { DashboardStats } from "../../types/api"
import ErrorMessage from "../../components/ErrorMessage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [exporting, setExporting] = useState(false)

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

    useEffect(() => {
        loadStats()
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
        </div>
    )
}
