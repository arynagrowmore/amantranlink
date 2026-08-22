import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/wedding';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  signupWithEmail: (name: string, email: string, pass: string, phone?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalIntent: string;
  setAuthModalIntent: (intent: string) => void;
  requireAuth: (intent?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to format Supabase auth errors into friendly user messages
const formatAuthError = (err: any): string => {
  if (!err) return 'Authentication failed. Please try again.';
  const msg = typeof err === 'string' ? err : err.message || '';

  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Email or password is incorrect.';
  }
  if (msg.includes('User already registered') || msg.includes('already registered')) {
    return 'An account with this email already exists. Please sign in.';
  }
  if (msg.includes('Password should be at least') || msg.includes('weak_password')) {
    return 'Please choose a stronger password (minimum 6 characters).';
  }
  if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (msg.includes('Network') || msg.includes('Failed to fetch')) {
    return 'Unable to connect to authentication server. Please check your internet connection.';
  }
  if (msg.includes('Supabase backend configuration is missing')) {
    return 'Authentication service is not configured correctly. Please contact administrator.';
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
  const [authModalIntent, setAuthModalIntent] = useState<string>('Log in to unlock and customize your Shahi Kankotri');

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
              role: 'couple',
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

    const name = dbProfile?.name || googleName;
    const avatarUrl = dbProfile?.avatar_url || googleAvatar;
    const phone = dbProfile?.phone || authUser.user_metadata?.phone || defaultPhone || '+91 9409360336';
    const role = dbProfile?.role || 'couple';

    return {
      uid: authUser.id,
      name,
      email: authUser.email || '',
      phone,
      avatar_url: avatarUrl,
      photoURL: avatarUrl,
      role,
      createdAt: authUser.created_at || new Date().toISOString(),
    };
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && isMounted) {
        setSupabaseUser(session.user);
        const profile = await fetchProfileFromDb(session.user);
        setUser(profile);
        localStorage.setItem('SHAHI_AUTH_USER', JSON.stringify(profile));
      } else if (isMounted) {
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

      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !pass) {
        throw new Error('Please enter your email address and password.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: pass,
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

  // 2. Signup with Email & Password (Supabase Auth)
  const signupWithEmail = async (
    name: string, 
    email: string, 
    pass: string, 
    phone: string = '+91 9409360336'
  ): Promise<boolean> => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase authentication is not configured. Check your environment variables.');
      }

      const normalizedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();
      const trimmedPhone = phone.trim() || '+91 9409360336';

      if (!trimmedName) {
        throw new Error('Please enter your full name or couple names.');
      }
      if (!normalizedEmail) {
        throw new Error('Please enter your email address.');
      }
      if (!pass || pass.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: pass,
        options: {
          data: {
            name: trimmedName,
            full_name: trimmedName,
            phone: trimmedPhone,
          }
        }
      });

      if (error) throw error;
      if (data.user) {
        setSupabaseUser(data.user);
        const profile = await fetchProfileFromDb(data.user, trimmedName, trimmedPhone);
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

      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
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
      return true;
    } catch (error: any) {
      throw new Error(formatAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  // 4. Logout (Real Supabase signOut)
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

  // 5. Auth Guard Check
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
        logout,
        refreshUser,
        showAuthModal,
        setShowAuthModal,
        authModalIntent,
        setAuthModalIntent,
        requireAuth,
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
