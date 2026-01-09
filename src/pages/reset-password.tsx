import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import supabase from '../helper/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/fonzoLogo.jpg';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state change listener FIRST to catch PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsValidSession(true);
          setIsChecking(false);
          setError('');
        } else if (event === 'SIGNED_IN' && session) {
          // User might already be signed in from the recovery link
          setIsValidSession(true);
          setIsChecking(false);
          setError('');
        }
      }
    );

    // Check if there's a hash in the URL (Supabase recovery tokens)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (accessToken && type === 'recovery') {
      // Supabase will automatically handle the token exchange
      // The onAuthStateChange listener will catch the PASSWORD_RECOVERY event
      // Just wait for it to process
      return () => subscription.unsubscribe();
    }

    // No hash params - check for existing valid session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setIsValidSession(true);
      } else {
        setError('Invalid or expired reset link. Please request a new one.');
      }
      setIsChecking(false);
    };

    // Small delay to allow Supabase to process any tokens
    const timer = setTimeout(checkSession, 500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage('Password reset successful! Redirecting to login...');
      // Sign out and redirect to login
      await supabase.auth.signOut();
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Verifying reset link...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img
            src={Logo}
            alt="Fonzo Logo"
            className="w-20 h-20 rounded-full mb-4 ring-2 ring-white/20"
          />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            FONZO CALIBRATION
          </h1>
        </div>

        {/* Form Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Reset your password
          </h2>
          <p className="text-gray-400">
            Enter your new password below
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-400 text-center">{message}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        {isValidSession ? (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-sm font-medium text-gray-200"
              >
                New password
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white focus:ring-white/20"
                required
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-200"
              >
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white focus:ring-white/20"
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Resetting password...
                </span>
              ) : (
                'Reset password'
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <Button
              onClick={() => navigate('/login')}
              className="h-12 px-8 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-200 hover:cursor-pointer"
            >
              Back to login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
