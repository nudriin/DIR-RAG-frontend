import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    getVectorsSources,
    postVectorsDeleteBySource,
    ApiError,
} from "../../api/client"
import type { VectorSourceEntry } from "../../types/api"
import ErrorMessage from "../../components/ErrorMessage"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, RefreshCw, Eye, Database, Trash2 } from "lucide-react"

export default function VectorsSourcesPage() {
    const [sources, setSources] = useState<VectorSourceEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [deleteSource, setDeleteSource] = useState<string | null>(null)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const navigate = useNavigate()

    const fetchSources = async () => {
        setLoading(true)
        setError(null)
        setSuccess(null)
        try {
            const data = await getVectorsSources()
            setSources(data.sources)
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

    const handleDelete = async () => {
        if (!deleteSource) return
        setDeleting(true)
        setError(null)
        setSuccess(null)
        try {
            const result = await postVectorsDeleteBySource(deleteSource)
            setSources((prev) => prev.filter((s) => s.source !== deleteSource))
            setSuccess(
                `Source "${result.source}" dihapus (${result.deleted_count} chunks).`,
            )
            setDeleteOpen(false)
            setDeleteSource(null)
        } catch (err) {
            if (err instanceof ApiError) {
                setError(`Error ${err.status}: ${err.detail}`)
            } else {
                setError("Terjadi kesalahan jaringan.")
            }
        } finally {
            setDeleting(false)
        }
    }

    useEffect(() => {
        fetchSources()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Vector Sources
                    </h2>
                    <p className="text-muted-foreground">
                        Daftar semua source yang tersimpan di vector store.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchSources}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Refresh
                </Button>
            </div>

            {error && (
                <ErrorMessage
                    message={error}
                    onDismiss={() => setError(null)}
                />
            )}
            {success && (
                <div className="rounded-md bg-green-50 p-4 border border-green-200 dark:bg-green-900/20 dark:border-green-900 text-green-800 dark:text-green-300">
                    <div className="flex items-start justify-between gap-3">
                        <span className="text-sm">{success}</span>
                        <button
                            type="button"
                            onClick={() => setSuccess(null)}
                            className="text-xs font-medium"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Sources List</CardTitle>
                    <CardDescription>
                        Total sources: {sources.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : sources.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <Database className="mb-4 h-12 w-12 opacity-50" />
                            <p>Belum ada source yang tersimpan.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        #
                                    </TableHead>
                                    <TableHead>Source Name</TableHead>
                                    <TableHead className="w-[100px] text-center">
                                        Chunks
                                    </TableHead>
                                    <TableHead className="w-[100px] text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sources.map((s, i) => (
                                    <TableRow key={s.source}>
                                        <TableCell className="font-medium text-muted-foreground">
                                            {i + 1}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {s.source}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                {s.num_chunks}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/vectors/source-detail?source=${encodeURIComponent(s.source)}`,
                                                        )
                                                    }
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Detail
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        setDeleteSource(
                                                            s.source,
                                                        )
                                                        setDeleteOpen(true)
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Source?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Semua chunks dari source{" "}
                            <span className="font-mono font-medium text-foreground">
                                "{deleteSource ?? "-"}"
                            </span>{" "}
                            akan dihapus permanen dari vector store.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleting}
                        >
                            {deleting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
