import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import { Leaf } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ink-900/80 backdrop-blur-md border-b border-ink-700/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-leaf-500 rounded-lg flex items-center justify-center group-hover:bg-leaf-400 transition-colors">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-white text-lg font-semibold">BillGreen</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/" className="text-ink-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
            <Link href="/customer/login" className="text-ink-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Customer Receipts</Link>

            {user ? (
              <Link href="/dashboard" className="bg-leaf-600 hover:bg-leaf-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="text-ink-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Login</Link>
                <Link href="/signup" className="bg-leaf-600 hover:bg-leaf-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
