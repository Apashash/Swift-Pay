import { createRoot } from 'react-dom/client';
import { Component, type ReactNode } from 'react';

import App from './App';

import './index.css';

// ── Global error catch (catches JS errors outside React) ─────────────────────
window.addEventListener('unhandledrejection', (e) => {
  console.error('[SwiftPay] Unhandled rejection:', e.reason);
});

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[SwiftPay] Render error:', error, info.componentStack);
  }

  override render() {
    if (this.state.error) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#0a0a0a',
            color: '#f0f0f0',
            fontFamily: 'sans-serif',
            padding: '2rem',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: '100%',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 16,
              padding: '2rem',
            }}
          >
            <h2 style={{ color: '#00e676', margin: '0 0 1rem' }}>
              SwiftPay — Erreur
            </h2>
            <p style={{ color: '#aaa', fontSize: 14, margin: '0 0 1rem' }}>
              Une erreur s'est produite lors du chargement. Copiez le message
              ci-dessous et partagez-le pour diagnostic.
            </p>
            <pre
              style={{
                background: '#111',
                border: '1px solid #333',
                borderRadius: 8,
                padding: '1rem',
                fontSize: 12,
                color: '#ff6b6b',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error.name}: {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '0.75rem',
                background: '#00e676',
                color: '#000',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────────
const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML =
    '<div style="color:white;background:#0a0a0a;padding:2rem;font-family:sans-serif">' +
    'Erreur critique : élément #root introuvable.</div>';
} else {
  createRoot(rootEl).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
}
