import { useEffect, useState } from 'react';

const STORAGE_KEY = 'billgreen-logged-in';
const USER_KEY = 'billgreen-user';
const LOGIN_ROUTE = '/login';
const DASHBOARD_ROUTE = '/dashboard';

function normalizeRoute(pathname) {
  if (pathname === LOGIN_ROUTE) return LOGIN_ROUTE;
  return DASHBOARD_ROUTE;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [route, setRoute] = useState(DASHBOARD_ROUTE);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedAuth = window.localStorage.getItem(STORAGE_KEY);
    const storedUser = window.localStorage.getItem(USER_KEY) || '';
    const pathname = window.location.pathname;
    const auth = storedAuth === 'true';

    setIsLoggedIn(auth);
    setUserEmail(storedUser);

    if (auth && pathname === LOGIN_ROUTE) {
      window.history.replaceState({}, '', DASHBOARD_ROUTE);
      setRoute(DASHBOARD_ROUTE);
    } else if (!auth && pathname !== LOGIN_ROUTE) {
      window.history.replaceState({}, '', LOGIN_ROUTE);
      setRoute(LOGIN_ROUTE);
    } else {
      setRoute(normalizeRoute(pathname));
    }

    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      setRoute(normalizeRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isLoggedIn && route !== LOGIN_ROUTE) {
      window.history.replaceState({}, '', LOGIN_ROUTE);
      setRoute(LOGIN_ROUTE);
    }
  }, [isLoggedIn, route]);

  const login = (email) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, 'true');
    window.localStorage.setItem(USER_KEY, email);
    setIsLoggedIn(true);
    setUserEmail(email);
    window.history.pushState({}, '', DASHBOARD_ROUTE);
    setRoute(DASHBOARD_ROUTE);
  };

  const logout = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(USER_KEY);
    setIsLoggedIn(false);
    setUserEmail('');
    window.history.pushState({}, '', LOGIN_ROUTE);
    setRoute(LOGIN_ROUTE);
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#020617', color: '#f8fafc' }}>
        <p>Loading authentication state…</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={login} />;
  }

  return <DashboardScreen userEmail={userEmail} onLogout={logout} />;
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    onLogin(email.trim());
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#e2e8f0', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#111827', borderRadius: '20px', padding: '32px', boxShadow: '0 25px 90px rgba(15,23,42,0.35)' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '1.75rem', fontWeight: 700 }}>Sign in to BillGreen</h1>
        <p style={{ marginBottom: '24px', color: '#94a3b8' }}>A protected dashboard requires authentication before access.</p>
        {error ? <div style={{ marginBottom: '18px', color: '#fecaca', background: '#422121', padding: '12px 14px', borderRadius: '12px' }}>{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '12px', color: '#cbd5e1' }}>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={{ width: '100%', marginTop: '8px', padding: '12px 14px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc' }}
              required
            />
          </label>
          <label style={{ display: 'block', marginBottom: '24px', color: '#cbd5e1' }}>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{ width: '100%', marginTop: '8px', padding: '12px 14px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc' }}
              required
            />
          </label>
          <button
            type="submit"
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#22c55e', color: '#020617', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            Login
          </button>
        </form>
        <p style={{ marginTop: '18px', fontSize: '0.95rem', color: '#94a3b8' }}>Use any email and password to access the protected dashboard.</p>
      </div>
    </div>
  );
}

function DashboardScreen({ userEmail, onLogout }) {
  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', padding: '28px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ marginBottom: '10px', color: '#94a3b8' }}>Welcome back</p>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Hello, {userEmail || 'BillGreen user'}!</h1>
          <p style={{ marginTop: '10px', color: '#cbd5e1' }}>Your dashboard is protected and available only after login.</p>
        </div>
        <button
          onClick={onLogout}
          style={{ padding: '12px 18px', borderRadius: '999px', background: '#ef4444', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
        >
          Logout
        </button>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <section style={{ padding: '24px', borderRadius: '24px', background: '#111827' }}>
          <h2 style={{ marginBottom: '12px', fontSize: '1.1rem', fontWeight: 700 }}>Protected content</h2>
          <p style={{ color: '#cbd5e1' }}>This page is available only after authentication. Logging out clears the login state and redirects back to the login screen.</p>
        </section>
        <section style={{ padding: '24px', borderRadius: '24px', background: '#111827' }}>
          <h2 style={{ marginBottom: '12px', fontSize: '1.1rem', fontWeight: 700 }}>Route protection</h2>
          <p style={{ color: '#cbd5e1' }}>If you visit the page without logging in, the app redirects you to <strong>{LOGIN_ROUTE}</strong>.</p>
        </section>
        <section style={{ padding: '24px', borderRadius: '24px', background: '#111827' }}>
          <h2 style={{ marginBottom: '12px', fontSize: '1.1rem', fontWeight: 700 }}>Login state</h2>
          <p style={{ color: '#cbd5e1' }}>Your login state is stored in localStorage. Clicking logout removes it completely.</p>
        </section>
      </main>
    </div>
  );
}
