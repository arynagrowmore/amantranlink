import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Lock, User, Phone, Loader2, Eye, EyeOff, 
  ArrowLeft, Heart, Camera, Building2, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type UserRoleChoice = 'end_customer' | 'partner';

export const AuthModal: React.FC = () => {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    authModalIntent,
    loginWithEmail, 
    signupWithEmail, 
    loginWithGoogle, 
    resetPasswordForEmail,
    loading 
  } = useAuth();

  // Mode & Tabs
  const [userRole, setUserRole] = useState<UserRoleChoice>('end_customer');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  
  // Form Fields
  const [name, setName] = useState<string>('');
  const [studioName, setStudioName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Auto-detect role intent from context or URL or event
  useEffect(() => {
    if (!showAuthModal) return;
    if (authModalIntent && (authModalIntent.toLowerCase().includes('couple') || authModalIntent.toLowerCase().includes('invitation'))) {
      setUserRole('end_customer');
    } else if (authModalIntent && (authModalIntent.toLowerCase().includes('partner') || authModalIntent.toLowerCase().includes('studio'))) {
      setUserRole('partner');
    }
  }, [showAuthModal, authModalIntent]);

  // Listen to open-login-modal custom event
  useEffect(() => {
    const handleOpenLogin = (e: any) => {
      setShowAuthModal(true);
      if (e?.detail?.initialRole === 'partner' || e?.detail?.returnToPartnerOnboarding) {
        setUserRole('partner');
      } else if (e?.detail?.initialRole === 'end_customer') {
        setUserRole('end_customer');
      }
    };
    window.addEventListener('open-login-modal', handleOpenLogin);
    return () => window.removeEventListener('open-login-modal', handleOpenLogin);
  }, [setShowAuthModal]);

  if (!showAuthModal) return null;

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleTabChange = (tab: 'signin' | 'signup' | 'forgot') => {
    clearMessages();
    setActiveTab(tab);
  };

  const handleRoleChange = (role: UserRoleChoice) => {
    clearMessages();
    setUserRole(role);
  };

  // 1. Handle Sign In & Sign Up Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanStudioName = studioName.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setActionLoading(true);
    try {
      if (activeTab === 'signin') {
        const success = await loginWithEmail(cleanEmail, cleanPassword);
        if (success) {
          setShowAuthModal(false);
        }
      } else if (activeTab === 'signup') {
        if (!cleanName) {
          setError(userRole === 'partner' ? 'Please enter contact name.' : 'Please enter full name.');
          setActionLoading(false);
          return;
        }

        const finalName = userRole === 'partner' && cleanStudioName 
          ? `${cleanName} (${cleanStudioName})` 
          : cleanName;

        const success = await signupWithEmail(finalName, cleanEmail, cleanPassword, cleanPhone);
        if (success) {
          setShowAuthModal(false);
          
          // If photographer role was selected, trigger server-side partner onboarding
          if (userRole === 'partner' && typeof window !== 'undefined') {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('open-partner-modal', {
                detail: { studioName: cleanStudioName, contactName: cleanName }
              }));
            }, 300);
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Handle Google OAuth
  const handleGoogleLogin = async () => {
    clearMessages();
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google Sign-In failed. Please try again.');
    }
  };

  // 3. Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter your registered email address.');
      return;
    }

    setActionLoading(true);
    try {
      await resetPasswordForEmail(cleanEmail);
      setSuccessMessage(`Password reset link sent to ${cleanEmail}! Please check your inbox.`);
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset email.');
    } finally {
      setActionLoading(false);
    }
  };

  const isBusy = loading || actionLoading;
  const isPartner = userRole === 'partner';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 font-manrope overflow-y-auto select-none"
      onClick={() => setShowAuthModal(false)}
    >
      {/* 🌟 ONE COMPACT CENTERED AUTHENTICATION CARD */}
      <div 
        className="relative w-full max-w-[400px] bg-white rounded-2xl border border-[#E8E6E1] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 sm:p-7 text-[#202124] my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#F7F7F5] hover:bg-[#E8E6E1] text-[#777777] hover:text-[#202124] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Top Logo Container & Account Switcher */}
        <div className="flex flex-col items-center text-center space-y-3 mb-5">
          {/* Subtle Square Logo Container */}
          <div className="w-10 h-10 rounded-xl bg-[#741321]/10 border border-[#741321]/20 flex items-center justify-center shadow-xs">
            <img 
              src="/amantranlink.png" 
              alt="AmantranLink" 
              className="h-6 w-auto object-contain" 
            />
          </div>

          {/* Compact Account Type Selector Above Heading */}
          <div className="inline-flex p-0.5 bg-[#F7F7F5] rounded-xl border border-[#E8E6E1]">
            <button
              type="button"
              onClick={() => handleRoleChange('end_customer')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                !isPartner 
                  ? 'bg-white text-[#741321] shadow-xs font-bold' 
                  : 'text-[#777777] hover:text-[#202124]'
              }`}
            >
              <Heart className="w-3 h-3" />
              <span>Couple</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('partner')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPartner 
                  ? 'bg-white text-[#741321] shadow-xs font-bold' 
                  : 'text-[#777777] hover:text-[#202124]'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>Studio</span>
            </button>
          </div>

          {/* Clean Bold Heading & Supporting Text */}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#202124] uppercase">
              {activeTab === 'signin' && (isPartner ? 'STUDIO ACCESS' : 'WELCOME BACK')}
              {activeTab === 'signup' && (isPartner ? 'CREATE STUDIO ACCOUNT' : 'CREATE AN ACCOUNT')}
              {activeTab === 'forgot' && 'RESET PASSWORD'}
            </h2>
            <p className="text-xs text-[#777777] mt-0.5 leading-relaxed">
              {activeTab === 'signin' && (isPartner 
                ? 'Sign in to manage your client invitations and studio workspace.' 
                : 'Sign in to access your account.')}
              {activeTab === 'signup' && (isPartner 
                ? 'Join the AmantranLink studio partner network.' 
                : 'Start customizing your digital wedding invitation.')}
              {activeTab === 'forgot' && 'Enter your email to receive a password reset link.'}
            </p>
          </div>
        </div>

        {/* Intent Badge if present */}
        {authModalIntent && !authModalIntent.toLowerCase().includes('log in to unlock') && (
          <div className="mb-4 px-3 py-1.5 rounded-lg bg-[#F7F7F5] border border-[#E8E6E1] text-[11px] text-[#741321] font-medium text-center">
            {authModalIntent}
          </div>
        )}

        {/* Notification Messages */}
        {successMessage && (
          <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 📝 COMPACT FORM FIELDS                                                    */}
        {/* ========================================================================= */}
        {activeTab !== 'forgot' && (
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            
            {/* Sign Up Fields */}
            {activeTab === 'signup' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202124] block">
                    {isPartner ? 'Lead / Contact Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isPartner ? 'e.g. Vikram Sharma' : 'e.g. Rudra & Ishani'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#F7F7F5] border border-[#E8E6E1] text-[#202124] placeholder-[#777777]/60 focus:bg-white focus:outline-none focus:border-[#741321] focus:ring-1 focus:ring-[#741321] transition-colors h-9"
                  />
                </div>

                {isPartner && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#202124] block">
                      Studio / Photography Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Lens Studio"
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#F7F7F5] border border-[#E8E6E1] text-[#202124] placeholder-[#777777]/60 focus:bg-white focus:outline-none focus:border-[#741321] focus:ring-1 focus:ring-[#741321] transition-colors h-9"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#202124] block">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                placeholder="Enter your email or phone"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[#F7F7F5] border border-[#E8E6E1] text-[#202124] placeholder-[#777777]/60 focus:bg-white focus:outline-none focus:border-[#741321] focus:ring-1 focus:ring-[#741321] transition-colors h-9"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#202124] block">
                  PASSWORD
                </label>
                {activeTab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => handleTabChange('forgot')}
                    className="text-[11px] font-medium text-[#741321] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 text-xs rounded-lg bg-[#F7F7F5] border border-[#E8E6E1] text-[#202124] placeholder-[#777777]/60 focus:bg-white focus:outline-none focus:border-[#741321] focus:ring-1 focus:ring-[#741321] transition-colors h-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#202124] cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Phone (Signup only) */}
            {activeTab === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202124] flex items-center justify-between">
                  <span>WhatsApp / Phone</span>
                  {!isPartner && <span className="text-[10px] text-[#777777] font-normal">Optional</span>}
                </label>
                <input
                  type="tel"
                  required={isPartner}
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F7F7F5] border border-[#E8E6E1] text-[#202124] placeholder-[#777777]/60 focus:bg-white focus:outline-none focus:border-[#741321] focus:ring-1 focus:ring-[#741321] transition-colors h-9"
                />
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-2.5 px-4 rounded-lg bg-[#741321] hover:bg-[#5C0D1A] text-white text-xs font-bold tracking-wide uppercase transition-colors cursor-pointer disabled:opacity-60 h-10 shadow-xs mt-1"
            >
              {isBusy ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Please wait...</span>
                </div>
              ) : (
                <span>{activeTab === 'signin' ? 'SIGN IN' : 'SIGN UP'}</span>
              )}
            </button>
          </form>
        )}

        {/* Forgot Password View */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#202124] block">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[#F7F7F5] border border-[#E8E6E1] text-[#202124] placeholder-[#777777]/60 focus:bg-white focus:outline-none focus:border-[#741321] focus:ring-1 focus:ring-[#741321] transition-colors h-9"
              />
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-2.5 px-4 rounded-lg bg-[#741321] hover:bg-[#5C0D1A] text-white text-xs font-bold tracking-wide uppercase transition-colors cursor-pointer disabled:opacity-60 h-10 shadow-xs"
            >
              {isBusy ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Sending Link...</span>
                </div>
              ) : (
                <span>SEND RESET LINK</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('signin')}
              className="w-full py-2 text-xs font-semibold text-[#777777] hover:text-[#202124] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}

        {/* Divider & Social Login */}
        {activeTab !== 'forgot' && (
          <div className="mt-4 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-[#E8E6E1]"></div>
              <span className="text-[10px] font-semibold text-[#777777] uppercase tracking-wider">
                OR CONTINUE WITH
              </span>
              <div className="flex-1 h-[1px] bg-[#E8E6E1]"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isBusy}
              className="w-full py-2 px-3 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E8E6E1] text-xs font-semibold text-[#202124] flex items-center justify-center gap-2 transition-colors cursor-pointer h-9 shadow-2xs disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* Bottom Switch between Sign In and Sign Up */}
        {activeTab !== 'forgot' && (
          <div className="mt-5 pt-3.5 border-t border-[#E8E6E1] text-center text-xs text-[#777777]">
            {activeTab === 'signin' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('signup')}
                  className="font-bold text-[#741321] hover:underline cursor-pointer ml-1"
                >
                  SIGN UP
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('signin')}
                  className="font-bold text-[#741321] hover:underline cursor-pointer ml-1"
                >
                  SIGN IN
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
