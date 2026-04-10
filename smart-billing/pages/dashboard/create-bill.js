import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { format, addDays } from 'date-fns';
import {
  User,
  Package,
  IndianRupee,
  Calendar,
  FilePlus,
  CheckCircle2,
  Mail,
  Phone,
  Percent,
  CreditCard,
  MapPin,
  Gift,
  Mic,
  ScanLine,
  Upload,
  WifiOff,
  RefreshCcw,
  Camera,
  CameraOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import { createBill, getUserBills } from '../../lib/bills';
import { getUserSettings } from '../../lib/userSettings';
import {
  aggregateCustomers,
  calculateBillTotals,
  calculateLoyaltyPoints,
  DELIVERY_OPTIONS,
  LANGUAGE_OPTIONS,
  RECURRING_OPTIONS,
} from '../../lib/billInsights';
import {
  createOfflineQueueItem,
  getBarcodeSuggestion,
  parseBillText,
} from '../../lib/advancedBilling';
import {
  clearBillDraft,
  clearOfflineQueue,
  enqueueOfflineBill,
  getOfflineQueue,
  loadBillDraft,
  saveBillDraft,
} from '../../lib/offlineBilling';
import { parseVoiceBillingTranscript, recognizeBillImage } from '../../lib/smartCapture';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Input, Button, Card, Select, Textarea, Toggle, Badge } from '../../components/ui';

const emptyAddress = {
  customerAddressLine1: '',
  customerAddressLine2: '',
  customerCity: '',
  customerState: '',
  customerPostalCode: '',
  customerCountry: 'India',
};

const initialForm = (today, defaultDueDate) => ({
  customerKey: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  ...emptyAddress,
  productName: '',
  quantity: '1',
  unitPrice: '',
  gstRate: '18',
  date: today,
  dueDate: defaultDueDate,
  paymentStatus: 'pending',
  deliveryPreference: 'email',
  recurringInterval: 'none',
  printRequested: false,
  notes: '',
  paymentLink: '',
  receiptLanguage: 'English',
  barcode: '',
  importedFromPaper: false,
});

