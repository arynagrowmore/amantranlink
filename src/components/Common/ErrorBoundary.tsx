import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  errorReferenceId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    const refId = `err_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    return { hasError: true, errorReferenceId: refId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log structured error without leaking to public UI
    try {
      if (typeof window !== 'undefined' && (window as any).reportFrontendError) {
        (window as any).reportFrontendError({
          errorName: error.name,
          errorMessage: error.message,
          componentStack: errorInfo.componentStack,
        });
      }
    } catch {
      // safe fallback
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorReferenceId: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 font-manrope">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-stone-900">
                {this.props.fallbackTitle || 'Something went wrong'}
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                {this.props.fallbackMessage || 'An unexpected error occurred while loading this section. Our system has automatically recorded the diagnostic details.'}
              </p>
              {this.state.errorReferenceId && (
                <p className="text-[11px] font-mono text-stone-400 mt-2">
                  Reference: {this.state.errorReferenceId}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Loading
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = '/'; }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
