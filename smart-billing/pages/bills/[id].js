import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import {
  Leaf,
  FileText,
  User,
  Package,
  Calendar,
  IndianRupee,
  ArrowLeft,
  Share2,
  Printer,
  Hash,
  Mail,
  MessageCircle,
  CreditCard,
  CheckCircle2,
  Download,
  Star,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getBillById, updateBillStatus } from '../../lib/bills';
import { useAuth } from '../../lib/AuthContext';
import {
  buildMailtoLink,
  buildPaymentLink,
  buildWhatsAppLink,
  formatCurrency,
  formatCustomerAddress,
  getEffectivePaymentStatus,
  RECEIPT_TRANSLATIONS,
} from '../../lib/billInsights';
import { getUserSettings } from '../../lib/userSettings';
import { Button, Textarea } from '../../components/ui';

export default function BillReceipt() {
  const router = useRouter();
  const { id, autosend } = router.query;
  const { user } = useAuth();

  const [bill, setBill] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 0, text: '' });
  const [autoSent, setAutoSent] = useState(false);

  const billUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/bills/${id}`
    : `${process.env.NEXT_PUBLIC_APP_URL || ''}/bills/${id}`;

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await getBillById(id);
        if (!data) {
          setNotFound(true);
          return;
        }
        setBill(data);
        setFeedback({ rating: Number(data.feedbackRating || 0), text: data.feedbackText || '' });

        if (data.userId) {
          const userSettings = await getUserSettings({ uid: data.userId });
          setSettings(userSettings);
        }
      } catch (error) {
        console.error(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    if (!bill || autoSent || !autosend) return;

    const link = autosend === 'email'
      ? buildMailtoLink(billUrl, bill)
      : autosend === 'whatsapp'
      ? buildWhatsAppLink(billUrl, bill)
      : '';

    if (link) {
      window.location.href = link;
      setAutoSent(true);
      const nextQuery = { ...router.query };
      delete nextQuery.autosend;
      router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
    }
  }, [autosend, autoSent, bill, billUrl, router]);

  const paymentStatus = getEffectivePaymentStatus(bill);
  const paymentLink = useMemo(() => buildPaymentLink({ bill, upiId: settings?.upiId }), [bill, settings]);
  const receiptCopy = RECEIPT_TRANSLATIONS[bill?.receiptLanguage] || RECEIPT_TRANSLATIONS.English;
  const customerAddress = formatCustomerAddress(bill);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Digital Receipt', text: bill?.billNumber, url: billUrl });
        return;
      } catch {
        // fallback below
      }
    }

    await navigator.clipboard.writeText(billUrl);
    toast.success('Link copied to clipboard');
  };

  const handlePrint = () => window.print();
  const handleDownloadPdf = () => {
    toast.success('Use your browser print dialog to save this receipt as PDF');
    window.print();
  };

  const handleStatusUpdate = async (nextStatus) => {
    if (!bill || !user || user.uid !== bill.userId) return;
    setSaving(true);
    try {
      await updateBillStatus(bill.id, { paymentStatus: nextStatus });
      setBill((current) => ({ ...current, paymentStatus: nextStatus }));
      toast.success(`Bill marked as ${nextStatus}`);
    } catch (error) {
      console.error(error);
      toast.error('Could not update bill');
    } finally {
      setSaving(false);
    }
  };

  const handleFeedbackSave = async () => {
    if (!bill || !feedback.rating) {
      toast.error('Choose a rating before saving feedback');
      return;
    }

    setSaving(true);
    try {
      await updateBillStatus(bill.id, {
        feedbackRating: feedback.rating,
        feedbackText: feedback.text.trim(),
      });
      setBill((current) => ({
        ...current,
        feedbackRating: feedback.rating,
        feedbackText: feedback.text.trim(),
      }));
      toast.success('Feedback saved');
    } catch (error) {
      console.error(error);
      toast.error('Could not save feedback');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-leaf-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-ink-400 text-sm font-mono">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (notFound || !bill) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
        <div className="text-center">
          <FileText className="w-16 h-16 text-ink-600 mx-auto mb-4" />
          <h1 className="text-white text-xl font-semibold mb-2">Bill Not Found</h1>
          <p className="text-ink-400 text-sm mb-6">This bill does not exist or may have been removed.</p>
          <Link href={user ? '/dashboard/bills' : '/login'} className="inline-flex items-center gap-2 bg-leaf-600 hover:bg-leaf-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {user ? 'Back to Bills' : 'Go to Login'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Receipt {bill.billNumber} | BillGreen</title>
      </Head>

      <div className="min-h-screen bg-ink-900 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_340px] gap-6">
          <div>
            <div className="mb-6 flex items-center justify-between no-print">
              <Link href={user ? '/dashboard/bills' : '/customer/login'} className="flex items-center gap-2 text-ink-400 hover:text-white text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" />
                {user ? 'Back to Bills' : 'Customer Access'}
              </Link>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <ActionLink href={buildMailtoLink(billUrl, bill)} icon={Mail} label="Email" />
                <ActionLink href={buildWhatsAppLink(billUrl, bill)} icon={MessageCircle} label="WhatsApp" />
                <button onClick={handleShare} className="flex items-center gap-2 bg-ink-800 hover:bg-ink-700 border border-ink-600 text-ink-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button onClick={handleDownloadPdf} className="flex items-center gap-2 bg-ink-800 hover:bg-ink-700 border border-ink-600 text-ink-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors">
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 bg-ink-800 hover:bg-ink-700 border border-ink-600 text-ink-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors">
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>

            <div className="bg-ink-800 border border-ink-700 rounded-2xl overflow-hidden print-receipt">
              <div className="bg-gradient-to-br from-leaf-700 to-leaf-900 px-8 py-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Leaf className="w-6 h-6 text-leaf-200" />
                  <span className="font-display text-white text-xl font-semibold">{settings?.businessName || 'BillGreen'}</span>
                </div>
                <p className="text-leaf-200 text-sm">{receiptCopy.digitalReceipt}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                  <Hash className="w-3 h-3 text-leaf-200" />
                  <span className="text-leaf-100 text-xs font-mono">{bill.billNumber}</span>
                </div>
              </div>

              <div className="px-8 py-8">
                <div className="space-y-5 mb-8">
                  <ReceiptRow icon={User} label={receiptCopy.customerName} value={bill.customerName} />
                  <ReceiptRow icon={Mail} label={receiptCopy.customerEmail} value={bill.customerEmail || receiptCopy.notProvided} />
                  <ReceiptRow icon={MapPin} label={receiptCopy.customerAddress} value={customerAddress || receiptCopy.notProvided} />
                  <ReceiptRow icon={Package} label={receiptCopy.productService} value={bill.productName} />
                  <ReceiptRow icon={Calendar} label={receiptCopy.billDate} value={bill.date ? format(new Date(`${bill.date}T00:00:00`), 'MMMM d, yyyy') : '-'} />
                  <ReceiptRow icon={Calendar} label={receiptCopy.dueDate} value={bill.dueDate || receiptCopy.noDueDate} />
                </div>

                <div className="bg-ink-900/50 rounded-xl px-6 py-5 border border-ink-600 mb-8 space-y-3">
                  <AmountRow label={receiptCopy.subtotal} value={formatCurrency(bill.subtotal || bill.price)} />
                  <AmountRow label={`${receiptCopy.gst} (${Number(bill.gstRate || 0)}%)`} value={formatCurrency(bill.taxAmount || 0)} />
                  <AmountRow label={receiptCopy.totalAmount} value={formatCurrency(bill.price)} strong />
                </div>

                {bill.notes && (
                  <div className="mb-8 rounded-xl border border-ink-700 bg-ink-900/40 px-5 py-4">
                    <p className="text-ink-400 text-xs uppercase tracking-wide mb-2">{receiptCopy.notes}</p>
                    <p className="text-white text-sm leading-relaxed">{bill.notes}</p>
                  </div>
                )}

                <div className="text-center mb-6">
                  <p className="text-ink-400 text-xs mb-4 uppercase tracking-wide font-medium">{receiptCopy.scan}</p>
                  <div className="inline-block bg-white p-4 rounded-xl">
                    <QRCodeSVG value={billUrl} size={140} bgColor="#ffffff" fgColor="#102a43" level="M" includeMargin={false} />
                  </div>
                  <p className="text-ink-500 text-xs mt-3 font-mono break-all px-4">{billUrl}</p>
                </div>
              </div>

              <div className="border-t border-ink-700 px-8 py-5 flex items-center justify-between bg-ink-900/30">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-leaf-500" />
                  <span className="text-ink-400 text-xs">{bill.printRequested ? 'Print copy was requested for this bill' : receiptCopy.paperless}</span>
                </div>
                <span className="text-ink-500 text-xs font-mono">{bill.createdAt ? format(new Date(bill.createdAt), 'dd/MM/yyyy HH:mm') : ''}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 no-print">
            <InfoCard title="Payment Status">
              <div className="flex items-center justify-between gap-3">
                <span className="text-white capitalize font-medium">{paymentStatus}</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${paymentStatus === 'paid' ? 'bg-leaf-900/60 text-leaf-300' : paymentStatus === 'overdue' ? 'bg-red-900/40 text-red-300' : 'bg-amber-900/40 text-amber-300'}`}>
                  {paymentStatus}
                </span>
              </div>
              {user?.uid === bill.userId && (
                <div className="mt-4 flex gap-2">
                  <StatusButton active={paymentStatus === 'paid'} onClick={() => handleStatusUpdate('paid')} disabled={saving}>Mark Paid</StatusButton>
                  <StatusButton active={paymentStatus === 'pending'} onClick={() => handleStatusUpdate('pending')} disabled={saving}>Mark Pending</StatusButton>
                </div>
              )}
            </InfoCard>

            <InfoCard title="Customer Experience">
              <InfoLine label="Preferred channel" value={bill.deliveryPreference || 'email'} />
              <InfoLine label="Receipt language" value={bill.receiptLanguage || 'English'} />
              <InfoLine label="Reward points" value={String(bill.loyaltyPoints || 0)} />
              <InfoLine label="Print policy" value={bill.printRequested ? 'Print requested' : 'Digital first'} />
              <Link href="/customer/login" className="inline-flex mt-4 text-leaf-400 text-sm hover:text-leaf-300">Customer portal access</Link>
            </InfoCard>

            <InfoCard title="Quick Actions">
              {paymentLink ? (
                <a href={paymentLink} className="flex items-center justify-between rounded-xl border border-leaf-700/30 bg-leaf-900/20 px-4 py-3 text-sm text-leaf-100 hover:bg-leaf-900/30 transition-colors">
                  <span className="inline-flex items-center gap-2"><CreditCard className="w-4 h-4" /> Pay Online</span>
                  <CheckCircle2 className="w-4 h-4" />
                </a>
              ) : (
                <p className="text-ink-400 text-sm">Add a UPI ID in your profile or a custom payment link while creating bills to enable online payments.</p>
              )}
              <div className="mt-4 rounded-xl border border-ink-700 bg-ink-900/40 p-4">
                <p className="text-ink-400 text-xs uppercase tracking-wide mb-2">Environmental impact</p>
                <p className="text-white text-sm">Viewing this bill digitally avoids about 5g of paper and supports your paper-waste reduction goal.</p>
              </div>
            </InfoCard>

            <InfoCard title="Feedback & Rating">
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setFeedback((current) => ({ ...current, rating: star }))} className="text-left">
                    <Star className={`w-5 h-5 ${feedback.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-ink-500'}`} />
                  </button>
                ))}
              </div>
              <Textarea label="Feedback" placeholder="Share your experience with this purchase or service" value={feedback.text} onChange={(event) => setFeedback((current) => ({ ...current, text: event.target.value }))} />
              <Button className="mt-4" onClick={handleFeedbackSave} loading={saving}>
                Save Feedback
              </Button>
            </InfoCard>
          </div>
        </div>
      </div>
    </>
  );
}

