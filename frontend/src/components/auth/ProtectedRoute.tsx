'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoginForm from './LoginForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-baby-powder)]">
        <div className="text-lg text-oxford_blue">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-baby-powder)]">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-lusitana text-[var(--color-raisin-black)] ">
            Ego Social Journal
          </h1>

          {/* Login Card */}
          <div className="bg-[var(--color-bright-pink-crayola)] rounded-2xl shadow-xl p-8 w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}