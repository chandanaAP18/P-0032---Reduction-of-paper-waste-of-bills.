// pages/404.js
// Custom 404 not found page

import Link from 'next/link';
import { Leaf, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 bg-ink-800 border border-ink-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Leaf className="w-10 h-10 text-ink-600" />
        </div>
        <h1 className="text-ink-400 text-8xl font-bold font-mono mb-4">404</h1>
        <h2 className="text-white text-xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-ink-400 text-sm mb-8 max-w-xs mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-leaf-600 hover:bg-leaf-500 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
