import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css"
import App from "./App.tsx"

import { ThemeProvider } from "./components/ThemeProvider.tsx"
import { ConversationProvider } from "./context/conversation-context.tsx"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                <ConversationProvider>
                    <App />
                </ConversationProvider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>,
)
