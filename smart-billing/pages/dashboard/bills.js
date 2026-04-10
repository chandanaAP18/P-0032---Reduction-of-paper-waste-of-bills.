import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FileText, FilePlus, Search, Download } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { getUserBills, updateBillStatus } from '../../lib/bills';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Select } from '../../components/ui';
import BillCard from '../../components/BillCard';
import { DELIVERY_OPTIONS, exportBillsToCsv, getEffectivePaymentStatus, RECURRING_OPTIONS } from '../../lib/billInsights';
import toast from 'react-hot-toast';

export default function BillsPage() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [recurringFilter, setRecurringFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await getUserBills(user.uid);
        setBills(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return bills.filter((bill) => {
      const searchable = [
        bill.customerName,
        bill.customerEmail,
        bill.customerPhone,
        bill.productName,
        bill.billNumber,
        bill.date,
        String(bill.price || ''),
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !term || searchable.includes(term);
      const matchesStatus = statusFilter === 'all' || getEffectivePaymentStatus(bill) === statusFilter;
      const matchesDelivery = deliveryFilter === 'all' || bill.deliveryPreference === deliveryFilter;
      const matchesRecurring = recurringFilter === 'all' || bill.recurringInterval === recurringFilter;

      return matchesSearch && matchesStatus && matchesDelivery && matchesRecurring;
    });
  }, [bills, search, statusFilter, deliveryFilter, recurringFilter]);

  const handleExport = () => {
    const csv = exportBillsToCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bills-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('CSV report downloaded');
  };

  const markAllOverdueAsPending = async () => {
    const overdueBills = bills.filter((bill) => getEffectivePaymentStatus(bill) === 'overdue');
    try {
      await Promise.all(overdueBills.map((bill) => updateBillStatus(bill.id, { paymentStatus: 'pending' })));
      setBills((current) => current.map((bill) => (
        getEffectivePaymentStatus(bill) === 'overdue' ? { ...bill, paymentStatus: 'pending' } : bill
      )));
      toast.success('Overdue bills moved back to pending');
    } catch (error) {
      console.error(error);
      toast.error('Could not update bills');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold">My Bills</h1>
            <p className="text-ink-400 text-sm mt-1">
              {filtered.length} visible bill{filtered.length !== 1 ? 's' : ''} • {bills.length} total in history
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExport} disabled={!filtered.length}>
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button variant="secondary" onClick={markAllOverdueAsPending} disabled={!bills.some((bill) => getEffectivePaymentStatus(bill) === 'overdue')}>
              Reset Overdue
            </Button>
            <Link href="/dashboard/create-bill">
              <Button variant="primary" size="md">
                <FilePlus className="w-4 h-4" />
                New Bill
              </Button>
            </Link>
          </div>
        </div>

        {bills.length > 0 && (
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                placeholder="Search by customer, date, amount, bill number, email, or phone"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-ink-800 border border-ink-600 text-white placeholder-ink-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select label="Payment Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">all</option>
                <option value="paid">paid</option>
                <option value="pending">pending</option>
                <option value="overdue">overdue</option>
              </Select>
              <Select label="Delivery Channel" value={deliveryFilter} onChange={(event) => setDeliveryFilter(event.target.value)}>
                <option value="all">all</option>
                {DELIVERY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
              <Select label="Recurring Cycle" value={recurringFilter} onChange={(event) => setRecurringFilter(event.target.value)}>
                <option value="all">all</option>
                {RECURRING_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-ink-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : bills.length === 0 ? (
          <Card className="text-center py-16">
            <FileText className="w-14 h-14 text-ink-600 mx-auto mb-4" />
            <h2 className="text-white font-semibold text-lg mb-2">No bills yet</h2>
            <p className="text-ink-400 text-sm mb-6 max-w-xs mx-auto">
              Create your first digital bill and start reducing paper waste.
            </p>
            <Link href="/dashboard/create-bill">
              <Button variant="primary" size="lg">
                <FilePlus className="w-4 h-4" />
                Create Your First Bill
              </Button>
            </Link>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-12">
            <Search className="w-10 h-10 text-ink-600 mx-auto mb-3" />
            <p className="text-ink-300 font-medium">No results found</p>
            <p className="text-ink-500 text-sm mt-1">
              Adjust your search or filters to find the bills you need.
            </p>
            <button onClick={() => {
              setSearch('');
              setStatusFilter('all');
              setDeliveryFilter('all');
              setRecurringFilter('all');
            }} className="mt-4 text-leaf-400 hover:text-leaf-300 text-sm">
              Clear all filters
            </button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

