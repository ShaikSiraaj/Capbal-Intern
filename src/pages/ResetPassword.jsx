import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    // Handle the hash fragment from Supabase reset email
    const handleSession = async () => {
      const hash = window.location.hash;

      if (hash && hash.includes('access_token')) {
        // Parse tokens from hash
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            setSessionError(true);
          } else {
            setSessionReady(true);
            // Clean up URL
            window.history.replaceState({}, document.title, '/reset-password');
          }
        } else {
          setSessionError(true);
        }
      } else {
        // Check if already logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSessionReady(true);
        } else {
          setSessionError(true);
        }
      }
    };

    handleSession();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => { window.location.href = '/'; }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif">Set new password</CardTitle>
          <p className="text-muted-foreground text-sm">Enter your new password below</p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <p className="text-green-600 font-medium">Password updated successfully!</p>
              <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
            </div>
          ) : sessionError ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <p className="text-destructive font-medium">Invalid or expired reset link</p>
              <p className="text-sm text-muted-foreground">Please request a new password reset link</p>
              <Button onClick={() => window.location.href = '/login'} variant="outline">
                Back to Login
              </Button>
            </div>
          ) : !sessionReady ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verifying reset link...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <Input type="password" placeholder="New password" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6} />
              <Input type="password" placeholder="Confirm new password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}