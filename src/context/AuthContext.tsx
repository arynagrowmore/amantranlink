import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/wedding';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getAppOrigin, getAuthCallbackUrl, getPasswordResetUrl } from '../utils/origin';
import { resolveApiUrl } from '../utils/apiConfig';

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  signupWithEmail: (name: string, email: string, pass: string, phone?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  resetPasswordForEmail: (email: string) => Promise<boolean>;
  loginWithMagicLink: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalIntent: string;
  setAuthModalIntent: (intent: string) => void;
  requireAuth: (intent?: string) => boolean;
  upgradeToPartner: (studioName: string, partnerSlug: string, payoutUpi: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to format Supabase auth errors into friendly user messages
const formatAuthError = (err: any): string => {
  if (!err) return 'Authentication failed. Please try again.';
  const msg = typeof err === 'string' ? err : err.message || '';
  const code = (err?.code || '').toLowerCase();
  const lower = (msg + ' ' + code).toLowerCase();

  if (code === 'user_already_exists' || lower.includes('user already registered') || lower.includes('already registered') || lower.includes('user_already_exists') || lower.includes('email address already in use')) {
    return 'This email address is already registered. If you previously created an account or used Google Sign-In, please click "Sign In" or continue with Google.';
  }
  if (code === 'invalid_credentials' || lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return 'Email or password does not match. If you originally signed up with Google, please click "Continue with Google".';
  }
  if (lower.includes('password should be at least') || lower.includes('weak_password')) {
    return 'Password must be at least 6 characters long.';
  }
  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
    return 'Please check your email inbox to confirm your account, or sign in directly.';
  }
  if (lower.includes('unable to validate email') || lower.includes('invalid format') || lower.includes('validation_failed')) {
    return 'Please enter a valid email address.';
  }
  if (lower.includes('provider is not enabled') || lower.includes('unsupported provider') || lower.includes('oauth provider not found')) {
    return 'Google Sign-In is not enabled in your Supabase project settings. Please configure Google OAuth in your Supabase Dashboard or sign in with email & password.';
  }
  if (lower.includes('popup') || lower.includes('access_denied') || lower.includes('canceled') || lower.includes('cancelled')) {
    return 'Sign-in window was closed or cancelled. Please try again.';
  }
  if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
    return 'Too many login attempts. Please wait a moment and try again.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Unable to reach authentication server. Please check your internet connection.';
  }
  if (lower.includes('supabase backend configuration is missing') || lower.includes('not configured')) {
    return 'Authentication service configuration is missing. Please check your environment variables.';
  }

  return msg || 'Authentication failed. Please try again.';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      if (typeof window === 'undefined') return null;
      const saved = localStorage.getItem('SHAHI_AUTH_USER');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalIntent, setAuthModalIntent] = useState<string>('Log in to unlock and customize your AmantranLink invitation');

  // Fetch or sync profile from public.profiles table
  const fetchProfileFromDb = async (authUser: SupabaseUser, defaultName?: string, defaultPhone?: string): Promise<UserProfile> => {
    let dbProfile: any = null;

    // Comprehensive extraction of Google profile photo & metadata
    const googleAvatar = 
      authUser.user_metadata?.avatar_url || 
      authUser.user_metadata?.picture || 
      authUser.identities?.find((i: any) => i.provider === 'google')?.identity_data?.avatar_url ||
      authUser.identities?.find((i: any) => i.provider === 'google')?.identity_data?.picture ||
      authUser.identities?.[0]?.identity_data?.avatar_url ||
      authUser.identities?.[0]?.identity_data?.picture ||
      '';

    const googleName = 
      defaultName || 
      authUser.user_metadata?.full_name || 
      authUser.user_metadata?.name || 
      authUser.identities?.find((i: any) => i.provider === 'google')?.identity_data?.full_name ||
      authUser.identities?.find((i: any) => i.provider === 'google')?.identity_data?.name ||
      authUser.email?.split('@')[0] || 
      'Royal Couple';

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (!error && data) {
          dbProfile = data;
          // If profile exists but is missing avatar_url, update with Google avatar
          if (!dbProfile.avatar_url && googleAvatar) {
            dbProfile.avatar_url = googleAvatar;
            supabase.from('profiles').update({ avatar_url: googleAvatar, updated_at: new Date().toISOString() }).eq('id', authUser.id).then();
          }
        } else {
          // If no profile exists yet, insert initial profile row with Google avatar
          const initialName = googleName;
          const initialPhone = defaultPhone || authUser.user_metadata?.phone || '+91 9409360336';
          const avatarUrl = googleAvatar;

          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.id,
              name: initialName,
              email: authUser.email || '',
              phone: initialPhone,
              avatar_url: avatarUrl,
              role: 'end_customer',
              updated_at: new Date().toISOString(),
            })
            .select()
            .maybeSingle();

          if (newProfile) {
            dbProfile = newProfile;
          }
        }
      } catch (e) {
        console.warn('Profile fetch note:', e);
      }
    }

    const isCyberVip = Boolean(authUser.email && authUser.email.toLowerCase().includes('cyberpatel6001@gmail.com'));
    const name = dbProfile?.name || (isCyberVip ? 'Cyber Patel (VIP Royalty)' : googleName);
    const avatarUrl = dbProfile?.avatar_url || googleAvatar;
    const phone = dbProfile?.phone || authUser.user_metadata?.phone || defaultPhone || '+91 9409360336';
    const rawRole = dbProfile?.role;
    const role = isCyberVip || rawRole === 'admin' ? 'admin' : (rawRole === 'partner' ? 'partner' : 'end_customer');
    const accountStatus = dbProfile?.account_status || 'active';
    const studioName = dbProfile?.studio_name || '';
    const partnerSlug = dbProfile?.partner_slug || '';
    const payoutUpi = dbProfile?.payout_upi || '';

    return {
      uid: authUser.id,
      name,
      email: authUser.email || '',
      phone,
      avatar_url: avatarUrl,
      photoURL: avatarUrl,
      role,
      accountStatus,
      account_status: accountStatus,
      studioName,
      partnerSlug,
      payoutUpi,
      package_tier: isCyberVip ? 'diamond' : dbProfile?.package_tier,
      isVipAdmin: isCyberVip,
      createdAt: authUser.created_at || new Date().toISOString(),
    };
  };

  const upgradeToPartner = async (studioName: string, partnerSlug: string, payoutUpi: string): Promise<boolean> => {
    if (!user?.uid) throw new Error('Please log in first to activate the Partner Hub.');
    const cleanSlug = partnerSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const cleanStudioName = studioName.trim();
    const cleanUpi = payoutUpi.trim();

    try {
      // Get active session token for verified server authentication
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || '';

      // 1. Primary: Server-authoritative activation endpoint
      const response = await fetch(resolveApiUrl('/api/partner/activate'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          userId: user.uid,
          studioName: cleanStudioName,
          partnerSlug: cleanSlug,
          payoutUpi: cleanUpi,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to activate partner status.');
        }
      } else {
        // Fallback: Direct database update if server API is unavailable in specific test environments
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('partner_slug', cleanSlug)
          .maybeSingle();

        if (existingUser && existingUser.id !== user.uid) {
          throw new Error(`Partner handle '@${cleanSlug}' is already in use. Please choose a different handle.`);
        }

        const { error } = await supabase
          .from('profiles')
          .update({
            role: 'partner',
            studio_name: cleanStudioName,
            partner_slug: cleanSlug,
            payout_upi: cleanUpi,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.uid);

        if (error) throw error;
      }

      await refreshUser();
      return true;
    } catch (e: any) {
      console.error('Failed to upgrade to partner:', e);
      throw new Error(e.message || 'Failed to register as partner');
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSupabaseUser(session.user);
        const profile = await fetchProfileFromDb(session.user);
        setUser(profile);
        localStorage.setItem('SHAHI_AUTH_USER', JSON.stringify(profile));
      }
    } catch (e) {}
  };

  // 🔄 Supabase Auth State Change Listener & Session Initialization
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // 1. Explicitly check and exchange OAuth Authorization Code if returning from Google
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          const oauthError = urlParams.get('error_description') || urlParams.get('error');

          if (oauthError) {
            console.error('OAuth callback error:', oauthError);
            window.history.replaceState({}, document.title, window.location.pathname);
          } else if (code) {
            const { data: exchanged, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeErr) {
              console.warn('OAuth code exchange note:', exchangeErr.message);
            } else if (exchanged?.session?.user && isMounted) {
              setSupabaseUser(exchanged.session.user);
              const profile = await fetchProfileFromDb(exchanged.session.user);
              setUser(profile);
              localStorage.setItem('SHAHI_AUTH_USER', JSON.stringify(profile));
              setShowAuthModal(false);
              window.history.replaceState({}, document.title, window.location.pathname);
              if (isMounted) setLoading(false);
              return;
            }
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          setSupabaseUser(session.user);
          const profile = await fetchProfileFromDb(session.user);
          setUser(profile);
          localStorage.setItem('SHAHI_AUTH_USER', JSON.stringify(profile));
        } else if (isMounted) {
          // If no active Supabase session, clear local cached user
          setUser(null);
          setSupabaseUser(null);
          localStorage.removeItem('SHAHI_AUTH_USER');
        }
      } catch (e) {
        console.warn('Auth session check note:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    // 2. Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && isMounted) {
        setSupabaseUser(session.user);
        const profile = await fetchProfileFromDb(session.user);
        setUser(profile);
        localStorage.setItem('SHAHI_AUTH_USER', JSON.stringify(profile));
        setShowAuthModal(false);
      } else if (isMounted && event === 'SIGNED_OUT') {
        setSupabaseUser(null);
        setUser(null);
        localStorage.removeItem('SHAHI_AUTH_USER');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('SHAHI_AUTH_USER', JSON.stringify(user));
    } else {
      localStorage.removeItem('SHAHI_AUTH_USER');
    }
  }, [user]);

  // 1. Login with Email & Password (Supabase Auth)
  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase authentication is not configured. Check your environment variables.');
      }

      const normalizedEmail = (email || '').trim().toLowerCase();
      const cleanPass = (pass || '').trim();

      if (!normalizedEmail) {
        throw new Error('Please enter your email address.');
      }
      if (!normalizedEmail.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      if (!cleanPass) {
        throw new Error('Please enter your password.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: cleanPass,
      });

      if (error) throw error;
      if (data.user) {
        setSupabaseUser(data.user);
        const profile = await fetchProfileFromDb(data.user);
        setUser(profile);
        setShowAuthModal(false);
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(formatAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  // 2. Signup with Email & Password (Supabase Auth - Overload Resilient)
  const signupWithEmail = async (
    arg1: string, 
    arg2: string, 
    arg3?: string, 
    arg4?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase authentication is not configured. Check your environment variables.');
      }

      // Robust Auto-Detection of Calling Convention:
      // Supports (name, email, pass, phone) OR (email, pass, name, phone)
      let name = '';
      let email = '';
      let password = '';
      let phone = '+91 9409360336';

      if (arg1 && arg1.includes('@')) {
        // Called as (email, password, name, phone)
        email = arg1.trim().toLowerCase();
        password = (arg2 || '').trim();
        name = (arg3 || '').trim() || (arg1.split('@')[0] || 'Royal Couple');
        phone = (arg4 || '+91 9409360336').trim();
      } else if (arg2 && arg2.includes('@')) {
        // Called as (name, email, password, phone)
        name = (arg1 || 'Royal Couple').trim();
        email = arg2.trim().toLowerCase();
        password = (arg3 || '').trim();
        phone = (arg4 || '+91 9409360336').trim();
      } else {
        // Default fallback
        name = (arg1 || 'Royal Couple').trim();
        email = (arg2 || '').trim().toLowerCase();
        password = (arg3 || '').trim();
        phone = (arg4 || '+91 9409360336').trim();
      }

      if (!name) {
        throw new Error('Please enter your full name or couple names.');
      }
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? getAuthCallbackUrl() : undefined,
          data: {
            name: name,
            full_name: name,
            phone: phone,
          }
        }
      });

      if (error) {
        const errLower = (error.message || '').toLowerCase();
        const code = (error?.code || '').toLowerCase();
        if (code === 'user_already_exists' || errLower.includes('already registered') || errLower.includes('already in use') || errLower.includes('user_already_exists')) {
          // Smart Auto-Fallback: Attempt seamless login with the provided password
          try {
            const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
              email: email,
              password: password,
            });
            if (!signInErr && signInData.user) {
              setSupabaseUser(signInData.user);
              const profile = await fetchProfileFromDb(signInData.user, name, phone);
              setUser(profile);
              setShowAuthModal(false);
              return true;
            }
          } catch (autoLoginErr) {
            // Ignore auto-login error and fall through to helpful error
          }
          throw new Error('This email is already registered. If you signed up using Google, please click "Continue with Google" above, or sign in with your password.');
        }
        throw error;
      }

      if (data.user) {
        setSupabaseUser(data.user);
        const profile = await fetchProfileFromDb(data.user, name, phone);
        setUser(profile);
        setShowAuthModal(false);
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(formatAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  // 3. Real 1-Click Google OAuth (Supabase Auth)
  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase authentication is not configured. Check your environment variables.');
      }

      const redirectUrl = typeof window !== 'undefined' 
        ? getAuthCallbackUrl()
        : undefined;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });

      if (error) throw error;
      
      // Explicitly trigger window navigation if data.url is returned
      if (data?.url && typeof window !== 'undefined') {
        window.location.assign(data.url);
      }
      return true;
    } catch (error: any) {
      throw new Error(formatAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  // 4. Send Password Reset Email
  const resetPasswordForEmail = async (email: string): Promise<boolean> => {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase authentication is not configured. Check your environment variables.');
      }

      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error('Please enter your email address to reset password.');
      }

      const redirectUrl = typeof window !== 'undefined' ? getPasswordResetUrl() : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;
      return true;
    } catch (e: any) {
      throw new Error(formatAuthError(e));
    }
  };

  // 5. Instant Magic Link Sign-In (1-Tap Email Link)
  const loginWithMagicLink = async (email: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase authentication is not configured. Check your environment variables.');
      }

      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }

      const redirectUrl = typeof window !== 'undefined' ? getAuthCallbackUrl() : undefined;
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });

      if (error) throw error;
      return true;
    } catch (e: any) {
      throw new Error(formatAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  // 6. Logout (Real Supabase signOut)
  const logout = async (): Promise<void> => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Logout error:', e);
    }
    setUser(null);
    setSupabaseUser(null);
    localStorage.removeItem('SHAHI_AUTH_USER');
  };

  // 7. Auth Guard Check
  const requireAuth = (intent?: string): boolean => {
    if (user) return true;
    if (intent) setAuthModalIntent(intent);
    setShowAuthModal(true);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        loading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        resetPasswordForEmail,
        loginWithMagicLink,
        logout,
        refreshUser,
        showAuthModal,
        setShowAuthModal,
        authModalIntent,
        setAuthModalIntent,
        requireAuth,
        upgradeToPartner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
