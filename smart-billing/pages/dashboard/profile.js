import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { User, Mail, Calendar, FileText, LogOut, Leaf, Save, Building2, Languages, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import { getUserBills } from '../../lib/bills';
import { getBillAnalytics } from '../../lib/billInsights';
import { getUserSettings, saveUserSettings } from '../../lib/userSettings';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input, Select, Toggle } from '../../components/ui';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bills, setBills] = useState([]);
  const [settings, setSettings] = useState({
    businessName: '',
    role: 'Admin',
    defaultDeliveryPreference: 'email',
    defaultPrintRequested: false,
    preferredLanguage: 'English',
    upiId: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    Promise.all([getUserBills(user.uid), getUserSettings(user)])
      .then(([billData, settingData]) => {
        setBills(billData);
        setSettings(settingData);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveUserSettings(user.uid, settings);
      toast.success('Profile settings saved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const joinedDate = user?.metadata?.creationTime
    ? format(new Date(user.metadata.creationTime), 'MMMM d, yyyy')
    : 'Unknown';

  const analytics = getBillAnalytics(bills);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold">Profile</h1>
          <p className="text-ink-400 text-sm mt-1">Account info, billing role, and digital-first defaults</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-leaf-500 to-leaf-700 flex items-center justify-center text-white text-2xl font-bold font-display shrink-0">
                  {user?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-white text-xl font-semibold">{user?.displayName || 'User'}</h2>
                  <p className="text-ink-400 text-sm">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 bg-leaf-400 rounded-full" />
                    <span className="text-leaf-400 text-xs font-medium">Active Account</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-white font-semibold mb-5">Account Details</h3>
              <div className="space-y-4">
                <DetailRow icon={User} label="Full Name" value={user?.displayName || 'Not set'} />
                <DetailRow icon={Mail} label="Email Address" value={user?.email} />
                <DetailRow icon={Calendar} label="Member Since" value={joinedDate} />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-white font-semibold">Business Settings</h3>
                  <p className="text-ink-400 text-sm">These defaults power bill creation, role tags, and payment options.</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSave}>
                <Input
                  label="Business Name"
                  icon={Building2}
                  value={settings.businessName || ''}
                  onChange={(event) => setSettings((current) => ({ ...current, businessName: event.target.value }))}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Role"
                    value={settings.role || 'Admin'}
                    onChange={(event) => setSettings((current) => ({ ...current, role: event.target.value }))}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Manager">Manager</option>
                  </Select>
                  <Select
                    label="Default Delivery Channel"
                    value={settings.defaultDeliveryPreference || 'email'}
                    onChange={(event) => setSettings((current) => ({ ...current, defaultDeliveryPreference: event.target.value }))}
                  >
                    <option value="email">email</option>
                    <option value="sms">sms</option>
                    <option value="whatsapp">whatsapp</option>
                    <option value="qr-link">qr-link</option>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Preferred Language"
                    value={settings.preferredLanguage || 'English'}
                    onChange={(event) => setSettings((current) => ({ ...current, preferredLanguage: event.target.value }))}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                  </Select>
                  <Input
                    label="UPI ID"
                    icon={CreditCard}
                    placeholder="yourname@bank"
                    value={settings.upiId || ''}
                    onChange={(event) => setSettings((current) => ({ ...current, upiId: event.target.value }))}
                  />
                </div>
                <Toggle
                  label="Default to digital-first billing"
                  description="When enabled, new bills stay paperless unless a customer specifically asks for print."
                  checked={!settings.defaultPrintRequested}
                  onChange={(checked) => setSettings((current) => ({ ...current, defaultPrintRequested: !checked }))}
                />
                <Button type="submit" loading={saving}>
                  <Save className="w-4 h-4" />
                  Save Settings
                </Button>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="text-white font-semibold mb-5">Your Stats</h3>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-ink-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
                  <StatBox label="Bills Created" value={analytics.totalBills} icon={FileText} color="text-leaf-400" />
                  <StatBox label="Total Revenue" value={`INR ${analytics.revenue.toLocaleString('en-IN')}`} icon={FileText} color="text-amber-400" />
                  <StatBox label="Paper Saved" value={`${analytics.eco.paperSavedGrams}g`} icon={Leaf} color="text-blue-400" />
                  <StatBox label="Role" value={settings.role || 'Admin'} icon={User} color="text-leaf-400" />
                  <StatBox label="Language" value={settings.preferredLanguage || 'English'} icon={Languages} color="text-amber-400" />
                </div>
              )}
            </Card>

            <Card className="border-red-900/30">
              <h3 className="text-white font-semibold mb-2">Sign Out</h3>
              <p className="text-ink-400 text-sm mb-4">You will be signed out of your account on this device.</p>
              <Button variant="danger" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 py-2 border-b border-ink-700 last:border-0">
      <div className="w-8 h-8 bg-ink-700 rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-ink-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-ink-400 text-xs">{label}</p>
        <p className="text-white text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-ink-700/50 rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      <p className="text-ink-400 text-xs mt-1">{label}</p>
    </div>
  );
}

