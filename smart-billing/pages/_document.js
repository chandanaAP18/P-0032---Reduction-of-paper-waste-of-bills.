// pages/_document.js
// Custom document to add PWA meta tags and other head elements

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="BillGreen" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BillGreen" />
        <meta name="description" content="Smart Digital Billing System - Go paperless, save the planet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#102a43" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* Open Graph */}
        <meta property="og:title" content="BillGreen - Smart Digital Billing" />
        <meta property="og:description" content="Convert paper bills to digital receipts. Save trees, save the planet." />
        <meta property="og:type" content="website" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
