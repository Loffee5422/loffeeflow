import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/'; // Hard reset to home
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-slate-500 mb-6">
              We encountered an unexpected error. The application has been paused to prevent data loss.
            </p>
            
            {this.state.error && (
               <div className="bg-slate-50 p-3 rounded-lg text-left mb-6 overflow-auto max-h-32 border border-slate-200">
                   <code className="text-xs text-slate-600 font-mono break-all">
                       {this.state.error.message}
                   </code>
               </div>
            )}

            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-semibold transition-colors"
              >
                <RefreshCcw size={18} />
                Reload Page
              </button>
              <button 
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white hover:bg-brand-700 rounded-xl font-semibold transition-colors shadow-lg shadow-brand-200"
              >
                <Home size={18} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}