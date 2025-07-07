import { useState } from 'react';
import QRCode from 'react-qr-code';

function getLocalCustomers() {
  return JSON.parse(localStorage.getItem('customers') || '[]');
}

function setLocalCustomers(customers) {
  localStorage.setItem('customers', JSON.stringify(customers));
}

function QRGenerator() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [success, setSuccess] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (name && email) {
      setQrValue(email);
      // Save to localStorage
      const customers = getLocalCustomers();
      if (!customers.find(c => c.email === email)) {
        customers.push({ name, email, usedOffer: false });
        setLocalCustomers(customers);
        setSuccess(true);
      } else {
        setSuccess(false);
      }
    }
  };

  return (
    <div style={{ width: 400, margin: '40px auto', textAlign: 'center' }}>
      <h2>Generate Your Loyalty QR Code</h2>
      <form onSubmit={handleGenerate} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ margin: '0.5rem', padding: '0.5rem', width: '80%' }}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ margin: '0.5rem', padding: '0.5rem', width: '80%' }}
          required
        />
        <br />
        <button type="submit" style={{ padding: '0.5rem 2rem', background: '#d90429', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', marginTop: 10 }}>
          Generate QR
        </button>
      </form>
      {success && qrValue && (
        <div style={{ marginTop: 20 }}>
          <QRCode value={qrValue} size={200} />
          <div style={{ marginTop: 10 }}><b>{qrValue}</b></div>
          <div style={{ color: 'green', marginTop: 10 }}>Customer saved locally!</div>
        </div>
      )}
      {!success && qrValue && (
        <div style={{ color: 'red', marginTop: 10 }}>Customer already exists!</div>
      )}
    </div>
  );
}

export default QRGenerator; 