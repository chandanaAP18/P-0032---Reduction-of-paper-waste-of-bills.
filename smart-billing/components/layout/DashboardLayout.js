import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import {
  Leaf,
  LayoutDashboard,
  FilePlus,
  FileText,
  User,
  Users,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/create-bill', label: 'Create Bill', icon: FilePlus },
  { href: '/dashboard/bills', label: 'My Bills', icon: FileText },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/admin', label: 'Admin', icon: Shield },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-ink-800 border-r border-ink-700 z-30 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-ink-700">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-leaf-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-white font-semibold">BillGreen</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-ink-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-4 border-b border-ink-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-leaf-600 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">{user?.displayName?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.displayName || 'User'}</p>
              <p className="text-ink-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="px-3 py-4 flex-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all ${isActive ? 'bg-leaf-600/20 text-leaf-400 border border-leaf-600/30' : 'text-ink-300 hover:bg-ink-700 hover:text-white'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-16 bg-ink-800 border-b border-ink-700 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-ink-400 hover:text-white"><Menu className="w-6 h-6" /></button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-leaf-500 rounded-md flex items-center justify-center"><Leaf className="w-3.5 h-3.5 text-white" /></div>
            <span className="font-display text-white font-semibold">BillGreen</span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
