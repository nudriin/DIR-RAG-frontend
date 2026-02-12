import { Link } from 'react-router-dom';
import '../styles/layout.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-badge">🤖 RAG-Powered AI Assistant</div>

      <h1 className="landing-title">
        Selamat Datang di<br />
        <span className="gradient-text">Humbet AI</span>
      </h1>

      <p className="landing-desc">
        Asisten cerdas yang menggunakan teknologi Retrieval-Augmented Generation
        untuk menjawab pertanyaan dengan konteks dokumen yang akurat.
      </p>

      <div className="landing-cta">
        <Link to="/chat" className="btn btn-primary btn-lg">
          💬 Mulai Chat
        </Link>
      </div>

      <div className="landing-features">
        <div className="landing-feature">
          <span className="landing-feature-icon">🔍</span>
          <span className="landing-feature-label">Retrieval Cerdas</span>
        </div>
        <div className="landing-feature">
          <span className="landing-feature-icon">📄</span>
          <span className="landing-feature-label">Berbasis Dokumen</span>
        </div>
        <div className="landing-feature">
          <span className="landing-feature-icon">⚡</span>
          <span className="landing-feature-label">Iterative Refinement</span>
        </div>
      </div>
    </div>
  );
}
