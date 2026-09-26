'use client';
import { useState, useEffect } from 'react';

export default function ScannerPage() {
  const [scannerReady, setScannerReady] = useState(false);

  useEffect(() => {
    let scannerInstance: any = null;

    const initScanner = async () => {
      // DYNAMIC IMPORT: Only loads in the browser, preventing SSR build crashes!
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      
      scannerInstance = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      
      scannerInstance.render(
        async (decodedText: string) => {
          try {
            const res = await fetch('/api/tickets/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ qrCode: decodedText })
            });
            const data = await res.json();
            alert(data.success ? '✅ ' + data.message : '❌ ' + data.message);
          } catch (err) {
            alert('Network error');
          }
        },
        (errorMessage: string) => {}
      );
      setScannerReady(true);
    };

    initScanner();

    return () => {
      if (scannerInstance) {
        scannerInstance.clear().catch(console.error);
      }
    };
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <h1 className="text-3xl font-bold mb-6">Ticket Scanner</h1>
      {!scannerReady && <p>Initializing camera...</p>}
      <div id="reader" className="w-full max-w-md rounded-lg overflow-hidden shadow-2xl"></div>
    </main>
  );
}