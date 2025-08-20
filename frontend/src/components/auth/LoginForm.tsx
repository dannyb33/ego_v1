'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { signIn, signUp, confirmSignUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (!username.trim() || !email.trim()) {
          setError('Username and email are required');
          setLoading(false);
          return;
        }
        await signUp(username, password, email);
        setShowConfirmation(true);
      } else {
        if (!email.trim()) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        await signIn(email, password);
      }
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Authentication Failed';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await confirmSignUp(username, confirmationCode);
      setShowConfirmation(false);
      setIsSignUp(false);
      await signIn(email, password);
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Confirmation failed';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!showConfirmation ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-[var(--color-raisin-black)]">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </h2>

          {isSignUp && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--color-raisin-black)]">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[var(--color-baby-powder)] rounded-md focus:ring-2 focus:ring-[var(--color-baby-powder)] focus:bg-[var(--color-baby-powder)]"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-raisin-black)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[var(--color-raisin-black)] rounded-md focus:ring-2 focus:ring-[var(--color-baby-powder)] focus:bg-[var(--color-baby-powder)]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--color-raisin-black)]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[var(--color-raisin-black)] rounded-md focus:ring-2 focus:ring-[var(--color-baby-powder)] focus:bg-[var(--color-baby-powder)]"
              required
            />
          </div>

          {error && <div className="text-[var(--color-red)] text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-raisin-black)] text-[var(--color-linen)] py-2 px-4 rounded-md hover:bg-[var(--color-eggplant)] disabled:opacity-50 transition cursor-pointer"
          >
            {loading ? (isSignUp ? 'Signing up...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>

          <p className="text-sm text-center text-[var(--color-oxford-blue)]">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="hover:underline cursor-pointer"
                  onClick={() => setIsSignUp(false)}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="hover:underline cursor-pointer"
                  onClick={() => setIsSignUp(true)}
                >
                  Sign Up
                </button>
              </>
            )}
          </p>
        </form>
      ) : (
        <form onSubmit={handleConfirm} className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-[var(--color-oxford-blue)]">Confirm Sign Up</h2>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-[var(--color-oxford-blue)]">
              Confirmation Code
            </label>
            <input
              id="code"
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[var(--color-oxford-blue)] rounded-md focus:ring-2 focus:ring-[var(--color-light-cyan)]"
              required
            />
          </div>

          {error && <div className="text-[var(--color-light-cyan)] text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-oxford-blue)] text-[var(--color-linen)] py-2 px-4 rounded-md hover:bg-[var(--color-light-cyan)] disabled:opacity-50 transition"
          >
            {loading ? 'Confirming...' : 'Confirm Sign Up'}
          </button>
        </form>
      )}
    </div>
  );
}
