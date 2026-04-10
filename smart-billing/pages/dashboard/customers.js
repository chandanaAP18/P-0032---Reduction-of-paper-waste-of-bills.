import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Mail, Phone, Users, Printer, Send, Wallet } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { getUserBills } from '../../lib/bills';
import { aggregateCustomers, formatCurrency } from '../../lib/billInsights';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Badge } from '../../components/ui';

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    getUserBills(user.uid)
      .then((bills) => setCustomers(aggregateCustomers(bills)))
      .catch((error) => console.error('Failed to load customers', error))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold">Customers</h1>
          <p className="text-ink-400 text-sm mt-1">
            Aggregated customer management from your existing bills and delivery preferences.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-ink-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <Card className="text-center py-16">
            <Users className="w-12 h-12 text-ink-600 mx-auto mb-4" />
            <h2 className="text-white font-semibold text-lg">No customer records yet</h2>
            <p className="text-ink-400 text-sm mt-2">
              Customer profiles will be built automatically as you create bills.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {customers.map((customer) => (
              <Card key={customer.id} className="bg-ink-800/90">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-white font-semibold text-lg">{customer.customerName}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="info">{customer.preferredChannel}</Badge>
                      <Badge variant={customer.printRequested ? 'warning' : 'success'}>
                        {customer.printRequested ? 'print on request' : 'digital first'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-leaf-300 font-mono font-semibold text-lg">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-ink-500 text-xs">{customer.totalBills} bill{customer.totalBills === 1 ? '' : 's'}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <InfoRow icon={Mail} label="Email" value={customer.customerEmail || 'Not provided'} />
                  <InfoRow icon={Phone} label="Phone" value={customer.customerPhone || 'Not provided'} />
                  <InfoRow icon={Send} label="Preferred delivery" value={customer.preferredChannel} />
                  <InfoRow icon={Printer} label="Print policy" value={customer.printRequested ? 'Print requested' : 'Digital preferred'} />
                  <InfoRow icon={Wallet} label="Last bill" value={format(new Date(customer.lastBillDate), 'MMM d, yyyy')} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-ink-700 pb-2 last:border-0 last:pb-0">
      <Icon className="w-4 h-4 text-ink-400 shrink-0" />
      <span className="text-ink-400 text-xs uppercase tracking-wide">{label}</span>
      <span className="text-white text-sm ml-auto text-right">{value}</span>
    </div>
  );
}

