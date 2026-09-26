'use client';
import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function HomePage() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        validateTicket(decodedText);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  const validateTicket = async (ticketId: string) => {
    setStatus('scanning');
    setMessage('Validating ticket...');

    try {
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(`✅ Access Granted: ${data.message}`);
      } else {
        setStatus('error');
        setMessage(`❌ Access Denied: ${data.message}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage('❌ Network error during validation.');
    }
  };

  const resetScanner = () => {
    setStatus('idle');
    setMessage('');
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl text-center min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">🎟️ EventVault Check-In Scanner</h1>
      
      {status === 'idle' && (
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200 w-full max-w-md">
          <p className="mb-4 text-gray-800 text-lg font-medium">Point your camera at the attendee's QR code</p>
          <div id="reader" className="w-full border-4 border-blue-600 rounded-lg overflow-hidden bg-gray-50"></div>
          <p className="mt-4 text-sm text-gray-500">Test QR: Generate one with text "TICKET-VALID-123"</p>
        </div>
      )}

      {status === 'scanning' && (
        <div className="py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-900">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-20 bg-green-100 border-4 border-green-600 rounded-xl w-full max-w-md">
          <p className="text-6xl mb-4">✅</p>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Access Granted!</h2>
          <p className="text-gray-900 mb-6 text-lg">{message}</p>
          <button onClick={resetScanner} className="bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800">
            Scan Next Ticket
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="py-20 bg-red-100 border-4 border-red-600 rounded-xl w-full max-w-md">
          <p className="text-6xl mb-4">❌</p>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-gray-900 mb-6 text-lg">{message}</p>
          <button onClick={resetScanner} className="bg-red-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-800">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
