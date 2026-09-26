'use client';
import { useState } from 'react';

export default function HomePage() {
  const [status, setStatus] = useState('idle');

  const handleSimulateScan = async () => {
    setStatus('scanning');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: 'SIMULATED-QR-CODE-123' })
      });
      const data = await res.json();
      setStatus(data.success ? 'success' : 'error');
      alert(data.success ? '✅ ' + data.message : '❌ ' + data.message);
    } catch (err) {
      setStatus('error');
      alert('Network error');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <h1 className="text-3xl font-bold mb-6">EventVault Scanner</h1>
      <div className="w-full max-w-md p-8 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl text-center">
        <div className="mb-6 p-4 bg-gray-900 rounded border border-gray-600">
          <p className="text-gray-400 text-sm mb-2">Camera Viewfinder</p>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-600 rounded">
            <span className="text-gray-500">[ Camera Placeholder ]</span>
          </div>
        </div>
        
        <button 
          onClick={handleSimulateScan}
          disabled={status === 'scanning'}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
        >
          {status === 'scanning' ? 'Scanning...' : 'Simulate Ticket Scan'}
        </button>
        
        {status === 'success' && <p className="mt-4 text-green-400 font-medium">✅ Ticket Validated!</p>}
        {status === 'error' && <p className="mt-4 text-red-400 font-medium">❌ Invalid Ticket</p>}
      </div>
    </main>
  );
}
