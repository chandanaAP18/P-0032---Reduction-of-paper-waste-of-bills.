# 🌱 BillGreen — Smart Digital Billing System

A production-ready Next.js app that converts paper bills into digital receipts, helping businesses reduce paper waste and track their eco impact.

---

## 📁 Project Structure

```
smart-billing/
├── pages/
│   ├── _app.js                  # Root app with AuthProvider + Toast
│   ├── _document.js             # PWA meta tags, fonts
│   ├── index.js                 # Landing page
│   ├── login.js                 # Login page
│   ├── signup.js                # Signup page
│   ├── 404.js                   # Custom 404
│   ├── dashboard/
│   │   ├── index.js             # Dashboard home (stats + eco impact)
│   │   ├── create-bill.js       # Create new bill form
│   │   ├── bills.js             # All bills listing with search
│   │   └── profile.js           # User profile + logout
│   └── bills/
│       └── [id].js              # Public bill receipt with QR code
├── components/
│   ├── ProtectedRoute.js        # Auth guard HOC
│   ├── BillCard.js              # Reusable bill list card
│   ├── EcoImpact.js             # Eco savings widget
│   ├── layout/
│   │   ├── Navbar.js            # Public navigation bar
│   │   └── DashboardLayout.js   # Sidebar dashboard layout
│   └── ui/
│       └── index.js             # Button, Input, Card, Badge, StatCard
├── lib/
│   ├── firebase.js              # Firebase app initialization
│   ├── AuthContext.js           # Global auth state (signup/login/logout)
│   └── bills.js                 # Firestore CRUD helpers for bills
├── styles/
│   └── globals.css              # Tailwind + custom fonts + print styles
├── public/
│   └── manifest.json            # PWA manifest
├── firestore.rules              # Firestore security rules
├── next.config.js               # Next.js + PWA config
├── tailwind.config.js           # Tailwind with custom theme
├── vercel.json                  # Vercel deployment config
└── .env.local.example           # Environment variables template
```

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-username/smart-billing.git
cd smart-billing
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** → name it `smart-billing` → Create
3. **Enable Authentication:**
   - Go to Authentication → Get Started
   - Enable **Email/Password** provider
4. **Enable Firestore:**
   - Go to Firestore Database → Create database
   - Start in **production mode** (we'll set rules next)
5. **Get your config:**
   - Project Settings → Your apps → Add web app
   - Copy the `firebaseConfig` object values

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Firestore Security Rules

In Firebase Console → Firestore → Rules, paste the contents of `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bills/{billId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.price > 0;
      allow update, delete: if false;
    }
  }
}
```

Click **Publish**.

### 5. Create Firestore Index (if needed)

If you get an index error when fetching bills, Firebase will show you a link in the browser console to auto-create the required composite index (`userId` + `createdAt` desc).

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts, then add environment variables when asked.

### Option B: Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Add all `NEXT_PUBLIC_*` environment variables from `.env.local`
5. Set `NEXT_PUBLIC_APP_URL` to your Vercel domain (e.g., `https://smart-billing.vercel.app`)
6. Click **Deploy**

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `next` | React framework with file-based routing |
| `firebase` | Auth + Firestore database |
| `qrcode.react` | QR code generation for each bill |
| `date-fns` | Date formatting utilities |
| `react-hot-toast` | Toast notifications |
| `next-pwa` | Progressive Web App support |
| `lucide-react` | Icon library |
| `tailwindcss` | Utility-first CSS framework |

---

## ✨ Features

- 🔐 **Firebase Authentication** — Signup, Login, Logout
- 📄 **Digital Bill Generation** — Customer, product, price, date
- 📱 **QR Code per Bill** — Scan to open receipt on any device
- 🌿 **Eco Impact Tracker** — See how much paper you've saved
- 🔍 **Bill Search** — Filter by customer or product name
- 📊 **Dashboard Stats** — Total bills, revenue, paper saved
- 📱 **PWA Support** — Install on mobile like a native app
- 🖨️ **Print Receipt** — Browser print dialog for physical copy
- 🔗 **Shareable Links** — Share bill URL or copy to clipboard
- 🛡️ **Route Protection** — Dashboard requires login
- 📱 **Fully Responsive** — Works on all screen sizes

---

## 🏗️ Architecture Notes

- **Auth State** is managed globally via `AuthContext` using React Context API
- **Bills** are stored in Firestore under the `bills` collection, each with a `userId` field for ownership
- **QR Codes** point to `/bills/[id]` which is publicly accessible (no login required)
- **Protected Routes** use a `ProtectedRoute` HOC that checks auth state and redirects to `/login`
- **Environment Variables** prefixed with `NEXT_PUBLIC_` are exposed to the browser

---

## 🤝 Contributing

Pull requests welcome! Please open an issue first to discuss changes.

---

## 📄 License

MIT — free to use for personal and commercial projects.
