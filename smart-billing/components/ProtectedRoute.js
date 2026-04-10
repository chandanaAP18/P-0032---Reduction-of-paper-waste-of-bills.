// components/ProtectedRoute.js
// Higher-order component that redirects unauthenticated users to login

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show nothing while checking auth or if user is null (will redirect)
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-leaf-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-ink-300 font-mono text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  // User is authenticated — render the protected page
  return children;
}
