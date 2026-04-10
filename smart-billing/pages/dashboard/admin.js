import { useEffect, useMemo, useState } from 'react';
import { Shield, Download, Upload, AlertTriangle, TrendingUp, Users, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import { getAllBills, importBills } from '../../lib/bills';
import { getUserSettings } from '../../lib/userSettings';
import { Card, Button, Badge } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import AnalyticsChart from '../../components/AnalyticsChart';
import { exportBillsToJson, getAiInsights, getForecastData, detectFraudSignals, buildAdminSummary, getMonthlySeries, parseBackupFile } from '../../lib/advancedBilling';
import { formatCurrency } from '../../lib/billInsights';

export default function AdminPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([getUserSettings(user), getAllBills()])
      .then(([settingData, allBills]) => {
        setSettings(settingData);
        setBills(allBills);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Could not load admin dashboard');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const isAdmin = (settings?.role || 'Admin') === 'Admin';
  const monthlySeries = useMemo(() => getMonthlySeries(bills, 6), [bills]);
  const forecast = useMemo(() => getForecastData(bills), [bills]);
  const fraudSignals = useMemo(() => detectFraudSignals(bills), [bills]);
  const adminSummary = useMemo(() => buildAdminSummary(bills), [bills]);
  const insights = useMemo(() => getAiInsights(bills), [bills]);

  const handleBackup = () => {
    const blob = new Blob([exportBillsToJson(bills)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `billgreen-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded');
  };

  const handleRestore = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setRestoring(true);
    try {
      const text = await file.text();
      const parsed = parseBackupFile(text);
      await importBills(user.uid, parsed);
      const refreshed = await getAllBills();
      setBills(refreshed);
      toast.success(`${parsed.length} bill${parsed.length === 1 ? '' : 's'} restored from backup`);
    } catch (error) {
      console.error(error);
      toast.error('Backup restore failed');
    } finally {
      setRestoring(false);
      event.target.value = '';
    }
  };

  if (!loading && !isAdmin) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Card className="text-center py-16">
            <Shield className="w-12 h-12 text-ink-600 mx-auto mb-4" />
            <h1 className="text-white text-xl font-semibold">Admin Access Only</h1>
            <p className="text-ink-400 text-sm mt-2">Change your role to Admin in profile settings to view the cross-user dashboard.</p>
          </Card>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-ink-400 text-sm mt-1">Cross-user analytics, forecasting, fraud detection, and backup/restore.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleBackup} disabled={!bills.length}>
              <Download className="w-4 h-4" />
              Backup JSON
            </Button>
            <label className="inline-flex items-center gap-2 bg-leaf-600 hover:bg-leaf-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer">
              <Upload className="w-4 h-4" />
              {restoring ? 'Restoring...' : 'Restore Backup'}
              <input type="file" accept="application/json" className="hidden" onChange={handleRestore} disabled={restoring} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Stat title="All Bills" value={bills.length} helper="Across every user" />
          <Stat title="Revenue" value={formatCurrency(bills.reduce((sum, bill) => sum + Number(bill.price || 0), 0))} helper="Global total" />
          <Stat title="Users" value={adminSummary.length} helper="Active billing accounts" />
          <Stat title="Fraud Flags" value={fraudSignals.length} helper="Heuristic detections" accent="red" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-white font-semibold">Charts and Forecasting</h2>
                  <p className="text-ink-400 text-sm">Monthly revenue, bill counts, and next-month prediction</p>
                </div>
                <Badge variant="info">Forecast confidence: {forecast.confidence}</Badge>
              </div>
              <AnalyticsChart data={monthlySeries} bars={['revenue']} line={['count']} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <MiniStat title="Next Month Revenue" value={formatCurrency(forecast.nextMonthRevenue)} />
                <MiniStat title="Expected Bills" value={forecast.nextMonthBills} />
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-leaf-400" />
                <h2 className="text-white font-semibold">AI Spending Insights</h2>
              </div>
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div key={insight} className="rounded-xl border border-ink-700 bg-ink-900/40 p-4 text-sm text-ink-200">{insight}</div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-white font-semibold">Fraud / Duplicate Detection</h2>
              </div>
              {fraudSignals.length ? (
                <div className="space-y-3">
                  {fraudSignals.map((finding, index) => (
                    <div key={`${finding.type}-${index}`} className="rounded-xl border border-ink-700 bg-ink-900/40 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-white font-medium text-sm">{finding.title}</p>
                        <Badge variant={finding.severity === 'high' ? 'danger' : 'warning'}>{finding.severity}</Badge>
                      </div>
                      <p className="text-ink-400 text-sm mt-2">{finding.description}</p>
                      <div className="mt-3 space-y-1 text-xs text-ink-500 font-mono">
                        {finding.bills.map((bill) => <p key={bill.id || bill.billNumber}>{bill.billNumber} • {bill.customerName}</p>)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-ink-400 text-sm">No suspicious billing patterns detected from current heuristics.</p>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-blue-400" />
                <h2 className="text-white font-semibold">All Users Summary</h2>
              </div>
              <div className="space-y-3">
                {adminSummary.map((entry) => (
                  <div key={entry.userId} className="rounded-xl border border-ink-700 bg-ink-900/40 p-4">
                    <p className="text-white text-sm font-medium break-all">{entry.userId}</p>
                    <p className="text-ink-400 text-xs mt-1">{entry.bills} bills • {formatCurrency(entry.revenue)}</p>
                    <p className="text-ink-500 text-xs mt-1">Imported from paper: {entry.imported}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-4 h-4 text-amber-400" />
                <h2 className="text-white font-semibold">Backup & Restore</h2>
              </div>
              <p className="text-ink-400 text-sm">Download the full bill dataset as JSON and restore it later into your account for demos, migrations, or recovery.</p>
              <ul className="mt-4 space-y-2 text-xs text-ink-500">
                <li>Backup preserves customer details, language, and loyalty data.</li>
                <li>Restore imports bills into the current signed-in account.</li>
                <li>Imported items can be tracked from analytics.</li>
              </ul>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function Stat({ title, value, helper, accent = 'leaf' }) {
  const colors = {
    leaf: 'text-leaf-300',
    red: 'text-red-300',
  };
  return (
    <Card>
      <p className="text-ink-400 text-xs uppercase tracking-wide">{title}</p>
      <p className={`text-2xl font-mono font-semibold mt-2 ${colors[accent] || colors.leaf}`}>{value}</p>
      <p className="text-ink-500 text-xs mt-1">{helper}</p>
    </Card>
  );
}

function MiniStat({ title, value }) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900/40 p-4">
      <p className="text-ink-400 text-xs uppercase tracking-wide">{title}</p>
      <p className="text-white text-xl font-semibold font-mono mt-2">{value}</p>
    </div>
  );
}
