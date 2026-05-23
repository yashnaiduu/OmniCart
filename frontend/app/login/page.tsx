'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import { SPRING, MOTION_SPEEDS } from '@/lib/motion';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = isSignup
        ? await authApi.signup(email, password)
        : await authApi.login(email, password);

      const data = res.data.data;
      login(email, data.access_token, data.refresh_token);
      router.push('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(
        error.response?.data?.error?.message || 'Something went wrong. Try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient lightwells */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] luxon-lightwell luxon-lightwell-violet animate-luxon-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] luxon-lightwell luxon-lightwell-cyan animate-luxon-pulse" style={{ animationDelay: '-4s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION_SPEEDS.cinematic.duration, ease: MOTION_SPEEDS.cinematic.ease }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-luxon-sm bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-violet-500/20">
              O
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white font-heading">
            OmniCart
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Form card */}
        <div className="luxon-glass rounded-luxon-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 font-heading">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 luxon-input rounded-luxon-sm text-sm"
                id="email-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 font-heading">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 luxon-input rounded-luxon-sm text-sm"
                id="password-input"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-luxon-sm"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              transition={SPRING.snappy}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-luxon-md text-sm font-semibold hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-violet-500/20 font-heading"
              id="submit-button"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isSignup ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : isSignup ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="text-sm text-gray-500 hover:text-violet-400 transition-all duration-200"
            >
              {isSignup
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
