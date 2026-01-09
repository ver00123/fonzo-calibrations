import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import supabase from '../helper/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/fonzoLogo.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSendResetLink = async () => {
    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setForgotLoading(false);

    if (error) {
      setForgotError(error.message);
    } else {
      setForgotMessage('A password reset link has been sent to your email. Please check your inbox and click the link.');
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotMessage('');
    setForgotError('');
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center border-r border-white/10">
        <div className="max-w-md text-center px-8">
          <img
            src={Logo}
            alt="Fonzo Logo"
            className="w-32 h-32 rounded-full mx-auto mb-8 ring-2 ring-white/20"
          />
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            FONZO CALIBRATION
          </h1>
          <p className="text-gray-400 text-lg">
            Precision calibration management system
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-10">
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
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Welcome back
            </h2>
            <p className="text-gray-400">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-200"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white focus:ring-white/20"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-200"
                >
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-gray-400 hover:text-white transition-colors hover:cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white focus:ring-white/20"
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {message && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{message}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a
              href="mailto:admin@fonzocalibration.com?subject=Account%20Request%20-%20Fonzo%20Calibration&body=Hello%2C%0A%0AI%20would%20like%20to%20request%20access%20to%20the%20Fonzo%20Calibration%20system.%0A%0AName%3A%20%0ACompany%3A%20%0AReason%20for%20access%3A%20%0A%0AThank%20you."
              className="text-white hover:underline font-medium hover:cursor-pointer"
            >
              Contact administrator
            </a>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111111] border border-white/10 rounded-xl w-full max-w-md p-6 relative">
            {/* Close Button */}
            <button
              onClick={closeForgotPassword}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors hover:cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Reset your password
              </h3>
              <p className="text-gray-400 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Success Message */}
            {forgotMessage && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-400">{forgotMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {forgotError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{forgotError}</p>
              </div>
            )}

            {/* Email Input */}
            {!forgotMessage && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-200">
                    Email address
                  </Label>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white focus:ring-white/20"
                    disabled={forgotLoading}
                  />
                </div>
                <Button
                  onClick={handleSendResetLink}
                  disabled={forgotLoading}
                  className="w-full h-12 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 hover:cursor-pointer"
                >
                  {forgotLoading ? 'Sending...' : 'Send reset link'}
                </Button>
              </div>
            )}

            {/* Back to login after success */}
            {forgotMessage && (
              <Button
                onClick={closeForgotPassword}
                className="w-full h-12 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-200 hover:cursor-pointer"
              >
                Back to login
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
