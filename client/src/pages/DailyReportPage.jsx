import { useState, useEffect, useCallback } from 'react';
import { reportService } from '../services/reportService';
import { useRestaurants } from '../context/RestaurantContext';

function formatCurrency(amount) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
}

function Section({ title, children }) {
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '20px',
      backgroundColor: 'rgba(255,255,255,0.03)'
    }}>
      <h3 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid rgba(255,215,0,0.3)' }}>{title}</h3>
      {children}
    </div>
  );
}

function StatRow({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: '8px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: highlight ? '18px' : '14px',
      fontWeight: highlight ? 'bold' : 'normal'
    }}>
      <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      <span style={{ color: highlight ? '#ffd700' : 'rgba(255,255,255,0.8)' }}>{value}</span>
    </div>
  );
}

export default function DailyReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { restaurants, selectedRestaurantId, selectedRestaurant, setSelectedRestaurantId } = useRestaurants();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchReport = useCallback(async () => {
    if (!selectedRestaurantId || !selectedDate) return;
    setLoading(true);
    setError(null);
    try {
      const data = await reportService.getDaily(selectedRestaurantId, selectedDate);
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurantId, selectedDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (!selectedRestaurantId) {
    return (
      <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Daily Report</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>Select a restaurant to view reports.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {restaurants.map(r => (
            <button key={r.id} onClick={() => setSelectedRestaurantId(r.id)} style={{
              display: 'flex', alignItems: 'center', padding: '16px 20px',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'left',
              gap: '16px', transition: 'all 0.2s', width: '100%',
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}>
              <div style={{ fontSize: '16px', fontWeight: '600', minWidth: '180px', color: '#fff' }}>{r.name}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', flex: 1 }}>{r.address || '-'}</div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>&rarr;</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const paymentLabels = {
    Bar: 'Cash',
    Karte: 'Card',
    EC: 'EC Card',
    OTHER: 'Other',
  };

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Daily Report — {selectedRestaurant?.name}</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="date" value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '8px', fontSize: '14px' }} />
          <button onClick={fetchReport} disabled={loading} style={{
            padding: '8px 16px', backgroundColor: 'rgba(255,215,0,0.15)', color: '#ffd700',
            border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#ff6b6b', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px' }}>Error: {error}</p>}

      {loading && <p>Loading report...</p>}

      {report && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <Section title="Revenue">
            <StatRow label="Subtotal" value={formatCurrency(report.totalSubtotal)} />
            <StatRow label="Tax" value={formatCurrency(report.totalTax)} />
            <StatRow label="Service Fees" value={formatCurrency(report.totalServiceFees)} />
            <StatRow label="Tips" value={formatCurrency(report.totalTips)} />
            <StatRow label="Total Revenue" value={formatCurrency(report.totalRevenue)} highlight />
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '2px solid rgba(255,215,0,0.3)' }}>
              <StatRow label="Avg. Check / Person" value={formatCurrency(report.averageCheckPerPerson)} />
              <StatRow label="Avg. Check / Order" value={formatCurrency(report.averageCheckPerOrder)} />
            </div>
          </Section>

          <Section title="Orders & Covers">
            <StatRow label="Orders Closed" value={report.orderCount} />
            <StatRow label="Covers (guests)" value={report.covers} />
            <StatRow label="Total Bookings" value={report.bookingCount} />
            <StatRow label="Walk-ins" value={report.walkInCount} />
            <StatRow label="No Shows" value={report.noShowCount} highlight />
            <StatRow label="Cancellations" value={report.cancelledCount} />
          </Section>

          <Section title="Payment Breakdown">
            {Object.keys(report.paymentBreakdown).length === 0 ? (
              <p style={{ color: '#999' }}>No payments recorded.</p>
            ) : (
              Object.entries(report.paymentBreakdown).map(([method, data]) => (
                <div key={method} style={{
                  padding: '12px', marginBottom: '8px',
                  backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '6px'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                    {paymentLabels[method] || method}
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                    {data.count} payment{data.count !== 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffd700' }}>
                    {formatCurrency(data.total)}
                  </div>
                </div>
              ))
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
