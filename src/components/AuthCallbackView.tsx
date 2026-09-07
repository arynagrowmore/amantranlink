import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigateToRoute } from '../utils/navigation';

export const AuthCallbackView: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const processAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorDesc = urlParams.get('error_description') || urlParams.get('error');

        if (errorDesc) {
          if (isMounted) {
            setStatus('error');
            setErrorMessage(errorDesc.replace(/\+/g, ' '));
          }
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.warn('Code exchange warning:', error.message);
          }
        }

        // Check active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          setStatus('success');
          const savedDest = sessionStorage.getItem('AMANTRANLINK_AUTH_DESTINATION') || '/studio';
          sessionStorage.removeItem('AMANTRANLINK_AUTH_DESTINATION');
          setTimeout(() => {
            navigateToRoute(savedDest, true);
          }, 600);
        } else if (isMounted) {
          setTimeout(() => {
            navigateToRoute('/studio', true);
          }, 800);
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Unable to complete secure sign-in. Please try again.');
        }
      }
    };

    processAuthCallback();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-6 text-center select-none font-manrope">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-[#E8D5AD] shadow-[0_20px_60px_rgba(36,26,23,0.08)] flex flex-col items-center text-center space-y-6">
        
        {/* Brand Crest */}
        <div className="w-14 h-14 rounded-2xl bg-[#6E1020]/10 border border-[#C49A35]/30 flex items-center justify-center shadow-xs">
          <img 
            src="/amantranlink.png" 
            alt="AmantranLink" 
            className="h-9 w-auto object-contain" 
          />
        </div>

        {status === 'loading' && (
          <div className="space-y-3">
            <h2 className="font-cormorant font-bold text-2xl text-[#241A17] tracking-tight">
              Opening Your Wedding Atelier…
            </h2>
            <p className="text-xs text-[#6D5D57] max-w-xs mx-auto leading-relaxed">
              Authenticating your credentials with AmantranLink security.
            </p>
            <div className="pt-2 flex justify-center">
              <Loader2 className="w-6 h-6 text-[#C49A35] animate-spin" />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-[#167A5A]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="font-cormorant font-bold text-2xl text-[#241A17] tracking-tight">
              Welcome to AmantranLink
            </h2>
            <p className="text-xs text-[#6D5D57] max-w-xs mx-auto leading-relaxed">
              Sign-in verified. Preparing your royal invitation workspace…
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="font-cormorant font-bold text-2xl text-[#241A17] tracking-tight">
                Authentication Note
              </h2>
              <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 leading-relaxed">
                {errorMessage || 'Sign-in could not be completed. Please try again.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateToRoute('/studio', true)}
              className="px-6 py-2.5 rounded-xl bg-[#6E1020] hover:bg-[#520B17] text-white text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 mx-auto shadow-sm transition-all cursor-pointer"
            >
              <span>Return to Atelier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Security badge */}
        <div className="pt-4 border-t border-[#E8D5AD]/60 flex items-center justify-center gap-1.5 text-[11px] text-[#8C7A73]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>AmantranLink 256-bit Encrypted Session</span>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackView;