export default function CreateBill() {
  const { user } = useAuth();
  const router = useRouter();
  const today = format(new Date(), 'yyyy-MM-dd');
  const defaultDueDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
  const draftLoaded = useRef(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);

  const [form, setForm] = useState(initialForm(today, defaultDueDate));
  const [settings, setSettings] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [ocrPreview, setOcrPreview] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [listening, setListening] = useState(false);
  const [online, setOnline] = useState(true);
  const [queuedCount, setQueuedCount] = useState(0);
  const [cameraScanning, setCameraScanning] = useState(false);
  const [barcodeSupported, setBarcodeSupported] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([getUserSettings(user), getUserBills(user.uid)])
      .then(([settingData, bills]) => {
        setSettings(settingData);
        setCustomers(aggregateCustomers(bills));
        setForm((current) => ({
          ...current,
          deliveryPreference: current.deliveryPreference || settingData.defaultDeliveryPreference || 'email',
          printRequested: current.printRequested || Boolean(settingData.defaultPrintRequested),
          receiptLanguage: current.receiptLanguage || settingData.preferredLanguage || 'English',
        }));
      })
      .catch((error) => console.error('Failed to load bill defaults:', error));
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setOnline(window.navigator.onLine);
    setQueuedCount(getOfflineQueue().length);
    setBarcodeSupported('BarcodeDetector' in window && Boolean(window.navigator.mediaDevices?.getUserMedia));

    const draft = loadBillDraft();
    if (draft && !draftLoaded.current) {
      draftLoaded.current = true;
      setForm((current) => ({ ...current, ...draft }));
    }

    const goOnline = async () => {
      setOnline(true);
      const queue = getOfflineQueue();
      if (!queue.length || !user) return;

      try {
        for (const item of queue) {
          await createBill(user.uid, item);
        }
        clearOfflineQueue();
        setQueuedCount(0);
        toast.success(`${queue.length} offline bill${queue.length === 1 ? '' : 's'} synced`);
      } catch (error) {
        console.error('Offline sync failed:', error);
        toast.error('Could not sync offline bills yet');
      }
    };

    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [user]);

  useEffect(() => {
    if (!draftLoaded.current) return;
    saveBillDraft(form);
  }, [form]);

  useEffect(() => {
    return () => stopCameraScan();
  }, []);

  const totals = useMemo(
    () => calculateBillTotals({ price: form.unitPrice, quantity: form.quantity, gstRate: form.gstRate }),
    [form.unitPrice, form.quantity, form.gstRate]
  );

  const loyaltyPoints = useMemo(() => calculateLoyaltyPoints(totals.total), [totals.total]);

  const updateField = (field) => (event) => {
    const value = event?.target?.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const applyCustomerProfile = (customerId) => {
    const customer = customers.find((entry) => entry.id === customerId);
    if (!customer) return;
    setForm((current) => ({
      ...current,
      customerKey: customer.id,
      customerName: customer.customerName || current.customerName,
      customerEmail: customer.customerEmail || current.customerEmail,
      customerPhone: customer.customerPhone || current.customerPhone,
      customerAddressLine1: customer.customerAddressLine1 || '',
      customerAddressLine2: customer.customerAddressLine2 || '',
      customerCity: customer.customerCity || '',
      customerState: customer.customerState || '',
      customerPostalCode: customer.customerPostalCode || '',
      customerCountry: customer.customerCountry || 'India',
      deliveryPreference: customer.preferredChannel || current.deliveryPreference,
      receiptLanguage: customer.preferredLanguage || current.receiptLanguage,
      printRequested: Boolean(customer.printRequested),
    }));
  };

  const applyParsedBill = (parsed) => {
    if (!parsed) {
      toast.error('Could not detect bill details from the text');
      return;
    }
    setForm((current) => ({
      ...current,
      customerName: parsed.customerName || current.customerName,
      productName: parsed.productName || current.productName,
      unitPrice: parsed.unitPrice || current.unitPrice,
      date: parsed.date || current.date,
      importedFromPaper: true,
    }));
    toast.success('Paper bill details imported into the form');
  };

  const handleOcrImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setOcrPreview(file.name);
    setOcrLoading(true);
    setOcrProgress(0);

    try {
      const text = await recognizeBillImage(file, setOcrProgress);
      setOcrText(text);
      applyParsedBill(parseBillText(text));
      toast.success('OCR completed from image');
    } catch (error) {
      console.error('OCR failed:', error);
      toast.error('Could not extract text from image');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleVoiceFill = () => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice recognition is not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      toast.error('Could not capture voice input');
    };
    recognition.onresult = (result) => {
      const transcript = result.results?.[0]?.[0]?.transcript || '';
      const parsed = parseVoiceBillingTranscript(transcript);
      if (parsed) {
        setForm((current) => ({ ...current, ...parsed }));
        toast.success('Voice bill draft captured');
      } else {
        setForm((current) => ({ ...current, notes: `${current.notes}\nVoice input: ${transcript}`.trim() }));
        toast('Voice captured. I added it to notes because the sentence did not match the billing pattern.');
      }
    };

    recognition.start();
  };

  const stopCameraScan = () => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraScanning(false);
  };

  const startCameraScan = async () => {
    if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
      toast.error('Live barcode scanning is not supported in this browser');
      return;
    }

    try {
      const formats = await window.BarcodeDetector.getSupportedFormats();
      const preferredFormats = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'];
      const detector = new window.BarcodeDetector({ formats: preferredFormats.filter((formatName) => formats.includes(formatName)) });
      const stream = await window.navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
      streamRef.current = stream;
      setCameraScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      scanTimerRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        try {
          const detections = await detector.detect(videoRef.current);
          const code = detections?.[0]?.rawValue;
          if (code) {
            setForm((current) => ({ ...current, barcode: code }));
            toast.success(`Barcode detected: ${code}`);
            stopCameraScan();
            const suggestion = getBarcodeSuggestion(code);
            if (suggestion) {
              setForm((current) => ({
                ...current,
                barcode: code,
                productName: suggestion.productName,
                unitPrice: String(suggestion.unitPrice),
                gstRate: String(suggestion.gstRate),
              }));
            }
          }
        } catch {
          // Keep scanning quietly until something is detected.
        }
      }, 600);
    } catch (error) {
      console.error('Camera scan failed:', error);
      stopCameraScan();
      toast.error('Could not start the camera scanner');
    }
  };

  const handleBarcodeLookup = () => {
    const suggestion = getBarcodeSuggestion(form.barcode.trim());
    if (!suggestion) {
      toast.error('Barcode not found in local catalog');
      return;
    }
    setForm((current) => ({
      ...current,
      productName: suggestion.productName,
      unitPrice: String(suggestion.unitPrice),
      gstRate: String(suggestion.gstRate),
    }));
    toast.success('Barcode matched with catalog item');
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.customerName.trim()) nextErrors.customerName = 'Customer name is required';
    if (!form.productName.trim()) nextErrors.productName = 'Product or service is required';
    if (!form.unitPrice || Number(form.unitPrice) <= 0) nextErrors.unitPrice = 'Enter a valid amount';
    if (!form.quantity || Number(form.quantity) <= 0) nextErrors.quantity = 'Quantity should be at least 1';
    if (form.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) nextErrors.customerEmail = 'Enter a valid email address';
    if (!form.date) nextErrors.date = 'Bill date is required';
    if (form.dueDate && form.dueDate < form.date) nextErrors.dueDate = 'Due date cannot be before bill date';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const payload = {
    customerName: form.customerName.trim(),
    customerEmail: form.customerEmail.trim().toLowerCase(),
    customerPhone: form.customerPhone.trim(),
    customerAddressLine1: form.customerAddressLine1.trim(),
    customerAddressLine2: form.customerAddressLine2.trim(),
    customerCity: form.customerCity.trim(),
    customerState: form.customerState.trim(),
    customerPostalCode: form.customerPostalCode.trim(),
    customerCountry: form.customerCountry.trim() || 'India',
    productName: form.productName.trim(),
    quantity: Number(form.quantity),
    subtotal: totals.subtotal,
    gstRate: Number(form.gstRate || 0),
    taxAmount: totals.taxAmount,
    price: totals.total,
    date: form.date,
    dueDate: form.dueDate,
    paymentStatus: form.paymentStatus,
    deliveryPreference: form.deliveryPreference,
    recurringInterval: form.recurringInterval,
    printRequested: form.printRequested,
    notes: form.notes.trim(),
    paymentLink: form.paymentLink.trim(),
    reminderStatus: form.paymentStatus === 'paid' ? 'not-needed' : 'scheduled',
    receiptLanguage: form.receiptLanguage,
    loyaltyPoints,
    barcode: form.barcode.trim(),
    importedFromPaper: form.importedFromPaper,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    if (typeof window !== 'undefined' && !window.navigator.onLine) {
      enqueueOfflineBill(createOfflineQueueItem(form));
      setQueuedCount(getOfflineQueue().length);
      clearBillDraft();
      setForm(initialForm(today, defaultDueDate));
      draftLoaded.current = true;
      toast.success('You are offline. Bill saved locally and will sync when internet returns.');
      return;
    }

    setLoading(true);
    try {
      const billId = await createBill(user.uid, payload);
      clearBillDraft();
      toast.success('Bill created successfully');
      const autosend =
        form.deliveryPreference === 'email' && form.customerEmail
          ? 'email'
          : form.deliveryPreference === 'whatsapp' && form.customerPhone
          ? 'whatsapp'
          : null;
      router.push(autosend ? `/bills/${billId}?autosend=${autosend}` : `/bills/${billId}`);
    } catch (error) {
      console.error('Create bill error:', error);
      toast.error('Failed to create bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Create New Bill</h1>
            <p className="text-ink-400 text-sm mt-1">
              Smart billing with real OCR, live camera barcode scan, voice capture, and offline sync.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={online ? 'success' : 'warning'}>{online ? 'Online' : 'Offline mode'}</Badge>
            {queuedCount > 0 && <Badge variant="info">{queuedCount} queued</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card className="bg-ink-800/90">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-white font-semibold">Smart Input Tools</h2>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={handleVoiceFill} className="text-xs" disabled={listening}>
                    <Mic className="w-4 h-4" />
                    {listening ? 'Listening...' : 'Voice Fill'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => applyParsedBill(parseBillText(ocrText))} className="text-xs" disabled={!ocrText.trim()}>
                    <ScanLine className="w-4 h-4" />
                    Import OCR Text
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-ink-200 block mb-2">Paper Bill Image</label>
                  <label className="flex items-center justify-center border border-dashed border-ink-600 rounded-lg px-4 py-6 text-sm text-ink-300 hover:border-leaf-500 cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {ocrPreview || 'Select image of old paper bill'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleOcrImage} />
                  </label>
                  {ocrLoading && (
                    <p className="text-xs text-ink-400 mt-2">OCR in progress: {ocrProgress}%</p>
                  )}
                </div>
                <div>
                  <Input label="Barcode" placeholder="Scan or enter barcode" value={form.barcode} onChange={updateField('barcode')} />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button type="button" variant="secondary" size="sm" onClick={handleBarcodeLookup}>
                      <RefreshCcw className="w-4 h-4" />
                      Lookup Barcode
                    </Button>
                    {barcodeSupported && !cameraScanning && (
                      <Button type="button" variant="outline" size="sm" onClick={startCameraScan}>
                        <Camera className="w-4 h-4" />
                        Scan with Camera
                      </Button>
                    )}
                    {cameraScanning && (
                      <Button type="button" variant="outline" size="sm" onClick={stopCameraScan}>
                        <CameraOff className="w-4 h-4" />
                        Stop Scan
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {cameraScanning && (
                <div className="mt-4 rounded-xl border border-ink-700 bg-black overflow-hidden">
                  <video ref={videoRef} className="w-full h-56 object-cover" muted playsInline />
                </div>
              )}

              <Textarea label="OCR Extracted Text" placeholder="OCR text from the uploaded bill appears here. You can still edit it before importing." value={ocrText} onChange={(event) => setOcrText(event.target.value)} className="mt-4" />
            </Card>

            <Card>
              <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-leaf-400" />
                Bill Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {customers.length > 0 && (
                  <Select label="Choose Existing Customer" value={form.customerKey} onChange={(event) => applyCustomerProfile(event.target.value)}>
                    <option value="">Create for a new customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.customerName} {customer.customerEmail ? `• ${customer.customerEmail}` : ''}
                      </option>
                    ))}
                  </Select>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Customer Name *" placeholder="e.g. Ramesh Kumar" icon={User} value={form.customerName} onChange={updateField('customerName')} error={errors.customerName} />
                  <Input label="Customer Email" type="email" placeholder="e.g. customer@email.com" icon={Mail} value={form.customerEmail} onChange={updateField('customerEmail')} error={errors.customerEmail} />
                  <Input label="Customer Phone" placeholder="e.g. 9876543210" icon={Phone} value={form.customerPhone} onChange={updateField('customerPhone')} />
                  <Select label="Delivery Preference" value={form.deliveryPreference} onChange={updateField('deliveryPreference')}>
                    {DELIVERY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Address Line 1" placeholder="Street / building" icon={MapPin} value={form.customerAddressLine1} onChange={updateField('customerAddressLine1')} />
                  <Input label="Address Line 2" placeholder="Area / landmark" value={form.customerAddressLine2} onChange={updateField('customerAddressLine2')} />
                  <Input label="City" value={form.customerCity} onChange={updateField('customerCity')} />
                  <Input label="State" value={form.customerState} onChange={updateField('customerState')} />
                  <Input label="Postal Code" value={form.customerPostalCode} onChange={updateField('customerPostalCode')} />
                  <Input label="Country" value={form.customerCountry} onChange={updateField('customerCountry')} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Product / Service *" placeholder="e.g. Web Development" icon={Package} value={form.productName} onChange={updateField('productName')} error={errors.productName} />
                  <Select label="Recurring Billing" value={form.recurringInterval} onChange={updateField('recurringInterval')}>
                    {RECURRING_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </Select>
                  <Input label="Quantity *" type="number" min="1" step="1" value={form.quantity} onChange={updateField('quantity')} error={errors.quantity} />
                  <Input label="Unit Price (INR) *" type="number" min="0" step="0.01" icon={IndianRupee} value={form.unitPrice} onChange={updateField('unitPrice')} error={errors.unitPrice} />
                  <Input label="GST / Tax Rate (%)" type="number" min="0" step="0.01" icon={Percent} value={form.gstRate} onChange={updateField('gstRate')} />
                  <Select label="Payment Status" value={form.paymentStatus} onChange={updateField('paymentStatus')}>
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                    <option value="overdue">overdue</option>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Bill Date *" type="date" icon={Calendar} value={form.date} onChange={updateField('date')} error={errors.date} />
                  <Input label="Due Date" type="date" icon={CreditCard} value={form.dueDate} onChange={updateField('dueDate')} error={errors.dueDate} />
                  <Select label="Receipt Language" value={form.receiptLanguage} onChange={updateField('receiptLanguage')}>
                    {LANGUAGE_OPTIONS.map((language) => <option key={language} value={language}>{language}</option>)}
                  </Select>
                  <Input label="Online Payment Link" placeholder={settings?.upiId ? 'Leave blank to use your saved UPI ID on the receipt' : 'Optional custom payment URL'} value={form.paymentLink} onChange={updateField('paymentLink')} />
                </div>

                <Textarea label="Notes" placeholder="Optional note for the customer, reminder context, or terms" value={form.notes} onChange={updateField('notes')} />
                <Toggle label="Print only if requested" description="Keep bills digital by default and mark print only when a customer explicitly asks for a paper copy." checked={form.printRequested} onChange={(checked) => setForm((current) => ({ ...current, printRequested: checked }))} />

                <div className="flex gap-3 pt-2">
                  <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1">Generate Bill</Button>
                  <Button type="button" variant="secondary" size="lg" onClick={() => { clearBillDraft(); setForm(initialForm(today, defaultDueDate)); draftLoaded.current = true; setOcrText(''); setOcrPreview(''); }}>Reset Draft</Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-leaf-900/30 border-leaf-700/40">
              <h3 className="text-leaf-300 font-semibold text-sm mb-4">Advanced Billing Tools</h3>
              <div className="space-y-3">
                {[
                  'Real OCR extraction from uploaded bill images with Tesseract',
                  'Voice-based draft creation using browser speech recognition',
                  'Live camera barcode scanning with BarcodeDetector',
                  'Offline draft save and queue-based sync',
                  'Imported paper-bill tracking for analytics',
                ].map((tip) => (
                  <div key={tip} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-leaf-400 mt-0.5 shrink-0" />
                    <p className="text-ink-300 text-xs leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-ink-300 font-semibold text-xs uppercase tracking-wide mb-4">Live Summary</h3>
              <div className="space-y-3 text-sm">
                <SummaryRow label="Business" value={settings?.businessName || 'BillGreen Store'} />
                <SummaryRow label="Delivery" value={form.deliveryPreference} />
                <SummaryRow label="Language" value={form.receiptLanguage} />
                <SummaryRow label="Subtotal" value={`INR ${totals.subtotal.toFixed(2)}`} />
                <SummaryRow label="Tax" value={`INR ${totals.taxAmount.toFixed(2)}`} />
                <SummaryRow label="Total" value={`INR ${totals.total.toFixed(2)}`} highlight />
                <SummaryRow label="Reward Points" value={String(loyaltyPoints)} icon={Gift} />
                <SummaryRow label="Paper Import" value={form.importedFromPaper ? 'Yes' : 'No'} />
                <SummaryRow label="Barcode" value={form.barcode || 'None'} />
              </div>
            </Card>

            {!online && (
              <Card className="border-amber-700/40 bg-amber-900/10">
                <div className="flex items-start gap-3">
                  <WifiOff className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Offline mode active</p>
                    <p className="text-ink-300 text-xs mt-1">New bills will be saved in your local sync queue and uploaded automatically when the internet comes back.</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function SummaryRow({ label, value, highlight = false, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-700/60 pb-2 last:border-0 last:pb-0">
      <span className="text-ink-400 inline-flex items-center gap-2">{Icon ? <Icon className="w-3.5 h-3.5" /> : null}{label}</span>
      <span className={highlight ? 'text-leaf-400 font-semibold font-mono' : 'text-white'}>{value}</span>
    </div>
  );
}
