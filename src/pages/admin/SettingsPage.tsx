import { useEffect, useState } from "react"
import { getSettings, updateSetting, ApiError } from "../../api/client"
import ErrorMessage from "../../components/ErrorMessage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Settings,
    Loader2,
    CheckCircle2,
    Cpu,
    Sparkles,
    ChevronDown,
} from "lucide-react"

const MODEL_OPTIONS = [
    {
        value: "gemini",
        label: "Google Gemini",
        description: "Google Generative AI",
        icon: Sparkles,
    },
    {
        value: "replicate",
        label: "Meta Llama (Replicate)",
        description: "Replicate Cloud API",
        icon: Cpu,
    },
] as const

export default function SettingsPage() {
    const [currentModel, setCurrentModel] = useState<string>("")
    const [selectedModel, setSelectedModel] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const isDirty = selectedModel !== currentModel

    const loadSettings = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getSettings()
            const model = data.settings.refinement_backend ?? "gemini"
            setCurrentModel(model)
            setSelectedModel(model)
        } catch (err) {
            if (err instanceof ApiError) {
                setError(`Error ${err.status}: ${err.detail}`)
            } else {
                setError("Gagal memuat pengaturan.")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setError(null)
        setSuccessMessage(null)
        try {
            const data = await updateSetting({
                key: "refinement_backend",
                value: selectedModel,
            })
            setCurrentModel(data.value)
            setSelectedModel(data.value)
            setSuccessMessage("Pengaturan model berhasil diperbarui.")
            setTimeout(() => setSuccessMessage(null), 4000)
        } catch (err) {
            if (err instanceof ApiError) {
                setError(`Error ${err.status}: ${err.detail}`)
            } else {
                setError("Gagal menyimpan pengaturan.")
            }
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        loadSettings()
    }, [])

    // Close dropdown on outside click
    useEffect(() => {
        if (!dropdownOpen) return
        const close = () => setDropdownOpen(false)
        document.addEventListener("click", close)
        return () => document.removeEventListener("click", close)
    }, [dropdownOpen])

    const selectedOption = MODEL_OPTIONS.find((o) => o.value === selectedModel)

    return (
        <div className="space-y-6">
            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-primary">
                        <Settings className="h-5 w-5" />
                        <CardTitle>Pengaturan Sistem</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <ErrorMessage
                            message={error}
                            onDismiss={() => setError(null)}
                        />
                    )}

                    {successMessage && (
                        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2 duration-300">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            {successMessage}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Model Selection */}
                            <div className="rounded-lg border border-border/60 bg-muted/20 p-5 space-y-4">
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="settings-model-select"
                                        className="text-sm font-semibold"
                                    >
                                        Query Refinement Backend
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Pilih model LLM yang digunakan untuk
                                        query refinement (RQ-RAG).
                                    </p>
                                </div>

                                {/* Custom Dropdown */}
                                <div className="relative max-w-md">
                                    <button
                                        id="settings-model-select"
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setDropdownOpen((prev) => !prev)
                                        }}
                                        className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2.5 text-sm shadow-sm transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            {selectedOption && (
                                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                                                    <selectedOption.icon className="h-3.5 w-3.5 text-primary" />
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <div className="font-medium">
                                                    {selectedOption?.label ??
                                                        "Pilih model..."}
                                                </div>
                                                {selectedOption && (
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {
                                                            selectedOption.description
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronDown
                                            className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                                        />
                                    </button>

                                    {dropdownOpen && (
                                        <div
                                            className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg animate-in fade-in slide-in-from-top-1 duration-150"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {MODEL_OPTIONS.map((opt) => {
                                                const active =
                                                    selectedModel === opt.value
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedModel(
                                                                opt.value,
                                                            )
                                                            setDropdownOpen(
                                                                false,
                                                            )
                                                        }}
                                                        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-accent first:rounded-t-md last:rounded-b-md ${active ? "bg-primary/5 text-primary" : "text-foreground"}`}
                                                    >
                                                        <div
                                                            className={`flex h-7 w-7 items-center justify-center rounded-md ${active ? "bg-primary/10" : "bg-muted"}`}
                                                        >
                                                            <opt.icon
                                                                className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground"}`}
                                                            />
                                                        </div>
                                                        <div className="text-left flex-1">
                                                            <div className="font-medium">
                                                                {opt.label}
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground">
                                                                {
                                                                    opt.description
                                                                }
                                                            </div>
                                                        </div>
                                                        {active && (
                                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Current status chip */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>Model aktif saat ini:</span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">
                                        {MODEL_OPTIONS.find(
                                            (o) => o.value === currentModel,
                                        )?.label ?? currentModel}
                                    </span>
                                </div>
                            </div>

                            {/* Save button */}
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || !isDirty}
                                    className="min-w-[160px]"
                                >
                                    {saving ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                    )}
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
