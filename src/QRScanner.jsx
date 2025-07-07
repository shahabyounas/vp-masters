import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

// Example local entries (could be customer IDs, codes, etc.)
const localEntries = [
  'LOYALTY-123',
  'LOYALTY-456',
  'LOYALTY-789',
];

function getLocalCustomers() {
  // Retrieve customers from localStorage, or empty array if none
  return JSON.parse(localStorage.getItem('customers') || '[]');
}

function setLocalCustomers(customers) {
  localStorage.setItem('customers', JSON.stringify(customers));
}

function QRScanner() {
  const [result, setResult] = useState('');
  const [verified, setVerified] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    setCustomers(getLocalCustomers());
  }, [updated]);

  const handleDecode = (data) => {
    setResult(data);
    const idx = customers.findIndex(c => c.email === data);
    if (idx !== -1) {
      // Mark as used
      const updatedCustomers = [...customers];
      updatedCustomers[idx].usedOffer = true;
      setLocalCustomers(updatedCustomers);
      setCustomers(updatedCustomers);
      setVerified(true);
      setUpdated(u => !u); // force reload
    } else {
      setVerified(false);
    }
  };

  const handleError = (err) => {
    setResult('Error scanning QR code');
    setVerified(false);
  };

  return (
    <div style={{ width: 400, margin: '40px auto', textAlign: 'center' }}>
      <h2>Scan Loyalty QR Code</h2>
      <div style={{ margin: '20px auto', width: 300, height: 300 }}>
        <Scanner
            onScan={handleDecode}
        />
      </div>
      {result && (
        <div style={{ marginTop: 20 }}>
          <div>Scanned: <b>{JSON.stringify(result)}</b></div>
          {verified === true && <div style={{ color: 'green', fontWeight: 'bold' }}>QR Code Verified & Updated!</div>}
          {verified === false && <div style={{ color: 'red', fontWeight: 'bold' }}>QR Code Not Recognized</div>}
        </div>
      )}
    </div>
  );
}

export default QRScanner; 