'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the scanner so it only loads in the browser (fixes Vercel build)
const QRScanner = dynamic(() => import('@/components/QRScanner'), {
  ssr: false,
  loading: () => <p className="text-center text-gray-400">Loading camera...</p>
});

export default function ScannerPage() {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [scanning, setScanning] = useState(true);

  const handleScan = async (qrCode: string) => {
    setScanning(false);
    try {
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode }),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message });
    } catch {
      setResult({ success: false, message: 'Network error' });
    }
  };

  const resetScanner = () => {
    setResult(null);
    setScanning(true);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <h1 className="text-3xl font-bold mb-6">Ticket Scanner</h1>
      <div className="w-full max-w-md p-8 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl">
        {scanning ? (
          <QRScanner onScan={handleScan} />
        ) : (
          <div className="text-center">
            <div className={`mb-4 p-4 rounded-lg ${result?.success ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'}`}>
              <p className={`text-lg font-semibold ${result?.success ? 'text-green-200' : 'text-red-200'}`}>
                {result?.success ? '✅' : '❌'} {result?.message}
              </p>
            </div>
            <button
              onClick={resetScanner}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            >
              Scan Another Ticket
            </button>
          </div>
        )}
      </div>
    </main>
  );
}