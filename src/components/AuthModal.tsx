import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Lock, User, Phone, Loader2, Eye, EyeOff, 
  ArrowLeft, Heart, Camera, CheckCircle2, ShieldCheck
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
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAuthModal) {
        setShowAuthModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAuthModal, setShowAuthModal]);

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
    if (actionLoading || isGoogleLoading) return;
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

  // 2. Handle Google OAuth with loading and double-click prevention
  const handleGoogleLogin = async () => {
    if (actionLoading || isGoogleLoading) return;
    clearMessages();
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setIsGoogleLoading(false);
      setError(err?.message || 'Unable to connect with Google. Please try again or use email sign-in.');
    }
  };

  // 3. Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actionLoading || isGoogleLoading) return;
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

  const isBusy = loading || actionLoading || isGoogleLoading;
  const isPartner = userRole === 'partner';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-xs animate-fadeIn font-manrope overflow-y-auto"
      onClick={() => setShowAuthModal(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* 👑 ELEVATED WARM IVORY & ANTIQUE GOLD AUTHENTICATION CARD */}
      <div 
        className="relative w-full max-w-[420px] bg-[#FFFDF8] rounded-3xl border border-[#E8D5AD] shadow-[0_20px_60px_rgba(36,26,23,0.25)] p-6 sm:p-8 text-[#241A17] my-auto animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Ornament Border Accent */}
        <div className="absolute top-0 left-8 right-8 h-1 bg-linear-to-r from-transparent via-[#C49A35] to-transparent rounded-full opacity-80" />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF5EB] hover:bg-[#EFE5D3] text-[#7A6B65] hover:text-[#241A17] flex items-center justify-center transition-colors cursor-pointer border border-[#E8D5AD]/60 focus:outline-none focus:ring-2 focus:ring-[#C49A35]"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Branding */}
        <div className="flex flex-col items-center text-center space-y-3 mb-5">
          {/* Logo & Brand Wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#6E1020]/10 border border-[#C49A35]/30 flex items-center justify-center shadow-xs">
              <img 
                src="/amantranlink.png" 
                alt="AmantranLink" 
                className="h-6 w-auto object-contain" 
              />
            </div>
            <div className="text-left">
              <span className="font-cormorant font-bold text-lg tracking-wider text-[#350811] block leading-none">
                AMANTRAN<span className="text-[#C49A35]">LINK</span>
              </span>
              <span className="text-[8px] font-mono font-medium text-[#8C7A73] uppercase tracking-widest block leading-none mt-0.5">
                ROYAL DIGITAL INVITATIONS
              </span>
            </div>
          </div>

          {/* Account Type Selector (Couple vs Studio Partner) */}
          <div className="inline-flex p-1 bg-[#F4EFE6] rounded-xl border border-[#E0D2BC]">
            <button
              type="button"
              onClick={() => handleRoleChange('end_customer')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                !isPartner 
                  ? 'bg-white text-[#6E1020] shadow-xs font-bold border border-[#E8D5AD]/80' 
                  : 'text-[#6D5D57] hover:text-[#241A17]'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Couple</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('partner')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPartner 
                  ? 'bg-white text-[#6E1020] shadow-xs font-bold border border-[#E8D5AD]/80' 
                  : 'text-[#6D5D57] hover:text-[#241A17]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Studio Partner</span>
            </button>
          </div>

          {/* Title & Brand Slogan */}
          <div>
            <h2 id="auth-modal-title" className="font-cormorant text-2xl font-bold tracking-tight text-[#241A17]">
              {activeTab === 'signin' && (isPartner ? 'Studio Partner Access' : 'Enter Your Wedding Atelier')}
              {activeTab === 'signup' && (isPartner ? 'Join Studio Network' : 'Begin Your Wedding Journey')}
              {activeTab === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-xs text-[#6D5D57] mt-1 leading-relaxed max-w-[320px] mx-auto">
              {activeTab === 'signin' && (isPartner 
                ? 'Sign in to manage client wedding websites, invitations & branding.' 
                : 'Sign in to customize names, auspicious timings, music, photos & RSVP.')}
              {activeTab === 'signup' && (isPartner 
                ? 'Create a studio account to publish client wedding websites.' 
                : 'Create your account and craft an unforgettable digital invitation.')}
              {activeTab === 'forgot' && 'Enter your email to receive a secure password reset link.'}
            </p>
          </div>
        </div>

        {/* Intent Badge if present */}
        {authModalIntent && !authModalIntent.toLowerCase().includes('log in to unlock') && (
          <div className="mb-4 px-3 py-1.5 rounded-xl bg-[#FAF5EB] border border-[#E8D5AD] text-[11px] text-[#6E1020] font-medium text-center">
            {authModalIntent}
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* 1-Click Google OAuth Button (High-Trust Top Placement) */}
        {activeTab !== 'forgot' && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isBusy}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAF5EB] border border-[#D5C29E] text-xs font-semibold text-[#241A17] flex items-center justify-center gap-2.5 transition-all cursor-pointer h-11 shadow-xs hover:border-[#C49A35] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#C49A35]"
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-2 text-[#6E1020]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting with Google...</span>
                </div>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#E8D5AD]"></div>
              <span className="text-[10px] font-semibold text-[#8C7A73] uppercase tracking-wider">
                Or with email
              </span>
              <div className="flex-1 h-px bg-[#E8D5AD]"></div>
            </div>
          </div>
        )}

        {/* Form Fields */}
        {activeTab !== 'forgot' && (
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {/* Sign Up Specific Fields */}
            {activeTab === 'signup' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#241A17] block">
                    {isPartner ? 'Contact / Lead Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isPartner ? 'e.g. Vikram Sharma' : 'e.g. Rudra & Ishani'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF5EB] border border-[#E0D2BC] text-[#241A17] placeholder-[#8C7A73]/70 focus:bg-white focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35] transition-colors h-10"
                  />
                </div>

                {isPartner && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#241A17] block">
                      Studio / Photography Brand Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Lens Photography"
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF5EB] border border-[#E0D2BC] text-[#241A17] placeholder-[#8C7A73]/70 focus:bg-white focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35] transition-colors h-10"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#241A17] block">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF5EB] border border-[#E0D2BC] text-[#241A17] placeholder-[#8C7A73]/70 focus:bg-white focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35] transition-colors h-10"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#241A17] block">
                  Password
                </label>
                {activeTab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => handleTabChange('forgot')}
                    className="text-[11px] font-medium text-[#6E1020] hover:underline cursor-pointer"
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
                  className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl bg-[#FAF5EB] border border-[#E0D2BC] text-[#241A17] placeholder-[#8C7A73]/70 focus:bg-white focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35] transition-colors h-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A73] hover:text-[#241A17] cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Phone for Signup */}
            {activeTab === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#241A17] flex items-center justify-between">
                  <span>WhatsApp / Phone</span>
                  {!isPartner && <span className="text-[10px] text-[#8C7A73] font-normal">Optional</span>}
                </label>
                <input
                  type="tel"
                  required={isPartner}
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF5EB] border border-[#E0D2BC] text-[#241A17] placeholder-[#8C7A73]/70 focus:bg-white focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35] transition-colors h-10"
                />
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-2.5 px-4 rounded-xl bg-[#6E1020] hover:bg-[#560D1A] text-white text-xs font-bold tracking-wide uppercase transition-all cursor-pointer disabled:opacity-60 h-11 shadow-sm mt-2 border border-[#C49A35]/30 focus:outline-none focus:ring-2 focus:ring-[#C49A35]"
            >
              {actionLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Please wait...</span>
                </div>
              ) : (
                <span>{activeTab === 'signin' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>
        )}

        {/* Forgot Password View */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#241A17] block">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF5EB] border border-[#E0D2BC] text-[#241A17] placeholder-[#8C7A73]/70 focus:bg-white focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35] transition-colors h-10"
              />
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-2.5 px-4 rounded-xl bg-[#6E1020] hover:bg-[#560D1A] text-white text-xs font-bold tracking-wide uppercase transition-all cursor-pointer disabled:opacity-60 h-11 shadow-sm border border-[#C49A35]/30 focus:outline-none focus:ring-2 focus:ring-[#C49A35]"
            >
              {actionLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Sending Link...</span>
                </div>
              ) : (
                <span>Send Password Reset Link</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('signin')}
              className="w-full py-2 text-xs font-semibold text-[#6D5D57] hover:text-[#241A17] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}

        {/* Bottom Switch between Sign In and Sign Up */}
        {activeTab !== 'forgot' && (
          <div className="mt-5 pt-4 border-t border-[#E8D5AD] text-center text-xs text-[#6D5D57]">
            {activeTab === 'signin' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('signup')}
                  className="font-bold text-[#6E1020] hover:underline cursor-pointer ml-1"
                >
                  Create Account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('signin')}
                  className="font-bold text-[#6E1020] hover:underline cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        )}

        {/* Subtle Trust Layer Footer */}
        <div className="mt-4 pt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#8C7A73]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>Your wedding details stay private and secure.</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
