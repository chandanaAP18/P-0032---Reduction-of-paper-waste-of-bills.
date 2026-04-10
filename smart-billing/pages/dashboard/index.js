import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  FilePlus,
  FileText,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  Users,
  AlertTriangle,
  BellRing,
  Download,
  Brain,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { getUserBills } from '../../lib/bills';
import { getUserSettings } from '../../lib/userSettings';
import {
  formatCurrency,
  getBillAnalytics,
  getUpcomingReminders,
  getEffectivePaymentStatus,
  exportBillsToCsv,
} from '../../lib/billInsights';
import {
  detectFraudSignals,
  getAiInsights,
  getForecastData,
  getMonthlySeries,
} from '../../lib/advancedBilling';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard, Card, Badge, Button } from '../../components/ui';
import EcoImpact from '../../components/EcoImpact';
import BillCard from '../../components/BillCard';
import AnalyticsChart from '../../components/AnalyticsChart';

export default function Dashboard() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [billData, settingData] = await Promise.all([getUserBills(user.uid), getUserSettings(user)]);
        setBills(billData);
        setSettings(settingData);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const analytics = getBillAnalytics(bills);
  const reminders = getUpcomingReminders(bills);
  const recentBills = bills.slice(0, 4);
  const monthlySeries = useMemo(() => getMonthlySeries(bills, 6), [bills]);
  const forecast = useMemo(() => getForecastData(bills), [bills]);
  const fraudSignals = useMemo(() => detectFraudSignals(bills), [bills]);
  const aiInsights = useMemo(() => getAiInsights(bills), [bills]);

  const handleExport = () => {
    const csv = exportBillsToCsv(bills);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `billgreen-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold">Good {getGreeting()}, {user?.displayName?.split(' ')[0] || 'there'}!</h1>
            <p className="text-ink-400 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')} • {settings?.businessName || 'BillGreen Store'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExport} disabled={!bills.length}><Download className="w-4 h-4" />Export Report</Button>
            <Link href="/dashboard/create-bill"><Button variant="primary"><FilePlus className="w-4 h-4" />Create Bill</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Bills" value={loading ? '-' : analytics.totalBills} icon={FileText} color="leaf" description="Digital bills created" />
          <StatCard label="Revenue" value={loading ? '-' : formatCurrency(analytics.revenue)} icon={IndianRupee} color="amber" description="Across all bills" />
          <StatCard label="Customers" value={loading ? '-' : analytics.customerCount} icon={Users} color="blue" description="Unique customer records" />
          <StatCard label="Overdue" value={loading ? '-' : analytics.overdueCount} icon={AlertTriangle} color="red" description="Need follow-up" />
          <StatCard label="Paper Saved" value={loading ? '-' : `${analytics.eco.paperSavedGrams}g`} icon={TrendingUp} color="leaf" description="By keeping bills digital" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-white font-semibold">Charts and Forecasting</h2>
                  <p className="text-ink-400 text-sm">Revenue trend, bill volume, and simple next-month forecast</p>
                </div>
                <Badge variant="info">Confidence: {forecast.confidence}</Badge>
              </div>
              <AnalyticsChart data={monthlySeries} bars={['revenue']} line={['count']} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InsightCard label="Next Month Revenue" value={formatCurrency(forecast.nextMonthRevenue)} helper="Moving-average forecast" />
                <InsightCard label="Expected Bills" value={forecast.nextMonthBills} helper="Projected bill count" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-leaf-400" />
                <h2 className="text-white font-semibold">AI Spending Insights</h2>
              </div>
              <div className="space-y-3">
                {aiInsights.map((insight) => <div key={insight} className="rounded-xl border border-ink-700 bg-ink-900/40 p-4 text-sm text-ink-200">{insight}</div>)}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Recent Bills</h2>
                <Link href="/dashboard/bills" className="text-leaf-400 hover:text-leaf-300 text-sm flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
              {loading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-ink-700 rounded-xl animate-pulse" />)}</div>
              ) : recentBills.length ? (
                <div className="space-y-3">{recentBills.map((bill) => <BillCard key={bill.id} bill={bill} />)}</div>
              ) : <EmptyCreateState />}
            </Card>
          </div>

          <div className="space-y-6">
            <EcoImpact bills={bills} />

            <Card>
              <div className="flex items-center gap-2 mb-4"><Shield className="w-4 h-4 text-amber-400" /><h2 className="text-white font-semibold">Fraud Signals</h2></div>
              {fraudSignals.length ? (
                <div className="space-y-3">
                  {fraudSignals.slice(0, 3).map((finding, index) => (
                    <div key={`${finding.type}-${index}`} className="rounded-xl border border-ink-700 bg-ink-900/40 p-4">
                      <div className="flex items-center justify-between gap-2"><p className="text-white text-sm font-medium">{finding.title}</p><Badge variant={finding.severity === 'high' ? 'danger' : 'warning'}>{finding.severity}</Badge></div>
                      <p className="text-ink-400 text-xs mt-2">{finding.description}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-ink-400 text-sm">No suspicious billing patterns detected right now.</p>}
              <Link href="/dashboard/admin" className="inline-flex mt-4 text-leaf-400 text-sm hover:text-leaf-300">View admin analysis</Link>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4"><BellRing className="w-4 h-4 text-amber-400" /><h2 className="text-white font-semibold">Upcoming Reminders</h2></div>
              {reminders.length ? (
                <div className="space-y-3">
                  {reminders.map((bill) => (
                    <div key={bill.id} className="rounded-xl border border-ink-700 bg-ink-900/40 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div><p className="text-white text-sm font-medium">{bill.customerName}</p><p className="text-ink-400 text-xs">{bill.billNumber}</p></div>
                        <Badge variant={getEffectivePaymentStatus(bill) === 'overdue' ? 'danger' : 'warning'}>{getEffectivePaymentStatus(bill)}</Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs"><span className="text-ink-400">Due {bill.dueDate}</span><span className="text-leaf-300 font-mono">{formatCurrency(bill.price)}</span></div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-ink-400 text-sm">No pending reminders right now.</p>}
            </Card>

            <Card>
              <h2 className="text-white font-semibold mb-4">Default Workflow</h2>
              <div className="space-y-3 text-sm">
                <PreferenceRow label="Role" value={settings?.role || 'Admin'} />
                <PreferenceRow label="Digital Delivery" value={settings?.defaultDeliveryPreference || 'email'} />
                <PreferenceRow label="Language" value={settings?.preferredLanguage || 'English'} />
                <PreferenceRow label="Print Policy" value={settings?.defaultPrintRequested ? 'Print allowed' : 'Digital first'} />
              </div>
              <Link href="/dashboard/profile" className="inline-flex mt-4 text-leaf-400 text-sm hover:text-leaf-300">Manage settings</Link>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function InsightCard({ label, value, helper }) {
  return <div className="rounded-xl border border-ink-700 bg-ink-900/40 p-4"><p className="text-ink-400 text-xs uppercase tracking-wide">{label}</p><p className="text-white text-xl font-semibold font-mono mt-2">{value}</p><p className="text-ink-500 text-xs mt-1">{helper}</p></div>;
}

function PreferenceRow({ label, value }) {
  return <div className="flex items-center justify-between gap-4 border-b border-ink-700 pb-2 last:border-0 last:pb-0"><span className="text-ink-400">{label}</span><span className="text-white capitalize">{value}</span></div>;
}

function EmptyCreateState() {
  return <Card className="text-center py-12 bg-ink-900/40 border-dashed"><FileText className="w-12 h-12 text-ink-600 mx-auto mb-4" /><p className="text-ink-300 font-medium">No bills yet</p><p className="text-ink-500 text-sm mt-1 mb-6">Create your first digital bill to start reducing paper waste</p><Link href="/dashboard/create-bill" className="inline-flex items-center gap-2 bg-leaf-600 hover:bg-leaf-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"><FilePlus className="w-4 h-4" />Create Bill</Link></Card>;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
