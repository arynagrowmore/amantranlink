import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigateToRoute } from '../utils/navigation';

export const ResetPasswordView: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPass = newPassword.trim();
    if (!cleanPass || cleanPass.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== confirmPassword.trim()) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: cleanPass
      });

      if (updateErr) {
        throw updateErr;
      }

      setIsSuccess(true);
      setTimeout(() => {
        navigateToRoute('/studio', true);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Please request a new reset link.');
    } finally {
      setLoading(false);
    }
  };

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

        <div className="space-y-1">
          <h2 className="font-cormorant font-bold text-2xl text-[#241A17] tracking-tight">
            Set New Password
          </h2>
          <p className="text-xs text-[#6D5D57] max-w-xs mx-auto leading-relaxed">
            Create a new secure password for your AmantranLink atelier account.
          </p>
        </div>

        {error && (
          <div className="w-full p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium text-left">
            {error}
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-3 animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-[#167A5A]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs text-emerald-800 font-semibold">
              Password updated successfully! Redirecting to your atelier…
            </p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="w-full space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#241A17] block">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl bg-[#FAF5EB] border border-[#E0D2BC] text-[#241A17] placeholder-[#8C7A73]/70 focus:bg-white focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35] transition-colors h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A73] hover:text-[#241A17] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#241A17] block">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF5EB] border border-[#E0D2BC] text-[#241A17] placeholder-[#8C7A73]/70 focus:bg-white focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35] transition-colors h-11"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#6E1020] hover:bg-[#560D1A] text-white text-xs font-bold tracking-wide uppercase transition-all cursor-pointer disabled:opacity-60 h-11 shadow-sm mt-2 border border-[#C49A35]/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Updating Password…</span>
                </div>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F4D06F]" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#E8D5AD]/60 flex items-center justify-center gap-1.5 text-[11px] text-[#8C7A73]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>AmantranLink Account Security</span>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordView;
