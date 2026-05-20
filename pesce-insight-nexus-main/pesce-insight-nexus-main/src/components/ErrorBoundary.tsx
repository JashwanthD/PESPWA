import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in PESCE Intelligence Node:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b] px-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,189,49,0.05),transparent_50%)]" />
          
          <div className="glass-dark border border-white/5 rounded-[40px] p-12 max-w-lg w-full text-center relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-64 w-64 bg-gold/10 rounded-full blur-3xl" />
            
            <div className="inline-flex items-center justify-center p-5 rounded-3xl bg-gold/10 text-gold mb-8 animate-pulse">
              <AlertTriangle className="h-10 w-10" />
            </div>
            
            <h1 className="text-4xl font-black text-slate-white uppercase tracking-tight leading-none mb-4" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
              System<br />
              <span className="text-gold">Maintenance</span>
            </h1>
            
            <p className="text-xs text-slate-white/50 uppercase tracking-[0.2em] font-bold mb-10 leading-relaxed">
              Intelligence Node Cluster is currently undergoing recalibration. All operational data is preserved.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-white text-[#09090b] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gold hover:text-white transition-all duration-500 shadow-2xl shadow-white/5"
            >
              <RefreshCcw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-700" />
              Reload System
            </button>
            
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-1 items-center">
              <div className="text-[10px] text-slate-white/20 uppercase tracking-[0.3em] font-bold">Node Status</div>
              <div className="text-[9px] text-gold/60 uppercase tracking-widest font-black">Limited Core Functionality Active</div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function CardErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="glass-dark border border-white/5 rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center bg-white/5">
          <AlertTriangle className="h-6 w-6 text-gold/40 mb-3" />
          <h3 className="text-[10px] uppercase font-bold text-gold/60 tracking-[0.2em]">Node Offline</h3>
          <p className="text-[9px] text-slate-white/30 uppercase mt-1">Data Stream Corrupted</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
