// pages/_app.js
// Root component - wraps all pages with providers

import '../styles/globals.css';
import { AuthProvider } from '../lib/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#243b53', // ink-800
            color: '#d9e2ec',      // ink-100
            border: '1px solid #334e68', // ink-700
            borderRadius: '0.75rem',
            fontSize: '14px',
            fontFamily: 'Sora, sans-serif',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#white' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: 'white' },
          },
        }}
      />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
