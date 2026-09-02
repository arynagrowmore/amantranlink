import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AmantranLink Error Boundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    try {
      localStorage.removeItem('WEDDING_STUDIO_STATE');
      window.location.hash = '';
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#3E2612] flex flex-col items-center justify-center p-6 text-center font-fraunces">
          <div className="max-w-md bg-[#FFFDF9] p-8 rounded-3xl border-2 border-[#D8C7AA] shadow-xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#F7F0DD] border border-[#A67C3D] flex items-center justify-center mx-auto text-[#6B1420]">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#6B1420]">
                {this.props.fallbackTitle || 'Unable to open your AmantranLink Studio'}
              </h2>
              <p className="text-xs font-hanken text-[#8B7358]">
                AmantranLink स्टूडियो लोड करने में अस्थायी रुकावट आई। कृपया पुनः प्रयास करें।
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#F7F0DD] rounded-xl text-[11px] font-mono text-left text-[#6B1420] overflow-x-auto max-h-32 border border-[#D8C7AA]">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 rounded-xl btn-vermillion text-xs font-fraunces font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again / Reload</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.hash = '';
                  window.location.href = '/';
                }}
                className="px-4 py-3 rounded-xl bg-[#F7F0DD] hover:bg-[#EDE0C8] border border-[#D8C7AA] text-[#6B1420] text-xs font-fraunces font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
