import { useCallback, useEffect, useRef, useState } from "react"
import {
    getSettings,
    updateSetting,
    uploadGeminiServiceAccount,
    getGeminiSaStatus,
    ApiError,
} from "../../api/client"
import type { GeminiSaStatusResponse } from "../../api/client"
import ErrorMessage from "../../components/ErrorMessage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Settings,
    Loader2,
    CheckCircle2,
    Cpu,
    Sparkles,
    ChevronDown,
    Key,
    Cloud,
    Upload,
    FileJson,
    AlertCircle,
    Info,
    ShieldCheck,
} from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────

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

const GEMINI_MODE_OPTIONS = [
    {
        value: "api_key",
        label: "API Key (Google AI Studio)",
        description: "Gunakan GOOGLE_API_KEY dari environment untuk autentikasi langsung.",
        icon: Key,
    },
    {
        value: "vertex_ai",
        label: "Vertex AI (Service Account)",
        description: "Gunakan Service Account JSON untuk enterprise & production deployment.",
        icon: Cloud,
    },
] as const

const GENERATOR_BACKEND_OPTIONS = [
    {
        value: "gemini",
        label: "Google Gemini",
        description: "Gunakan model Gemini (via SDK atau Vertex AI).",
        icon: Sparkles,
    },
    {
        value: "openai",
        label: "OpenAI GPT",
        description: "Gunakan model OpenAI (ChatGPT) via API Key.",
        icon: Cpu,
    },
] as const

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
    // --- Refinement backend state ---
    const [currentModel, setCurrentModel] = useState<string>("")
    const [selectedModel, setSelectedModel] = useState<string>("")
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [refinementModelGemini, setRefinementModelGemini] = useState<string>("gemini-2.0-flash")
    const [currentRefinementModelGemini, setCurrentRefinementModelGemini] = useState<string>("gemini-2.0-flash")
    const [refinementModelReplicate, setRefinementModelReplicate] = useState<string>("meta/meta-llama-3-70b-instruct")
    const [currentRefinementModelReplicate, setCurrentRefinementModelReplicate] = useState<string>("meta/meta-llama-3-70b-instruct")

    // --- Gemini mode state ---
    const [currentGeminiMode, setCurrentGeminiMode] = useState<string>("api_key")
    const [selectedGeminiMode, setSelectedGeminiMode] = useState<string>("api_key")
    const [vertexProject, setVertexProject] = useState<string>("")
    const [vertexLocation, setVertexLocation] = useState<string>("us-central1")
    const [currentVertexProject, setCurrentVertexProject] = useState<string>("")
    const [currentVertexLocation, setCurrentVertexLocation] = useState<string>("us-central1")

    // --- Generator backend state ---
    const [currentGeneratorBackend, setCurrentGeneratorBackend] = useState<string>("gemini")
    const [selectedGeneratorBackend, setSelectedGeneratorBackend] = useState<string>("gemini")
    const [generatorDropdownOpen, setGeneratorDropdownOpen] = useState(false)
    const [generatorModelGemini, setGeneratorModelGemini] = useState<string>("gemini-2.0-flash")
    const [currentGeneratorModelGemini, setCurrentGeneratorModelGemini] = useState<string>("gemini-2.0-flash")
    const [generatorModelOpenai, setGeneratorModelOpenai] = useState<string>("gpt-4o")
    const [currentGeneratorModelOpenai, setCurrentGeneratorModelOpenai] = useState<string>("gpt-4o")

    // --- SA JSON upload state ---
    const [saStatus, setSaStatus] = useState<GeminiSaStatusResponse | null>(null)
    const [saFile, setSaFile] = useState<File | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // --- General state ---
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [savingGemini, setSavingGemini] = useState(false)
    const [savingGenerator, setSavingGenerator] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [geminiSuccessMessage, setGeminiSuccessMessage] = useState<string | null>(null)
    const [geminiError, setGeminiError] = useState<string | null>(null)
    const [generatorSuccessMessage, setGeneratorSuccessMessage] = useState<string | null>(null)
    const [generatorError, setGeneratorError] = useState<string | null>(null)

    const isModelDirty = 
        selectedModel !== currentModel ||
        refinementModelGemini !== currentRefinementModelGemini ||
        refinementModelReplicate !== currentRefinementModelReplicate
    const isGeminiDirty =
        selectedGeminiMode !== currentGeminiMode ||
        vertexProject !== currentVertexProject ||
        vertexLocation !== currentVertexLocation

    const isGeneratorDirty = 
        selectedGeneratorBackend !== currentGeneratorBackend ||
        generatorModelGemini !== currentGeneratorModelGemini ||
        generatorModelOpenai !== currentGeneratorModelOpenai

    // ─── Loaders ─────────────────────────────────────────────────────────────

    const loadSettings = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getSettings()
            const model = data.settings.refinement_backend ?? "gemini"
            setCurrentModel(model)
            setSelectedModel(model)

            const refModelGemini = data.settings.refinement_model_gemini ?? "gemini-2.5-pro"
            setCurrentRefinementModelGemini(refModelGemini)
            setRefinementModelGemini(refModelGemini)

            const refModelReplicate = data.settings.refinement_model_replicate ?? "meta/meta-llama-3-70b-instruct"
            setCurrentRefinementModelReplicate(refModelReplicate)
            setRefinementModelReplicate(refModelReplicate)

            const geminiMode = data.settings.gemini_mode ?? "api_key"
            setCurrentGeminiMode(geminiMode)
            setSelectedGeminiMode(geminiMode)

            const vProject = data.settings.vertex_project ?? ""
            const vLocation = data.settings.vertex_location ?? "us-central1"
            setCurrentVertexProject(vProject)
            setVertexProject(vProject)
            setCurrentVertexLocation(vLocation)
            setVertexLocation(vLocation)

            const genBackend = data.settings.generator_backend ?? "gemini"
            setCurrentGeneratorBackend(genBackend)
            setSelectedGeneratorBackend(genBackend)

            const genModelGemini = data.settings.generator_model_gemini ?? "gemini-2.0-flash"
            setCurrentGeneratorModelGemini(genModelGemini)
            setGeneratorModelGemini(genModelGemini)

            const genModelOpenai = data.settings.generator_model_openai ?? "gpt-4o"
            setCurrentGeneratorModelOpenai(genModelOpenai)
            setGeneratorModelOpenai(genModelOpenai)
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

    const loadSaStatus = async () => {
        try {
            const status = await getGeminiSaStatus()
            setSaStatus(status)
        } catch {
            // silent — SA status is non-critical
        }
    }

    // ─── Handlers — Refinement Backend ───────────────────────────────────────

    const handleSaveModel = async () => {
        setSaving(true)
        setError(null)
        setSuccessMessage(null)
        try {
            await updateSetting({ key: "refinement_backend", value: selectedModel })
            await updateSetting({ key: "refinement_model_gemini", value: refinementModelGemini })
            await updateSetting({ key: "refinement_model_replicate", value: refinementModelReplicate })
            
            setCurrentModel(selectedModel)
            setCurrentRefinementModelGemini(refinementModelGemini)
            setCurrentRefinementModelReplicate(refinementModelReplicate)

            setSuccessMessage("Pengaturan Query Refinement Backend berhasil disimpan.")
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

    // ─── Handlers — Gemini Mode ───────────────────────────────────────────────

    const handleSaveGeminiMode = async () => {
        setSavingGemini(true)
        setGeminiError(null)
        setGeminiSuccessMessage(null)
        try {
            await updateSetting({ key: "gemini_mode", value: selectedGeminiMode })
            await updateSetting({ key: "vertex_project", value: vertexProject })
            await updateSetting({ key: "vertex_location", value: vertexLocation })

            setCurrentGeminiMode(selectedGeminiMode)
            setCurrentVertexProject(vertexProject)
            setCurrentVertexLocation(vertexLocation)
            setGeminiSuccessMessage("Pengaturan Gemini berhasil disimpan.")
            setTimeout(() => setGeminiSuccessMessage(null), 4000)
        } catch (err) {
            if (err instanceof ApiError) {
                setGeminiError(`Error ${err.status}: ${err.detail}`)
            } else {
                setGeminiError("Gagal menyimpan pengaturan Gemini.")
            }
        } finally {
            setSavingGemini(false)
        }
    }

    // ─── Handlers — Generator Backend ─────────────────────────────────────────

    const handleSaveGeneratorMode = async () => {
        setSavingGenerator(true)
        setGeneratorError(null)
        setGeneratorSuccessMessage(null)
        try {
            await updateSetting({ key: "generator_backend", value: selectedGeneratorBackend })
            await updateSetting({ key: "generator_model_gemini", value: generatorModelGemini })
            await updateSetting({ key: "generator_model_openai", value: generatorModelOpenai })

            setCurrentGeneratorBackend(selectedGeneratorBackend)
            setCurrentGeneratorModelGemini(generatorModelGemini)
            setCurrentGeneratorModelOpenai(generatorModelOpenai)
            
            setGeneratorSuccessMessage("Pengaturan Generator Backend berhasil disimpan.")
            setTimeout(() => setGeneratorSuccessMessage(null), 4000)
        } catch (err) {
            if (err instanceof ApiError) {
                setGeneratorError(`Error ${err.status}: ${err.detail}`)
            } else {
                setGeneratorError("Gagal menyimpan pengaturan Generator Backend.")
            }
        } finally {
            setSavingGenerator(false)
        }
    }

    // ─── Handlers — SA JSON Upload ────────────────────────────────────────────

    const handleFileSelect = (file: File) => {
        if (!file.name.endsWith(".json")) {
            setUploadError("File harus berekstensi .json")
            return
        }
        setSaFile(file)
        setUploadError(null)
    }

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFileSelect(file)
    }, [])

    const handleUpload = async () => {
        if (!saFile) return
        setUploading(true)
        setUploadError(null)
        setUploadSuccess(null)
        try {
            const res = await uploadGeminiServiceAccount(saFile)
            setUploadSuccess(
                `SA JSON berhasil diunggah — project: ${res.project_id ?? "N/A"}`
            )
            setSaFile(null)
            await loadSaStatus()
            setTimeout(() => setUploadSuccess(null), 5000)
        } catch (err) {
            if (err instanceof ApiError) {
                setUploadError(`Upload gagal: ${err.detail}`)
            } else {
                setUploadError("Upload gagal. Coba lagi.")
            }
        } finally {
            setUploading(false)
        }
    }

    // ─── Effects ──────────────────────────────────────────────────────────────

    useEffect(() => {
        loadSettings()
        loadSaStatus()
    }, [])

    useEffect(() => {
        if (!dropdownOpen && !generatorDropdownOpen) return
        const close = () => {
            setDropdownOpen(false)
            setGeneratorDropdownOpen(false)
        }
        document.addEventListener("click", close)
        return () => document.removeEventListener("click", close)
    }, [dropdownOpen, generatorDropdownOpen])

    const selectedOption = MODEL_OPTIONS.find((o) => o.value === selectedModel)

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* ── Card 1: Query Refinement Backend ──────────────────────── */}
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

                                {/* Custom Model Names */}
                                <div className="space-y-4 pt-4 border-t border-border/40 max-w-md">
                                    {selectedModel === "gemini" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="refinement-gemini-model-name">
                                                Nama Model Gemini
                                            </Label>
                                            <Input
                                                id="refinement-gemini-model-name"
                                                value={refinementModelGemini}
                                                onChange={(e) => setRefinementModelGemini(e.target.value)}
                                                placeholder="e.g. gemini-2.5-pro"
                                                className="bg-background"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Versi model Google Gemini yang digunakan untuk Query Refinement.
                                            </p>
                                        </div>
                                    )}
                                    {selectedModel === "replicate" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="refinement-replicate-model-name">
                                                Nama Model Replicate
                                            </Label>
                                            <Input
                                                id="refinement-replicate-model-name"
                                                value={refinementModelReplicate}
                                                onChange={(e) => setRefinementModelReplicate(e.target.value)}
                                                placeholder="e.g. meta/meta-llama-3-70b-instruct"
                                                className="bg-background"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Versi model Replicate yang digunakan untuk Query Refinement.
                                            </p>
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
                                    onClick={handleSaveModel}
                                    disabled={saving || !isModelDirty}
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

            {/* ── Card 2: Generator Backend (DRAGIN) ────────────────────── */}
            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-primary">
                        <Cpu className="h-5 w-5" />
                        <CardTitle>Generator Backend (DRAGIN)</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Pilih model LLM yang digunakan untuk RAG generator dan perhitungan logprobs (Uncertainty).
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {generatorError && (
                        <ErrorMessage
                            message={generatorError}
                            onDismiss={() => setGeneratorError(null)}
                        />
                    )}

                    {generatorSuccessMessage && (
                        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2 duration-300">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            {generatorSuccessMessage}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Generator Selection */}
                            <div className="rounded-lg border border-border/60 bg-muted/20 p-5 space-y-4">
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="settings-generator-select"
                                        className="text-sm font-semibold"
                                    >
                                        Pilih Penyedia LLM
                                    </Label>
                                </div>

                                {/* Custom Dropdown */}
                                <div className="relative max-w-md">
                                    <button
                                        id="settings-generator-select"
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setGeneratorDropdownOpen((prev) => !prev)
                                        }}
                                        className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2.5 text-sm shadow-sm transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            {GENERATOR_BACKEND_OPTIONS.find(o => o.value === selectedGeneratorBackend) && (
                                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                                                    {(() => {
                                                        const Icon = GENERATOR_BACKEND_OPTIONS.find(o => o.value === selectedGeneratorBackend)!.icon;
                                                        return <Icon className="h-3.5 w-3.5 text-primary" />;
                                                    })()}
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <div className="font-medium">
                                                    {GENERATOR_BACKEND_OPTIONS.find(o => o.value === selectedGeneratorBackend)?.label ?? "Pilih penyedia..."}
                                                </div>
                                                {GENERATOR_BACKEND_OPTIONS.find(o => o.value === selectedGeneratorBackend) && (
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {GENERATOR_BACKEND_OPTIONS.find(o => o.value === selectedGeneratorBackend)?.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronDown
                                            className={`h-4 w-4 text-muted-foreground transition-transform ${generatorDropdownOpen ? "rotate-180" : ""}`}
                                        />
                                    </button>

                                    {generatorDropdownOpen && (
                                        <div
                                            className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg animate-in fade-in slide-in-from-top-1 duration-150"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {GENERATOR_BACKEND_OPTIONS.map((opt) => {
                                                const active = selectedGeneratorBackend === opt.value
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedGeneratorBackend(opt.value)
                                                            setGeneratorDropdownOpen(false)
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
                                                                {opt.description}
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

                                {/* Custom Model Names */}
                                <div className="space-y-4 pt-4 border-t border-border/40 max-w-md">
                                    {selectedGeneratorBackend === "gemini" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="gemini-model-name">
                                                Nama Model Gemini
                                            </Label>
                                            <Input
                                                id="gemini-model-name"
                                                value={generatorModelGemini}
                                                onChange={(e) => setGeneratorModelGemini(e.target.value)}
                                                placeholder="e.g. gemini-2.0-flash"
                                                className="bg-background"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Versi model Google Gemini yang digunakan.
                                            </p>
                                        </div>
                                    )}
                                    {selectedGeneratorBackend === "openai" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="openai-model-name">
                                                Nama Model OpenAI
                                            </Label>
                                            <Input
                                                id="openai-model-name"
                                                value={generatorModelOpenai}
                                                onChange={(e) => setGeneratorModelOpenai(e.target.value)}
                                                placeholder="e.g. gpt-4o"
                                                className="bg-background"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Versi model OpenAI yang digunakan. Pastikan model tersebut mendukung flag <code className="text-primary font-mono text-[10px]">logprobs: true</code>.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Save button */}
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSaveGeneratorMode}
                                    disabled={savingGenerator || !isGeneratorDirty}
                                    className="min-w-[160px]"
                                >
                                    {savingGenerator ? (
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

            {/* ── Card 2: Gemini Authentication Mode ───────────────────── */}
            {!loading && (
                <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-primary">
                            <ShieldCheck className="h-5 w-5" />
                            <CardTitle>Gemini Authentication Mode</CardTitle>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Pilih cara autentikasi ke Google Gemini: API Key langsung atau Vertex AI via Service Account.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {geminiError && (
                            <ErrorMessage
                                message={geminiError}
                                onDismiss={() => setGeminiError(null)}
                            />
                        )}

                        {geminiSuccessMessage && (
                            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2 duration-300">
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                {geminiSuccessMessage}
                            </div>
                        )}

                        {/* Radio Cards */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {GEMINI_MODE_OPTIONS.map((opt) => {
                                const active = selectedGeminiMode === opt.value
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        id={`gemini-mode-${opt.value}`}
                                        onClick={() => setSelectedGeminiMode(opt.value)}
                                        className={`relative flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                                            active
                                                ? "border-primary bg-primary/5 shadow-sm"
                                                : "border-border/60 bg-muted/10 hover:border-primary/40"
                                        }`}
                                    >
                                        {active && (
                                            <span className="absolute right-3 top-3">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                            </span>
                                        )}
                                        <div
                                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-primary/15" : "bg-muted"}`}
                                        >
                                            <opt.icon
                                                className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`}
                                            />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm">
                                                {opt.label}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                {opt.description}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Panel: API Key mode */}
                        {selectedGeminiMode === "api_key" && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-800 dark:bg-blue-900/20 animate-in fade-in duration-200">
                                <div className="flex items-start gap-2">
                                    <Info className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-300 flex-shrink-0" />
                                    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                        <p className="font-semibold">Mode: Google AI Studio (API Key)</p>
                                        <p>
                                            API Key diambil langsung dari environment variable{" "}
                                            <code className="rounded bg-blue-100 dark:bg-blue-800 px-1 py-0.5 font-mono text-[11px]">
                                                GOOGLE_API_KEY
                                            </code>{" "}
                                            di file <code className="rounded bg-blue-100 dark:bg-blue-800 px-1 py-0.5 font-mono text-[11px]">.env</code>.
                                        </p>
                                        <p className="text-blue-600/80 dark:text-blue-400/80">
                                            Tidak ada konfigurasi tambahan yang diperlukan di sini.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Panel: Vertex AI mode */}
                        {selectedGeminiMode === "vertex_ai" && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                {/* Project & Location */}
                                <div className="rounded-lg border border-border/60 bg-muted/20 p-5 space-y-4">
                                    <p className="text-xs font-semibold text-foreground">
                                        Konfigurasi Vertex AI
                                    </p>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="vertex-project"
                                                className="text-xs font-medium"
                                            >
                                                Google Cloud Project ID
                                            </Label>
                                            <Input
                                                id="vertex-project"
                                                placeholder="my-gcp-project-id"
                                                value={vertexProject}
                                                onChange={(e) =>
                                                    setVertexProject(e.target.value)
                                                }
                                                className="h-9 text-sm"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                ID project GCP yang memiliki akses ke Vertex AI.
                                            </p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="vertex-location"
                                                className="text-xs font-medium"
                                            >
                                                Region / Location
                                            </Label>
                                            <Input
                                                id="vertex-location"
                                                placeholder="us-central1"
                                                value={vertexLocation}
                                                onChange={(e) =>
                                                    setVertexLocation(e.target.value)
                                                }
                                                className="h-9 text-sm"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Contoh: <code className="font-mono">us-central1</code>,{" "}
                                                <code className="font-mono">asia-southeast1</code>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* SA JSON Upload */}
                                <div className="rounded-lg border border-border/60 bg-muted/20 p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-foreground">
                                            Service Account JSON
                                        </p>
                                        {/* SA Status chip */}
                                        {saStatus && (
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                                                    saStatus.has_sa
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                                }`}
                                            >
                                                {saStatus.has_sa ? (
                                                    <>
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        SA Terkonfigurasi
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="h-3 w-3" />
                                                        Belum Ada SA
                                                    </>
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {/* Current SA info */}
                                    {saStatus?.has_sa && (
                                        <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                                            <FileJson className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                            <div className="text-xs space-y-0.5">
                                                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                                                    {saStatus.filename}
                                                </p>
                                                {saStatus.project_id && (
                                                    <p className="text-emerald-600/80 dark:text-emerald-400/70">
                                                        Project:{" "}
                                                        <span className="font-mono">
                                                            {saStatus.project_id}
                                                        </span>
                                                    </p>
                                                )}
                                                {saStatus.client_email && (
                                                    <p className="text-emerald-600/80 dark:text-emerald-400/70">
                                                        Email:{" "}
                                                        <span className="font-mono">
                                                            {saStatus.client_email}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Drag-and-drop zone */}
                                    <div
                                        id="sa-drop-zone"
                                        role="button"
                                        tabIndex={0}
                                        onDragOver={(e) => {
                                            e.preventDefault()
                                            setDragOver(true)
                                        }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ")
                                                fileInputRef.current?.click()
                                        }}
                                        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 px-4 text-center cursor-pointer transition-all duration-200 ${
                                            dragOver
                                                ? "border-primary bg-primary/5 scale-[1.01]"
                                                : saFile
                                                  ? "border-emerald-400 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/10"
                                                  : "border-border/60 hover:border-primary/50 hover:bg-muted/30"
                                        }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".json"
                                            className="hidden"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0]
                                                if (f) handleFileSelect(f)
                                                e.target.value = ""
                                            }}
                                        />
                                        {saFile ? (
                                            <>
                                                <FileJson className="h-8 w-8 text-emerald-500" />
                                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                                    {saFile.name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {(saFile.size / 1024).toFixed(1)} KB — klik untuk ganti file
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-8 w-8 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        Drag &amp; drop atau klik untuk upload
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground mt-1">
                                                        Hanya file <code className="font-mono">.json</code> (maks 1 MB)
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Upload feedback */}
                                    {uploadError && (
                                        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                            {uploadError}
                                        </div>
                                    )}
                                    {uploadSuccess && (
                                        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200 animate-in fade-in duration-200">
                                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                            {uploadSuccess}
                                        </div>
                                    )}

                                    {/* Upload button */}
                                    <Button
                                        id="btn-upload-sa-json"
                                        type="button"
                                        variant="outline"
                                        disabled={!saFile || uploading}
                                        onClick={handleUpload}
                                        className="w-full sm:w-auto"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Mengunggah...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload Service Account JSON
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Warning: SA missing while vertex_ai selected */}
                                {!saStatus?.has_sa && (
                                    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                                        <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                        <p className="text-xs text-amber-700 dark:text-amber-300">
                                            Mode <strong>Vertex AI</strong> dipilih, tetapi Service Account JSON belum diunggah.
                                            Upload SA JSON terlebih dahulu sebelum menyimpan.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Active mode chip */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Mode aktif saat ini:</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">
                                {GEMINI_MODE_OPTIONS.find(
                                    (o) => o.value === currentGeminiMode,
                                )?.label ?? currentGeminiMode}
                            </span>
                        </div>

                        {/* Save Gemini settings button */}
                        <div className="flex justify-end">
                            <Button
                                id="btn-save-gemini-mode"
                                onClick={handleSaveGeminiMode}
                                disabled={
                                    savingGemini ||
                                    !isGeminiDirty ||
                                    (selectedGeminiMode === "vertex_ai" && !saStatus?.has_sa)
                                }
                                className="min-w-[160px]"
                            >
                                {savingGemini ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                )}
                                Simpan Pengaturan Gemini
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
