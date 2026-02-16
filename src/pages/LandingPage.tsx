import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Bot, MessageCircle, Wrench, Search, FileText, Zap } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden p-8 text-center">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-[240px] left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -top-16 left-10 h-24 w-24 rounded-full border border-primary/25" />
                <div className="absolute top-20 right-12 h-16 w-16 rounded-full border border-primary/25" />
                <div className="absolute -bottom-24 left-16 h-40 w-40 rounded-full border border-primary/20" />
                <div className="absolute bottom-24 right-20 h-24 w-24 rounded-full border border-primary/20" />
                <div className="absolute left-10 right-10 top-20 border-t border-dashed border-primary/20" />
                <div className="absolute left-10 right-10 bottom-24 border-t border-dashed border-primary/20" />
                <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(hsl(var(--primary)/0.4)_1px,transparent_1px)] [background-size:18px_18px]" />
            </div>

            <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                    <Bot className="h-4 w-4" />
                    RAG-Powered AI Assistant
                </div>

                <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
                    Selamat Datang di
                    <br />
                    <span className="bg-gradient-to-br from-primary to-foreground bg-clip-text text-transparent">
                        Humbet AI
                    </span>
                </h1>

                <div className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                    Asisten cerdas yang menggunakan teknologi
                    Retrieval-Augmented Generation untuk menjawab pertanyaan
                    dengan konteks dokumen yang akurat.
                </div>

                <div className="mb-16 flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg" className="h-12 px-8 text-base">
                        <Link to="/conversation">
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Mulai Chat
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="h-12 px-8 text-base"
                    >
                        <Link to="/chat">
                            <Wrench className="mr-2 h-5 w-5" />
                            Debug Chat
                        </Link>
                    </Button>
                </div>

                <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-2xl border border-primary/20 bg-muted/40 p-6 text-left shadow-sm">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Search className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Retrieval Cerdas
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Menemukan konteks terbaik dari dokumen agar jawaban
                            relevan dan akurat.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-primary/10 bg-muted/30 p-6 text-left shadow-sm">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Berbasis Dokumen
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Jawaban disusun dari sumber dokumen yang jelas dan
                            bisa ditelusuri.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-primary/10 bg-muted/30 p-6 text-left shadow-sm">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Zap className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            DRAGIN
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Retrieval adaptif yang memperkaya konteks agar
                            jawaban lebih tajam dan relevan.
                        </p>
                    </div>
                </div>

                <section className="relative mt-16 w-full max-w-6xl overflow-hidden rounded-3xl border border-primary/20 bg-muted/10 px-6 py-12 text-left sm:px-10">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute left-0 top-0 h-full w-1 bg-primary/20" />
                        <div className="absolute right-0 top-0 h-full w-1 bg-primary/20" />
                        <div className="absolute left-8 right-8 top-8 border-t border-dashed border-primary/25" />
                        <div className="absolute left-8 right-8 bottom-8 border-t border-dashed border-primary/25" />
                        <div className="absolute -left-6 top-16 h-10 w-10 rounded-full border border-primary/25" />
                        <div className="absolute -right-6 bottom-16 h-12 w-12 rounded-full border border-primary/25" />
                    </div>

                    <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Alur Jawaban Terstruktur untuk Humbet AI
                            </h2>
                            <p className="mt-4 max-w-2xl text-base text-muted-foreground">
                                Setiap jawaban disusun lewat proses yang jelas:
                                memahami pertanyaan, memilih konteks paling
                                relevan, lalu merangkai jawaban yang bisa
                                ditelusuri ke dokumen sumber.
                            </p>
                            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                <div className="rounded-2xl border border-primary/20 bg-background/70 p-4 shadow-sm">
                                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                        01
                                    </div>
                                    <div className="text-sm font-semibold text-foreground">
                                        Pahami Pertanyaan
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Sistem menangkap kebutuhan inti pengguna
                                        secara cepat.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-primary/10 bg-background/60 p-4 shadow-sm">
                                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                        02
                                    </div>
                                    <div className="text-sm font-semibold text-foreground">
                                        Ambil Konteks
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Dokumen terbaik dipilih untuk mendukung
                                        jawaban.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-primary/10 bg-background/60 p-4 shadow-sm">
                                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                        03
                                    </div>
                                    <div className="text-sm font-semibold text-foreground">
                                        Rangkai Jawaban
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Output ringkas, konsisten, dan siap
                                        dipakai.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl border border-primary/25 bg-background/80 p-5 shadow-sm backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-foreground">
                                            Ringkasan Kualitas
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            Indikator jawabannya
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 grid gap-3">
                                    <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-muted/30 px-3 py-2 text-xs">
                                        <span className="text-muted-foreground">
                                            Dokumen Terpakai
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            4 sumber
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-muted/30 px-3 py-2 text-xs">
                                        <span className="text-muted-foreground">
                                            Skor Kejelasan
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            0.90
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-muted/30 px-3 py-2 text-xs">
                                        <span className="text-muted-foreground">
                                            Iterasi RAG
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            2x
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-primary/20 bg-background/70 p-5 shadow-sm">
                                <div className="text-sm font-semibold text-foreground">
                                    Cuplikan Insight
                                </div>
                                <p className="mt-3 text-xs text-muted-foreground">
                                    “Jawaban mengutip panduan kelas digital huma
                                    betang terbaru dan menyertakan bagian
                                    kebijakan yang relevan untuk validasi
                                    cepat.”
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                                    <span className="rounded-full border border-primary/20 px-2 py-1">
                                        Panduan Kelas Huma betang
                                    </span>
                                    <span className="rounded-full border border-primary/20 px-2 py-1">
                                        SOP Kelas Huma Betang
                                    </span>
                                    <span className="rounded-full border border-primary/20 px-2 py-1">
                                        2025
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative mt-16 w-full max-w-6xl overflow-hidden rounded-3xl border border-primary/20 bg-primary/10 px-6 py-12 text-left sm:px-10">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(hsl(var(--primary)/0.5)_1px,transparent_1px)] [background-size:20px_20px]" />
                        <div className="absolute -top-16 right-10 h-28 w-28 rounded-full border border-primary/30" />
                        <div className="absolute -bottom-20 left-12 h-36 w-36 rounded-full border border-primary/30" />
                    </div>

                    <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-[1.3fr_0.7fr]">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/60 px-3 py-1 text-xs font-semibold text-primary">
                                Siap dipakai untuk kebutuhan Kelas Digital Huma
                                Betang
                            </div>
                            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Mulai eksplorasi pengetahuan dengan Humbet AI
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                                Ajukan pertanyaan, dapatkan jawaban yang
                                relevan, dan telusuri sumber dokumen dengan
                                cepat. Cocok untuk pengguna kelas digital huma
                                betang.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button asChild className="h-11 px-6">
                                <Link to="/conversation">Mulai Chat</Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="h-11 px-6"
                            >
                                <Link to="/chat">Coba Debug</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <footer className="relative mt-16 w-full overflow-hidden border-t border-primary/20 bg-background/80 px-6 py-8 text-left">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(hsl(var(--primary)/0.4)_1px,transparent_1px)] [background-size:22px_22px]" />
                    </div>
                    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="text-base font-semibold text-foreground">
                                Humbet AI
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                Asisten RAG untuk akses informasi akademik yang
                                cepat dan dapat ditelusuri.
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            © 2026 Humbet AI. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}
