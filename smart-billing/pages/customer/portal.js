import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { LogOut, Mail, Phone, ReceiptText, Gift, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button } from '../../components/ui';
import BillCard from '../../components/BillCard';
import { clearCustomerSession, getCustomerSession } from '../../lib/customerSession';
import { getCustomerBillsByAccess } from '../../lib/bills';
import { aggregateCustomers, formatCurrency } from '../../lib/billInsights';

export default function CustomerPortal() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activeSession = getCustomerSession();
    if (!activeSession?.email && !activeSession?.phone) {
      router.replace('/customer/login');
      return;
    }

    setSession(activeSession);
    getCustomerBillsByAccess(activeSession.email, activeSession.phone)
      .then((results) => setBills(results))
      .catch((error) => {
        console.error(error);
        toast.error('Could not load your receipts');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const customerSummary = useMemo(() => aggregateCustomers(bills)[0] || null, [bills]);
  const ratedBills = bills.filter((bill) => bill.feedbackRating);
  const averageRating = ratedBills.length
    ? ratedBills.reduce((sum, bill) => sum + bill.feedbackRating, 0) / ratedBills.length
    : 0;

  const handleLogout = () => {
    clearCustomerSession();
    toast.success('Signed out from receipt portal');
    router.push('/customer/login');
  };

  return (
    <div className="min-h-screen bg-ink-900 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-white text-3xl font-bold">My Receipts</h1>
            <p className="text-ink-400 text-sm mt-1">Access your digital bills, download PDF-ready receipts, and track reward points.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/customer/login">
              <Button variant="outline">Switch customer</Button>
            </Link>
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {session && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-leaf-400" />
                <div>
                  <p className="text-ink-400 text-xs uppercase tracking-wide">Email</p>
                  <p className="text-white text-sm">{session.email || 'Not used for access'}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-leaf-400" />
                <div>
                  <p className="text-ink-400 text-xs uppercase tracking-wide">Phone</p>
                  <p className="text-white text-sm">{session.phone || 'Not used for access'}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <ReceiptText className="w-4 h-4 text-leaf-400" />
                <div>
                  <p className="text-ink-400 text-xs uppercase tracking-wide">Receipts</p>
                  <p className="text-white text-sm">{bills.length} available</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-ink-800 rounded-xl animate-pulse" />)}
          </div>
        ) : bills.length === 0 ? (
          <Card className="text-center py-16">
            <ReceiptText className="w-14 h-14 text-ink-600 mx-auto mb-4" />
            <h2 className="text-white font-semibold text-lg mb-2">No receipts found</h2>
            <p className="text-ink-400 text-sm max-w-md mx-auto">We could not find bills for that email or phone number. Try the exact contact details used by the business when creating your bill.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {customerSummary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <p className="text-ink-400 text-xs uppercase tracking-wide">Total Spent</p>
                  <p className="text-white text-2xl font-mono mt-2">{formatCurrency(customerSummary.totalSpent)}</p>
                </Card>
                <Card>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-ink-400 text-xs uppercase tracking-wide">Reward Points</p>
                      <p className="text-white text-2xl font-mono mt-2">{customerSummary.loyaltyPoints}</p>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-leaf-400" />
                    <div>
                      <p className="text-ink-400 text-xs uppercase tracking-wide">Average Feedback</p>
                      <p className="text-white text-2xl font-mono mt-2">{averageRating ? averageRating.toFixed(1) : '-'}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {customerSummary && (
              <Card>
                <p className="text-ink-400 text-xs uppercase tracking-wide">Saved Address</p>
                <p className="text-white text-sm mt-2">
                  {[
                    customerSummary.customerAddressLine1,
                    customerSummary.customerAddressLine2,
                    [customerSummary.customerCity, customerSummary.customerState].filter(Boolean).join(', '),
                    customerSummary.customerPostalCode,
                    customerSummary.customerCountry,
                  ].filter(Boolean).join(', ') || 'No address saved yet'}
                </p>
                <p className="text-ink-500 text-xs mt-3">Last bill: {format(new Date(customerSummary.lastBillDate), 'MMMM d, yyyy')}</p>
              </Card>
            )}

            <div className="space-y-3">
              {bills.map((bill) => (
                <BillCard key={bill.id} bill={bill} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
