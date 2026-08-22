import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Sparkles, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoyalCrestIcon, DiyaIcon } from './ShahiIcons';

export const AuthModal: React.FC = () => {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    authModalIntent,
    loginWithEmail, 
    signupWithEmail, 
    loginWithGoogle,
    loading 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('9409360336');
  const [error, setError] = useState<string | null>(null);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email address and password.');
      return;
    }

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) {
          setError('Please enter your full name or couple names.');
          return;
        }
        await signupWithEmail(name, email, password, phone);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError('Google Sign-In failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn select-none">
      <div 
        className="relative w-full max-w-md bg-[#F7F0DD] rounded-3xl border-3 border-[#A67C3D] shadow-2xl overflow-hidden text-[#2B1810]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#6B1420] via-[#851C2C] to-[#6B1420] px-6 py-5 text-[#F7F0DD] flex items-center justify-between border-b-2 border-[#A67C3D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7E1827] to-[#4A0C14] border border-[#A67C3D] flex items-center justify-center text-lg shadow-md text-[#D4B37F]">
              <RoyalCrestIcon className="w-6 h-6 text-[#D4B37F]" />
            </div>
            <div>
              <h3 className="font-fraunces font-black text-lg tracking-wider">
                {mode === 'login' ? 'WELCOME TO SHAHI STUDIO' : 'CREATE YOUR ROYAL ACCOUNT'}
              </h3>
              <span className="text-[10.5px] font-baloo text-[#D4B37F] font-bold block -mt-0.5">
                ॥ शाही डिजिटल विवाह निमंत्रण पोर्टल ॥
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAuthModal(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#F7F0DD] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intent Info Banner */}
        <div className="px-6 py-3 bg-[#EDE0C8] border-b border-[#D8C7AA] flex items-center gap-2 text-xs font-fraunces font-bold text-[#6B1420]">
          <Sparkles className="w-4 h-4 text-[#A67C3D] shrink-0" />
          <span className="leading-snug">{authModalIntent}</span>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-[#D8C7AA] bg-[#F7F0DD]">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-3 text-xs font-fraunces font-bold transition-all border-b-2 ${
              mode === 'login'
                ? 'text-[#6B1420] border-[#6B1420] bg-[#EDE0C8]/50'
                : 'text-[#6B5A4A] border-transparent hover:text-[#6B1420]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-3 text-xs font-fraunces font-bold transition-all border-b-2 ${
              mode === 'signup'
                ? 'text-[#6B1420] border-[#6B1420] bg-[#EDE0C8]/50'
                : 'text-[#6B5A4A] border-transparent hover:text-[#6B1420]'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-medium">
              {error}
            </div>
          )}

          {/* 1-Tap Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-50 border border-[#D8C7AA] text-xs font-fraunces font-bold text-[#2B1810] flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#A67C3D]" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-[#D8C7AA]"></div>
            <span className="text-[10px] font-mono text-[#6B5A4A] uppercase">or with email</span>
            <div className="flex-1 h-[1px] bg-[#D8C7AA]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-fraunces font-bold text-[#6B1420] block">
                  Your Full Name / Couple Names:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A67C3D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhruv & Shreya"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white border border-[#D8C7AA] text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#6B1420]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-fraunces font-bold text-[#6B1420] block">
                Email Address:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A67C3D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white border border-[#D8C7AA] text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#6B1420]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-fraunces font-bold text-[#6B1420] block">
                Password:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A67C3D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white border border-[#D8C7AA] text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#6B1420]"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-fraunces font-bold text-[#6B1420] block">
                  WhatsApp Contact Number:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A67C3D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 9409360336"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white border border-[#D8C7AA] text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#6B1420]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl btn-vermillion text-xs font-fraunces font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-transform min-h-[44px] cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating Royal Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Log In & Continue' : 'Create Account & Unlock'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Security Note */}
        <div className="px-6 py-3 bg-[#EDE0C8] border-t border-[#D8C7AA] flex items-center justify-center gap-2 text-[10px] font-mono text-[#6B5A4A]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3D6B4A]" />
          <span>256-Bit SSL Encrypted Royal Shahi Vault</span>
        </div>
      </div>
    </div>
  );
};
