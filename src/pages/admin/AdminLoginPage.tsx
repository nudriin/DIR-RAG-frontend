import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { postLogin, ApiError } from "../../api/client"
import ErrorMessage from "../../components/ErrorMessage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Loader2, Lock } from "lucide-react"
import { useAuth } from "@/auth/useAuth"
import { isValidUsername, validatePassword } from "@/utils/auth"

export default function AdminLoginPage() {
    const navigate = useNavigate()
    const { isAuthenticated, login, authMessage, clearMessage } = useAuth()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/admin/dashboard", { replace: true })
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        if (authMessage) {
            setError(authMessage)
            clearMessage()
        }
    }, [authMessage, clearMessage])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError(null)

        if (!isValidUsername(username)) {
            setError("Username minimal 3 karakter.")
            return
        }
        const passwordErrors = validatePassword(password)
        if (passwordErrors.length > 0) {
            setError(passwordErrors[0])
            return
        }

        setLoading(true)
        try {
            const data = await postLogin({
                username: username.trim(),
                password,
            })
            login(data)
            navigate("/admin/dashboard", { replace: true })
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 401) {
                    setError("Username atau password salah.")
                } else if (err.status === 400) {
                    setError(err.detail)
                } else {
                    setError(`Error ${err.status}: ${err.detail}`)
                }
            } else {
                setError("Terjadi kesalahan jaringan.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">
            <Card className="w-full max-w-md border-border/50 bg-background/60 shadow-sm backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>Login Admin</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Masuk untuk mengakses dashboard admin.
                            </p>
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                placeholder="Masukkan username"
                                autoComplete="username"
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Masukkan password"
                                    autoComplete="current-password"
                                    disabled={loading}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    aria-label={
                                        showPassword
                                            ? "Sembunyikan password"
                                            : "Tampilkan password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Masuk
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