function ActionLink({ href, icon: Icon, label }) {
  return (
    <a href={href} className="flex items-center gap-2 bg-ink-800 hover:bg-ink-700 border border-ink-600 text-ink-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors">
      <Icon className="w-4 h-4" />
      {label}
    </a>
  );
}

function ReceiptRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 pb-5 border-b border-ink-700/50 last:border-0 last:pb-0">
      <div className="w-8 h-8 bg-ink-700 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-ink-400" />
      </div>
      <div>
        <p className="text-ink-400 text-xs uppercase tracking-wide font-medium mb-0.5">{label}</p>
        <p className="text-white font-medium">{value}</p>
      </div>
    </div>
  );
}

function AmountRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-ink-300">
        <IndianRupee className="w-4 h-4 text-ink-400" />
        <span className={strong ? 'font-medium' : ''}>{label}</span>
      </div>
      <span className={strong ? 'text-leaf-300 text-2xl font-bold font-mono' : 'text-white font-mono'}>{value}</span>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-800 p-5">
      <h2 className="text-white font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-700 pb-2 mb-2 last:border-0 last:mb-0 last:pb-0">
      <span className="text-ink-400 text-sm">{label}</span>
      <span className="text-white text-sm capitalize text-right">{value}</span>
    </div>
  );
}

function StatusButton({ children, active, ...props }) {
  return (
    <button className={`rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'bg-leaf-600 text-white' : 'bg-ink-700 text-ink-200 hover:bg-ink-600'}`} {...props}>
      {children}
    </button>
  );
}
