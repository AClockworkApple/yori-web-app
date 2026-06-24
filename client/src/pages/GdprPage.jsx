import { useState } from 'react';
import { gdprService } from '../services/gdprService';

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString();
}

export default function GdprPage() {
  const [email, setEmail] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eraseResult, setEraseResult] = useState(null);
  const [confirmErase, setConfirmErase] = useState('');

  const handleLookup = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    setLookupResult(null);
    setEraseResult(null);
    try {
      const data = await gdprService.lookup(email);
      setLookupResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleErase = async () => {
    if (!email || confirmErase !== email) return;
    setLoading(true);
    setError(null);
    try {
      const data = await gdprService.erase(email);
      setEraseResult(data);
      setLookupResult(null);
      setConfirmErase('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const data = await gdprService.exportData(email);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gdpr-export-${email}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>GDPR Compliance</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Look up, export, or erase personal data for a customer by email address.
      </p>

      {error && <p style={{ color: 'red', background: '#fff', padding: '8px', borderRadius: '4px' }}>Error: {error}</p>}
      {eraseResult && (
        <p style={{ color: '#28a745', background: '#fff', padding: '8px', borderRadius: '4px' }}>
          {eraseResult.message}
        </p>
      )}

      <div style={{
        border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px',
        backgroundColor: '#fff', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Customer Email</label>
            <input type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              style={{ width: '100%', padding: '8px', fontSize: '14px' }} />
          </div>
          <button onClick={handleLookup} disabled={loading || !email} style={{
            padding: '8px 20px', backgroundColor: '#007bff', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
            {loading ? '...' : 'Look Up'}
          </button>
          <button onClick={handleExport} disabled={loading || !email} style={{
            padding: '8px 20px', backgroundColor: '#17a2b8', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
            Export JSON
          </button>
        </div>
      </div>

      {lookupResult && (
        <>
          <div style={{
            border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px',
            backgroundColor: '#fff', marginBottom: '24px'
          }}>
            <h2 style={{ margin: '0 0 12px 0' }}>
              {lookupResult.found
                ? `Found ${lookupResult.data.length} booking(s) for ${lookupResult.email}`
                : `No data found for ${lookupResult.email}`}
            </h2>

            {lookupResult.data.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {lookupResult.data.map(booking => (
                  <div key={booking.id} style={{
                    border: '1px solid #e9ecef', borderRadius: '6px', padding: '16px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                      <div><strong>Name:</strong> {booking.customerName}</div>
                      <div><strong>Email:</strong> {booking.customerEmail}</div>
                      <div><strong>Phone:</strong> {booking.customerPhone || '-'}</div>
                      <div><strong>Party:</strong> {booking.partySize}</div>
                      <div><strong>Date:</strong> {formatDate(booking.scheduledStart)}</div>
                      <div><strong>Status:</strong> {booking.status}</div>
                      <div><strong>Source:</strong> {booking.source}</div>
                      <div><strong>Created:</strong> {formatDate(booking.createdAt)}</div>
                    </div>
                    {booking.orders && booking.orders.length > 0 && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #dee2e6' }}>
                        <strong style={{ fontSize: '13px' }}>Orders ({booking.orders.length}):</strong>
                        {booking.orders.map(order => (
                          <div key={order.id} style={{
                            fontSize: '13px', color: '#495057', marginTop: '4px',
                            padding: '8px', backgroundColor: '#fff', borderRadius: '4px'
                          }}>
                            <div>Order: {order.id.substring(0, 8)}... &middot; {order.status} &middot; €{order.total?.toFixed(2)}</div>
                            {order.payments && order.payments.length > 0 && (
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                Payments: {order.payments.map(p => `${p.method} €${p.amount?.toFixed(2)}`).join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {lookupResult.found && (
            <div style={{
              border: '2px solid #dc3545', borderRadius: '8px', padding: '20px',
              backgroundColor: '#fff'
            }}>
              <h2 style={{ margin: '0 0 8px 0', color: '#dc3545' }}>Right to Erasure</h2>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                Type the email address again to confirm permanent anonymization of all data for this customer.
                This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="email" value={confirmErase}
                  onChange={(e) => setConfirmErase(e.target.value)}
                  placeholder="Type email to confirm"
                  style={{ flex: 1, padding: '8px', fontSize: '14px' }} />
                <button onClick={handleErase} disabled={loading || confirmErase !== email} style={{
                  padding: '10px 24px', backgroundColor: '#dc3545', color: 'white',
                  border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                }}>
                  {loading ? '...' : 'Erase Data'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
