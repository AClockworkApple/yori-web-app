import { useState, useEffect, useCallback } from 'react';
import { reconciliationService } from '../services/reconciliationService';
import { useRestaurants } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';

function formatCurrency(amount) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
}

export default function DailyReconciliationPage() {
  const { selectedRestaurantId, selectedRestaurant } = useRestaurants();
  const { hasRole } = useAuth();
  const canEdit = hasRole('OWNER', 'MANAGER');

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [declaredCash, setDeclaredCash] = useState('');
  const [declaredCard, setDeclaredCard] = useState('');
  const [declaredOther, setDeclaredOther] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [notes, setNotes] = useState('');

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedRestaurantId || !selectedDate) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await reconciliationService.get(selectedRestaurantId, selectedDate);
      setData(result);

      if (result.existing) {
        setDeclaredCash(String(result.existing.declaredCash));
        setDeclaredCard(String(result.existing.declaredCard));
        setDeclaredOther(String(result.existing.declaredOther));
        setOpeningBalance(String(result.existing.openingBalance || ''));
        setNotes(result.existing.notes || '');
      } else {
        setDeclaredCash('');
        setDeclaredCard('');
        setDeclaredOther('');
        setOpeningBalance('');
        setNotes('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurantId, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!selectedRestaurantId || !selectedDate) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const dc = parseFloat(declaredCash) || 0;
      const dcard = parseFloat(declaredCard) || 0;
      const dOther = parseFloat(declaredOther) || 0;
      const ob = parseFloat(openingBalance) || 0;

      if (data?.existing) {
        await reconciliationService.update(data.existing.id, {
          declaredCash: dc, declaredCard: dcard, declaredOther: dOther,
          openingBalance: ob, notes,
        });
        setSuccess('Reconciliation updated');
      } else {
        await reconciliationService.create({
          restaurantId: selectedRestaurantId,
          date: selectedDate,
          declaredCash: dc, declaredCard: dcard, declaredOther: dOther,
          openingBalance: ob, notes,
        });
        setSuccess('Reconciliation created');
      }
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReconcile = async () => {
    if (!data?.existing) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await reconciliationService.reconcile(data.existing.id);
      setSuccess('Day reconciled successfully');
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const loadHistory = async () => {
    if (!selectedRestaurantId) return;
    try {
      const records = await reconciliationService.getHistory(selectedRestaurantId);
      setHistory(records);
      setShowHistory(!showHistory);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!selectedRestaurantId) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Daily Cash Reconciliation</h1>
        <p>Select a restaurant from the navigation bar to begin.</p>
      </div>
    );
  }

  const statusBadge = (status) => {
    const colors = { PENDING: '#ffc107', RECONCILED: '#28a745', DISCREPANCY: '#dc3545' };
    return (
      <span style={{
        display: 'inline-block', padding: '2px 10px', borderRadius: '4px',
        fontSize: '12px', fontWeight: 'bold', color: '#fff',
        backgroundColor: colors[status] || '#6c757d',
      }}>{status}</span>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Daily Cash Reconciliation {selectedRestaurant?.name ? `— ${selectedRestaurant.name}` : ''}</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="date" value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '8px', fontSize: '14px' }} />
          <button onClick={fetchData} disabled={loading} style={{
            padding: '8px 16px', backgroundColor: '#007bff', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer',
          }}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button onClick={loadHistory} style={{
            padding: '8px 16px', backgroundColor: '#6c757d', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer',
          }}>
            {showHistory ? 'Hide History' : 'History'}
          </button>
        </div>
      </div>

      {error && <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>{success}</div>}

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
            <h3 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #007bff' }}>
              System Expected {data.existing && statusBadge(data.existing.status)}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span>Cash (Bar)</span><span style={{ fontWeight: 'bold' }}>{formatCurrency(data.expected.cash)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span>Card (Karte/EC)</span><span style={{ fontWeight: 'bold' }}>{formatCurrency(data.expected.card)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span>Other</span><span style={{ fontWeight: 'bold' }}>{formatCurrency(data.expected.other)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
              <span>Total Expected</span><span>{formatCurrency(data.expected.total)}</span>
            </div>
            <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '13px', color: '#666' }}>
              Closed orders: {data.orderCount}
            </div>
          </div>

          <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
            <h3 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #007bff' }}>
              Declared (Actual)
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#495057', marginBottom: '4px' }}>Opening Balance</label>
              <input type="number" step="0.01" min="0" value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                disabled={!canEdit || data?.existing?.status === 'RECONCILED'}
                style={{ width: '100%', padding: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#495057', marginBottom: '4px' }}>Cash (Bar)</label>
              <input type="number" step="0.01" min="0" value={declaredCash}
                onChange={(e) => setDeclaredCash(e.target.value)}
                disabled={!canEdit || data?.existing?.status === 'RECONCILED'}
                style={{ width: '100%', padding: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#495057', marginBottom: '4px' }}>Card (Karte/EC)</label>
              <input type="number" step="0.01" min="0" value={declaredCard}
                onChange={(e) => setDeclaredCard(e.target.value)}
                disabled={!canEdit || data?.existing?.status === 'RECONCILED'}
                style={{ width: '100%', padding: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#495057', marginBottom: '4px' }}>Other</label>
              <input type="number" step="0.01" min="0" value={declaredOther}
                onChange={(e) => setDeclaredOther(e.target.value)}
                disabled={!canEdit || data?.existing?.status === 'RECONCILED'}
                style={{ width: '100%', padding: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#495057', marginBottom: '4px' }}>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                disabled={!canEdit || data?.existing?.status === 'RECONCILED'}
                style={{ width: '100%', padding: '8px', fontSize: '14px', boxSizing: 'border-box', minHeight: '60px' }} />
            </div>
            {canEdit && data?.existing?.status !== 'RECONCILED' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSave} disabled={saving} style={{
                  flex: 1, padding: '10px', backgroundColor: '#007bff', color: 'white',
                  border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                }}>
                  {saving ? 'Saving...' : (data?.existing ? 'Update' : 'Create')}
                </button>
                {data?.existing && (
                  <button onClick={handleReconcile} disabled={saving} style={{
                    flex: 1, padding: '10px', backgroundColor: '#28a745', color: 'white',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                  }}>
                    {saving ? '...' : 'Reconcile Day'}
                  </button>
                )}
              </div>
            )}
          </div>

          {data?.existing && (
            <div style={{ gridColumn: '1 / -1', border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
              <h3 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #007bff' }}>
                Variance
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Cash Variance</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: (data.existing.cashVariance || 0) === 0 ? '#28a745' : '#dc3545' }}>
                    {formatCurrency(data.existing.cashVariance)}
                  </div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Card Variance</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: (data.existing.cardVariance || 0) === 0 ? '#28a745' : '#dc3545' }}>
                    {formatCurrency(data.existing.cardVariance)}
                  </div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Status</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    {statusBadge(data.existing.status)}
                  </div>
                </div>
              </div>
              {data.existing.reconciledBy && (
                <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
                  Reconciled by {data.existing.reconciledBy} on {new Date(data.existing.reconciledAt).toLocaleString('de-DE')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showHistory && (
        <div style={{ marginTop: '24px', border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Reconciliation History</h3>
          {history.length === 0 ? (
            <p style={{ color: '#999' }}>No records found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                    <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6' }}>Date</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6' }}>Expected</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6' }}>Declared</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6' }}>Cash Var.</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6' }}>Card Var.</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #dee2e6' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px' }}>{r.date}</td>
                      <td style={{ padding: '8px' }}>{formatCurrency(r.expectedTotal)}</td>
                      <td style={{ padding: '8px' }}>{formatCurrency(r.declaredTotal)}</td>
                      <td style={{ padding: '8px', color: (r.cashVariance || 0) === 0 ? '#28a745' : '#dc3545' }}>
                        {formatCurrency(r.cashVariance)}
                      </td>
                      <td style={{ padding: '8px', color: (r.cardVariance || 0) === 0 ? '#28a745' : '#dc3545' }}>
                        {formatCurrency(r.cardVariance)}
                      </td>
                      <td style={{ padding: '8px' }}>{statusBadge(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
