import Link from 'next/link';
import { format } from 'date-fns';
import { FileText, ArrowRight, Calendar, User, CreditCard, Repeat, Mail } from 'lucide-react';
import { Badge } from './ui';
import { formatCurrency, getEffectivePaymentStatus } from '../lib/billInsights';

const statusVariant = {
  paid: 'success',
  pending: 'warning',
  overdue: 'danger',
};

export default function BillCard({ bill }) {
  const formattedDate = bill.date
    ? format(new Date(`${bill.date}T00:00:00`), 'MMM d, yyyy')
    : bill.createdAt
    ? format(new Date(bill.createdAt), 'MMM d, yyyy')
    : 'No date';

  const paymentStatus = getEffectivePaymentStatus(bill);

  return (
    <Link href={`/bills/${bill.id}`}>
      <div className="bg-ink-800 border border-ink-700 rounded-xl p-5 hover:border-leaf-600/50 hover:bg-ink-750 transition-all group cursor-pointer">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-10 h-10 bg-leaf-600/20 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-leaf-600/30 transition-colors">
              <FileText className="w-5 h-5 text-leaf-400" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-white font-medium text-sm group-hover:text-leaf-300 transition-colors">
                  {bill.productName}
                </h3>
                <Badge variant={statusVariant[paymentStatus]}>{paymentStatus}</Badge>
                {bill.recurringInterval !== 'none' && <Badge variant="info">{bill.recurringInterval}</Badge>}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-ink-400">
                <span className="inline-flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {bill.customerName}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formattedDate}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {bill.deliveryPreference || 'email'}
                </span>
                {bill.dueDate && (
                  <span className="inline-flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Due {bill.dueDate}
                  </span>
                )}
              </div>

              <p className="text-ink-500 text-xs mt-2 font-mono break-all">
                {bill.billNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
            <div className="text-right">
              <p className="text-leaf-400 font-mono font-semibold text-sm">
                {formatCurrency(bill.price || 0)}
              </p>
              <div className="text-ink-500 text-xs flex items-center justify-end gap-1 mt-1">
                {bill.printRequested ? 'Print by request' : 'Digital first'}
                {bill.recurringInterval !== 'none' && <Repeat className="w-3 h-3" />}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-500 group-hover:text-leaf-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}

