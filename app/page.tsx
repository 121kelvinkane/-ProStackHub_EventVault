'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the scanner so it only loads in the browser
const QRScanner = dynamic(() => import('@/components/QRScanner'), {
  ssr: false,
  loading: () => <p className="text-center text-gray-400 animate-pulse">Loading camera...</p>
});

export default function HomePage() {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const handleScan = async (qrCode: string) => {
    setCameraActive(false);
    try {
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode }),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message });
      setScanning(false);
    } catch (error) {
      console.error('Scan error:', error);
      setResult({ success: false, message: 'Network error. Please try again.' });
      setScanning(false);
    }
  };

  const handleSimulateScan = async () => {
    setScanning(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: 'SIMULATED-QR-CODE-123' }),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message });
      setScanning(false);
    } catch {
      setResult({ success: false, message: 'Network error' });
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setCameraActive(false);
    setScanning(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <h1 className="text-3xl font-bold mb-2">EventVault</h1>
      <p className="text-gray-400 mb-6">Secure Ticket Validation</p>
      
      <div className="w-full max-w-md p-6 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl">
        {result ? (
          <div className="text-center py-8">
            <div className={`mb-6 p-4 rounded-lg border ${result.success ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
              <p className={`text-xl font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.success ? '✅ Valid Ticket' : '❌ Invalid Ticket'}
              </p>
              <p className="text-gray-300 mt-2">{result.message}</p>
            </div>
            <button
              onClick={resetScanner}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg font-semibold transition-colors"
            >
              Scan Another Ticket
            </button>
          </div>
        ) : cameraActive ? (
          <div>
            <p className="text-center text-sm text-gray-400 mb-4">Point your camera at a ticket QR code</p>
            <QRScanner onScan={handleScan} />
            <button
              onClick={() => setCameraActive(false)}
              className="w-full mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setCameraActive(true)}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg font-semibold transition-colors"
            >
              📷 Open Camera Scanner
            </button>
            <button
              onClick={handleSimulateScan}
              disabled={scanning}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
            >
              {scanning ? 'Scanning...' : '🎫 Simulate Ticket Scan'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}