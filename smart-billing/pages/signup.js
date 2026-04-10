// pages/signup.js
// New user registration with name, email, password

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/AuthContext';
import { Input, Button } from '../components/ui';
import { Leaf, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const { signup, user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    router.push('/dashboard');
    return null;
  }

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    else if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address';

    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await signup(form.name.trim(), form.email, form.password);
      toast.success('Account created! Welcome to BillGreen 🌱');
      router.push('/dashboard');
    } catch (error) {
      const messages = {
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/weak-password': 'Password is too weak',
        'auth/invalid-email': 'Invalid email address',
      };
      toast.error(messages[error.code] || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-leaf-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-leaf-500 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-white text-xl font-semibold">BillGreen</span>
          </Link>
          <h1 className="text-white text-2xl font-bold">Create your account</h1>
          <p className="text-ink-400 text-sm mt-2">Start your paperless journey today 🌱</p>
        </div>

        {/* Form */}
        <div className="bg-ink-800 border border-ink-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="Jane Smith"
              icon={User}
              value={form.name}
              onChange={updateField('name')}
              error={errors.name}
              autoComplete="name"
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={updateField('email')}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              icon={Lock}
              value={form.password}
              onChange={updateField('password')}
              error={errors.password}
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              icon={Lock}
              value={form.confirmPassword}
              onChange={updateField('confirmPassword')}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-ink-400 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-leaf-400 hover:text-leaf-300 font-medium">
            Sign in
          </Link>
        </p>

        <p className="text-center mt-4">
          <Link href="/" className="text-ink-500 hover:text-ink-300 text-xs">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
