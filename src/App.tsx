import { Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import LandingPage from "./pages/LandingPage"
import ConversationPage from "./pages/ConversationPage"
import ChatPage from "./pages/ChatPage"
import AdminLayout from "./layouts/AdminLayout"
import AdminLoginPage from "./pages/admin/AdminLoginPage"
import AdminGuard from "./auth/AdminGuard"
import DashboardPage from "./pages/admin/DashboardPage"
import HistoryPage from "./pages/admin/HistoryPage"
import EvaluatePage from "./pages/admin/EvaluatePage"
import IngestPage from "./pages/admin/IngestPage"
import VectorsResetPage from "./pages/admin/VectorsResetPage"
import VectorsSourcesPage from "./pages/admin/VectorsSourcesPage"
import VectorsSourceDetailPage from "./pages/admin/VectorsSourceDetailPage"

export default function App() {
    const isEvaluateEnabled =
        String(import.meta.env.VITE_ADMIN_EVALUATE_ENABLED ?? "true") === "true"
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/conversation" element={<ConversationPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                    path="/admin"
                    element={
                        <AdminGuard>
                            <AdminLayout />
                        </AdminGuard>
                    }
                >
                    <Route
                        index
                        element={<Navigate to="dashboard" replace />}
                    />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="history" element={<HistoryPage />} />
                    {isEvaluateEnabled && (
                        <Route path="evaluate" element={<EvaluatePage />} />
                    )}
                    <Route path="ingest" element={<IngestPage />} />
                    <Route
                        path="vectors/reset"
                        element={<VectorsResetPage />}
                    />
                    <Route
                        path="vectors/sources"
                        element={<VectorsSourcesPage />}
                    />
                    <Route
                        path="vectors/source-detail"
                        element={<VectorsSourceDetailPage />}
                    />
                </Route>
            </Routes>
        </>
    )
}
