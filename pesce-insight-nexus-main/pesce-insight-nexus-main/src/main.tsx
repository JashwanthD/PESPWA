import React, { ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css"; // Ensure Vite automatically injects this into index.html

// 1. RECOVERY COMPONENT
class SafeErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[Recovery] Critical System Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#09090b', 
          color: '#fff', 
          fontFamily: 'sans-serif',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem', color: '#ef4444' }}>SYSTEM RECONNECTING</h1>
          <p style={{ opacity: 0.6, fontSize: '0.875rem', maxWidth: '400px', lineHeight: 1.6 }}>
            A high-density module failed to initialize. We are attempting to restore the PESCE Intelligence Nexus.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '12px 24px',
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer'
            }}
          >
            Hard Reset Engine
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 2. BOOT PROTOCOL
const rootElement = document.getElementById("root");

if (rootElement && !rootElement.innerHTML) {
  const router = getRouter();
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <SafeErrorBoundary>
        <RouterProvider router={router} />
      </SafeErrorBoundary>
    </React.StrictMode>
  );
}
