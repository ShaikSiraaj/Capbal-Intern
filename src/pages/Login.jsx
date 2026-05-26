import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/api/supabase';
import {
  BookMarked, Loader2, ArrowLeft, Mail, KeyRound,
  Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2
} from 'lucide-react';

// ── Reusable input with show/hide toggle for passwords ──
function PasswordInput({ placeholder, value, onChange, required, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function EmailInput({ value, onChange, required }) {
  return (
    <div className="relative">
      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type="email"
        placeholder="Email address"
        value={value}
        onChange={onChange}
        required={required}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
      />
    </div>
  );
}

// ── OTP digit boxes ──
function OtpInput({ value, onChange }) {
  return (
    <div className="flex justify-center gap-3">
      {[...Array(6)].map((_, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => {
            const digits = value.split('');
            digits[i] = e.target.value.replace(/\D/, '');
            onChange(digits.join(''));
            if (e.target.value && i < 5) {
              document.getElementById(`otp-${i + 1}`)?.focus();
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Backspace' && !value[i] && i > 0) {
              document.getElementById(`otp-${i - 1}`)?.focus();
            }
          }}
          id={`otp-${i}`}
          className="w-11 h-12 rounded-xl border border-border bg-background/60 text-center text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
        />
      ))}
    </div>
  );
}

// ── Strength meter ──
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-500'];
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= score ? colors[score] : 'bg-border'}`} />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-xs ${score <= 1 ? 'text-red-500' : score <= 2 ? 'text-amber-500' : 'text-emerald-600'}`}>
          {labels[score]} password
        </p>
      )}
    </div>
  );
}

export default function Login() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const reset = () => { setError(''); setMessage(''); };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true); reset();
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setMode('otp');
      setMessage(`Password reset link sent to ${email}`);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true); reset();
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw error;
      setMode('newpassword');
      setMessage('OTP verified! Set your new password.');
    } catch {
      setError('Invalid or expired OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); reset();
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage('Password updated! Redirecting…');
      setTimeout(() => { window.location.href = '/'; }, 1500);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true); reset();
    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) throw new Error('Passwords do not match');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        window.location.href = '/';
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/';
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const titles = {
    signin: 'Welcome back',
    signup: 'Create account',
    forgot: 'Reset password',
    otp: 'Check your email',
    newpassword: 'Set new password',
  };
const subtitles = {
    signin: 'Sign in to continue your learning journey',
    signup: 'Start learning smarter, for free',
    forgot: "We'll send a password reset link to your email",
    otp: `Check your email — we sent a reset link to ${email}`,
    newpassword: 'Choose a strong new password',
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] bg-primary text-primary-foreground p-10 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <BookMarked className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="font-serif text-lg font-semibold tracking-tight">Mine</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-primary-foreground/50 -mt-0.5">Study Atelier</div>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary-foreground/50 mb-3 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-accent" /> AI-Powered Learning
          </div>
          <h2 className="font-serif text-3xl font-semibold leading-snug mb-5">
            <em className="italic text-accent">Learn deeply,</em><br />
            recall effortlessly.
          </h2>
          <p className="text-primary-foreground/60 text-sm leading-relaxed">
            Upload any study material and Mine instantly creates flashcards, quizzes, and audio summaries — powered by AI.
          </p>

          {/* Mini feature list */}
          <div className="mt-8 space-y-3">
            {[
              'AI flashcards from any PDF',
              'Adaptive quizzes that target weak spots',
              'Spaced repetition for long-term memory',
              'Voice Q&A — learn hands-free',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-primary-foreground/70">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <p className="text-xs text-primary-foreground/40 font-serif italic">
            "The mind is not a vessel to be filled, but a fire to be kindled."
          </p>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <BookMarked className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-semibold">Mine</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Back link */}
          {(mode === 'forgot' || mode === 'otp' || mode === 'newpassword') && (
            <button
              onClick={() => { setMode('signin'); setOtp(''); setNewPassword(''); setConfirmNewPassword(''); reset(); }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </button>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-semibold mb-1.5">{titles[mode]}</h1>
            <p className="text-muted-foreground text-sm">{subtitles[mode]}</p>
          </div>

          {/* ── SIGN IN / SIGN UP ── */}
          {(mode === 'signin' || mode === 'signup') && (
            <form onSubmit={handleAuth} className="space-y-4">
              <EmailInput value={email} onChange={e => setEmail(e.target.value)} required />
              <PasswordInput placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              {mode === 'signup' && (
                <>
                  <PasswordInput placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
                  <PasswordStrength password={password} />
                </>
              )}
              {mode === 'signin' && (
                <div className="flex justify-end -mt-1">
                  <button type="button" onClick={() => { setMode('forgot'); reset(); }}
                    className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}
              {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
              {message && <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{message}</p>}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'signin' ? 'Sign in' : 'Create account'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* ── FORGOT ── */}
          {mode === 'forgot' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-primary/5 border border-primary/15 rounded-xl text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                Enter your email address.
              </div>
              <EmailInput value={email} onChange={e => setEmail(e.target.value)} required />
              {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Mail
              </button>
            </form>
          )}

          {/* ── OTP (reset link sent) ── */}
          {mode === 'otp' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
              </div>
              {message && (
                <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg text-center">
                  {message}
                </p>
              )}
              <div className="bg-secondary/50 border border-border rounded-xl p-4 text-sm text-muted-foreground space-y-2">
                <p>✅ Check your inbox at <span className="font-medium text-foreground">{email}</span></p>
                <p>✅ Click the reset link in the email</p>
                <p>✅ You'll be brought back to set a new password</p>
              </div>
              {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
              <button
                onClick={() => { setMode('forgot'); reset(); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground text-center transition-colors"
              >
                Didn't receive an email? Send again
              </button>
            </div>
          )}

          {/* ── NEW PASSWORD ── */}
          {mode === 'newpassword' && (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              {message && <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{message}</p>}
              <PasswordInput placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
              <PasswordStrength password={newPassword} />
              <PasswordInput placeholder="Confirm new password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required minLength={6} />
              {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Update password
              </button>
            </form>
          )}

          {/* Switch signin/signup */}
          {(mode === 'signin' || mode === 'signup') && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); reset(); }}
                className="text-primary hover:underline font-medium">
                {mode === 'signup' ? 'Sign in' : 'Sign up for free'}
              </button>
            </p>
          )}

          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
