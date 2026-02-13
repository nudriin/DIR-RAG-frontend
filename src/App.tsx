import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ConversationPage from './pages/ConversationPage';
import ChatPage from './pages/ChatPage';
import AdminLayout from './layouts/AdminLayout';
import EvaluatePage from './pages/admin/EvaluatePage';
import IngestPage from './pages/admin/IngestPage';
import VectorsResetPage from './pages/admin/VectorsResetPage';
import VectorsDeletePage from './pages/admin/VectorsDeletePage';
import VectorsSourcesPage from './pages/admin/VectorsSourcesPage';
import VectorsSourceDetailPage from './pages/admin/VectorsSourceDetailPage';



export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/conversation" element={<ConversationPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="evaluate" replace />} />
          <Route path="evaluate" element={<EvaluatePage />} />
          <Route path="ingest" element={<IngestPage />} />
          <Route path="vectors/reset" element={<VectorsResetPage />} />
          <Route path="vectors/delete-by-source" element={<VectorsDeletePage />} />
          <Route path="vectors/sources" element={<VectorsSourcesPage />} />
          <Route path="vectors/source-detail" element={<VectorsSourceDetailPage />} />
        </Route>
      </Routes>
    </>
  );
}
