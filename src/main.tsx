import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css"
import App from "./App.tsx"

import { ThemeProvider } from "./components/ThemeProvider.tsx"
import { ConversationProvider } from "./context/conversation-context.tsx"
import { AuthProvider } from "./auth/AuthProvider.tsx"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                <AuthProvider>
                    <ConversationProvider>
                        <App />
                    </ConversationProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>,
)
