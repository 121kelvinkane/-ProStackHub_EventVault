'use client';
import { useEffect, useRef, useState } from 'react';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initScanner = async () => {
      try {
        // Dynamic import prevents Server-Side Rendering crashes
        const { Html5Qrcode } = await import('html5-qrcode');
        
        if (!mounted) return;

        scannerRef.current = new Html5Qrcode("qr-reader");
        
        await scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText);
            scannerRef.current?.stop();
            setIsScanning(false);
          },
          () => {
            // Ignore scan errors (happens on every frame when no QR is found)
          }
        );
        
        setIsScanning(true);
        setError(null);
      } catch (err: any) {
        console.error('Camera error:', err);
        setError('Camera access denied. Please allow camera permissions.');
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200 text-center">
          {error}
        </div>
      )}
      <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>
    </div>
  );
}