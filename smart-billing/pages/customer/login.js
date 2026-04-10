import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Leaf, Mail, Phone, ReceiptText } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input, Button } from '../../components/ui';
import { saveCustomerSession } from '../../lib/customerSession';

export default function CustomerLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email.trim() && !form.phone.trim()) {
      toast.error('Enter email or phone to continue');
      return;
    }

    setLoading(true);
    saveCustomerSession({
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
    });
    toast.success('Access details saved');
    router.push('/customer/portal');
  };

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-leaf-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-leaf-500 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-white text-xl font-semibold">BillGreen</span>
          </Link>
          <h1 className="text-white text-2xl font-bold">Customer Receipt Access</h1>
          <p className="text-ink-400 text-sm mt-2">Use the email or phone on your bill to view all your receipts.</p>
        </div>

        <div className="bg-ink-800 border border-ink-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" placeholder="customer@email.com" icon={Mail} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            <Input label="Phone" placeholder="9876543210" icon={Phone} value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
              <ReceiptText className="w-4 h-4" />
              View My Receipts
            </Button>
          </form>
        </div>

        <p className="text-center mt-4">
          <Link href="/" className="text-ink-500 hover:text-ink-300 text-xs">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
