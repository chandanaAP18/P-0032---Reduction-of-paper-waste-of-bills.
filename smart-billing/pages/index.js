// pages/index.js
// Public landing page with hero section and feature highlights

import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import {
  Leaf,
  QrCode,
  Shield,
  Zap,
  TreePine,
  FileText,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Digital Receipts',
    desc: 'Generate professional digital bills instantly. No more paper clutter.',
    color: 'text-leaf-400 bg-leaf-400/10',
  },
  {
    icon: QrCode,
    title: 'QR Code Access',
    desc: 'Every bill gets a unique QR code for instant mobile access.',
    color: 'text-blue-400 bg-blue-400/10',
  },
  {
    icon: Shield,
    title: 'Secure Storage',
    desc: 'Bills stored securely in the cloud. Access from anywhere, anytime.',
    color: 'text-purple-400 bg-purple-400/10',
  },
  {
    icon: Zap,
    title: 'Instant Generation',
    desc: 'Create and share bills in seconds, not minutes.',
    color: 'text-amber-400 bg-amber-400/10',
  },
  {
    icon: FileText,
    title: 'Customer Portal',
    desc: 'Customers can log in with their bill email or phone and view all receipts.',
    color: 'text-leaf-300 bg-leaf-300/10',
  },
];

const benefits = [
  'Eliminate paper waste',
  'Cloud-backed bill history',
  'QR code for each bill',
  'Eco impact tracking',
  'Works on mobile devices',
  'Free to get started',
  'Customer receipt portal',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />

      {/* ── Hero Section ─────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-leaf-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-32 h-32 bg-leaf-400/10 rounded-full blur-2xl animate-float" />
        <div
          className="absolute top-60 left-10 w-20 h-20 bg-blue-400/10 rounded-full blur-xl animate-float"
          style={{ animationDelay: '2s' }}
        />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-leaf-900/60 border border-leaf-700/50 rounded-full px-4 py-1.5 mb-6">
            <Leaf className="w-3.5 h-3.5 text-leaf-400" />
            <span className="text-leaf-300 text-xs font-medium">
              Go Paperless. Save the Planet.
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
            Smart{' '}
            <span className="text-gradient">Digital</span>
            <br />
            Billing System
          </h1>

          <p className="text-ink-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Replace paper receipts with beautiful digital bills. Store, access,
            and share invoices instantly — while tracking your positive impact
            on the environment.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-leaf-600 hover:bg-leaf-500 text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-leaf-500/20 hover:-translate-y-0.5"
            >
              Start for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-ink-800 hover:bg-ink-700 text-ink-200 border border-ink-600 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/customer/login"
              className="inline-flex items-center gap-2 border border-leaf-700/40 bg-leaf-900/20 hover:bg-leaf-900/30 text-leaf-100 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all"
            >
              Customer Receipts
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-ink-500 text-xs mt-6">
            No credit card required · Free forever · Open source
          </p>
        </div>
      </section>

      {/* ── Stats Section ────────────────────────────── */}
      <section className="py-12 px-4 border-y border-ink-700/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '100%', label: 'Paperless' },
            { value: '0g', label: 'Waste Created' },
            { value: '∞', label: 'Bills Stored' },
            { value: '🌱', label: 'Eco Friendly' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-leaf-300 text-3xl font-bold font-mono">{value}</p>
              <p className="text-ink-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Everything you need
            </h2>
            <p className="text-ink-400 text-lg max-w-xl mx-auto">
              A complete billing solution designed for the digital age
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="bg-ink-800 border border-ink-700 rounded-2xl p-6 hover:border-ink-600 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-ink-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────── */}
      <section className="py-20 px-4 bg-ink-800/50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-leaf-900/60 border border-leaf-700/50 rounded-full px-3 py-1 mb-4">
              <TreePine className="w-3.5 h-3.5 text-leaf-400" />
              <span className="text-leaf-300 text-xs">Why go digital?</span>
            </div>
            <h2 className="font-display text-3xl text-white mb-4">
              Good for business,
              <br />
              <span className="text-gradient">great for the planet</span>
            </h2>
            <p className="text-ink-400 text-sm leading-relaxed mb-6">
              The average business prints thousands of receipts per year. Each one
              wastes paper, ink, and energy. BillGreen makes going digital effortless.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-leaf-600 hover:bg-leaf-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-leaf-400 shrink-0" />
                <span className="text-ink-200 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-leaf-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-8 h-8 text-leaf-400" />
          </div>
          <h2 className="font-display text-3xl text-white mb-4">
            Ready to go paperless?
          </h2>
          <p className="text-ink-400 mb-8">
            Join thousands of businesses reducing their environmental footprint.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-leaf-600 hover:bg-leaf-500 text-white px-10 py-4 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-leaf-500/20 hover:-translate-y-0.5"
          >
            Create Your Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-700 py-8 px-4 text-center">
        <p className="text-ink-500 text-sm">
          © {new Date().getFullYear()} BillGreen. Built with 💚 for the planet.
        </p>
      </footer>
    </div>
  );
}
