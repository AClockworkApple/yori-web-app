import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { receiptService } from '../services/receiptService';

export default function ReceiptPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReceipt();
  }, [orderId]);

  const loadReceipt = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = await receiptService.getByOrder(orderId).catch(() => null);
      if (!data) {
        data = await receiptService.generate(orderId);
      } else {
        setSaved(true);
      }
      setReceipt(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const data = await receiptService.save(orderId);
      setReceipt(data);
      setSaved(true);
    } catch (err) {
      alert('Failed to save receipt: ' + err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const fmt = (n) => `€${(n || 0).toFixed(2).replace('.', ',')}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('de-DE') : '';
  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '';

  if (loading) return <div style={{ padding: '20px' }}>Lade Rechnung...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Fehler: {error}</div>;
  if (!receipt) return <div style={{ padding: '20px' }}>Keine Rechnungsdaten vorhanden.</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '420px', margin: '0 auto', fontFamily: "'Courier New', Courier, monospace", fontSize: '12px', lineHeight: '1.4' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 10mm; }
          body { font-size: 11px; }
        }
      `}</style>

      <div className="no-print" style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <button onClick={handlePrint} style={{ padding: '8px 16px', cursor: 'pointer' }}>Drucken</button>
        {!saved && <button onClick={handleSave} style={{ padding: '8px 16px', cursor: 'pointer' }}>Speichern</button>}
        <button onClick={() => navigate(-1)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Zurück</button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '16px' }}>{receipt.restaurant?.name || 'Restaurant'}</h2>
        <p style={{ margin: '0', fontSize: '11px' }}>{receipt.restaurant?.address}</p>
        {receipt.restaurant?.phone && <p style={{ margin: '2px 0 0', fontSize: '11px' }}>Tel: {receipt.restaurant.phone}</p>}
        {receipt.restaurant?.taxNumber && <p style={{ margin: '2px 0 0', fontSize: '11px' }}>StNr: {receipt.restaurant.taxNumber}</p>}
      </div>

      <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px dashed #000' }} />

      <div style={{ fontSize: '11px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Rechnung Nr:</span><span>{receipt.receiptNumber}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Datum:</span><span>{fmtDate(receipt.order?.createdAt)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Uhrzeit:</span><span>{fmtTime(receipt.order?.createdAt)}</span>
        </div>
        {receipt.order?.bookingId && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tisch:</span><span>{receipt.order.bookingId.slice(-4).toUpperCase()}</span>
          </div>
        )}
      </div>

      <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px dashed #000' }} />

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000' }}>
            <th style={{ textAlign: 'left', padding: '2px 4px', width: '30px' }}>Pos</th>
            <th style={{ textAlign: 'left', padding: '2px 4px' }}>Bezeichnung</th>
            <th style={{ textAlign: 'center', padding: '2px 4px', width: '30px' }}>Menge</th>
            <th style={{ textAlign: 'right', padding: '2px 4px', width: '65px' }}>Einzelpreis</th>
            <th style={{ textAlign: 'right', padding: '2px 4px', width: '70px' }}>Gesamtpreis</th>
          </tr>
        </thead>
        <tbody>
          {receipt.lineItems?.map((item) => (
            <tr key={item.pos}>
              <td style={{ padding: '2px 4px', verticalAlign: 'top' }}>{item.pos}</td>
              <td style={{ padding: '2px 4px', verticalAlign: 'top' }}>
                {item.name}
                {item.notes && <div style={{ fontSize: '10px', color: '#555' }}>{item.notes}</div>}
              </td>
              <td style={{ textAlign: 'center', padding: '2px 4px', verticalAlign: 'top' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', padding: '2px 4px', verticalAlign: 'top' }}>{fmt(item.unitPrice)}</td>
              <td style={{ textAlign: 'right', padding: '2px 4px', verticalAlign: 'top' }}>{fmt(item.totalNet)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px dashed #000' }} />

      <div style={{ fontSize: '11px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
          <span>Nettobetrag</span><span>{fmt(receipt.subtotalNet)}</span>
        </div>

        {receipt.vatBreakdown?.map(v => (
          <div key={v.rate} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', fontSize: '10px', color: '#555' }}>
            <span>davon {v.rate}% MwSt.</span><span>{fmt(v.vat)}</span>
          </div>
        ))}

        {receipt.serviceFeeNet > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
            <span>Bedienung ({receipt.restaurant?.serviceFeeRate || 0}%)</span><span>{fmt(receipt.serviceFeeNet)}</span>
          </div>
        )}

        {receipt.tip > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
            <span>Trinkgeld</span><span>{fmt(receipt.tip)}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontWeight: 'bold', borderTop: '2px solid #000', marginTop: '4px', fontSize: '13px' }}>
          <span>Gesamtbetrag</span><span>{fmt(receipt.grossTotal)}</span>
        </div>
      </div>

      {receipt.vatBreakdown?.length > 0 && (
        <div style={{ marginTop: '6px', fontSize: '10px', color: '#555' }}>
          <p style={{ margin: '0' }}>Enthaltene Umsatzsteuer:</p>
          {receipt.vatBreakdown.map(v => (
            <p key={v.rate} style={{ margin: '1px 0' }}>
              {v.rate}% MwSt. auf {fmt(v.net)} = {fmt(v.vat)}
            </p>
          ))}
        </div>
      )}

      <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px dashed #000' }} />

      <div style={{ fontSize: '11px' }}>
        <strong>Zahlungsart</strong>
        {receipt.payments?.length > 0 ? receipt.payments.map(p => (
          <div key={p.id} style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                {p.method === 'CASH' ? 'Bar' : p.method === 'CARD' ? 'Karte' : p.method === 'EC' ? 'EC-Karte' : p.method}
              </span>
              <span>{fmt(p.amount)}</span>
            </div>
            {p.amountReceived && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#555' }}>
                <span>Gegeben</span><span>{fmt(p.amountReceived)}</span>
              </div>
            )}
            {p.changeGiven && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#555' }}>
                <span>Wechselgeld</span><span>{fmt(p.changeGiven)}</span>
              </div>
            )}
          </div>
        )) : <p style={{ margin: '4px 0', fontSize: '10px', color: '#888' }}>Keine Zahlung erfasst</p>}
      </div>

      <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px dashed #000' }} />

      <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '8px' }}>
        <p style={{ margin: '2px 0' }}>Danke für Ihren Besuch!</p>
        <p style={{ margin: '2px 0', fontSize: '10px', color: '#555' }}>Auf Wiedersehen</p>
      </div>

      {saved && <p style={{ marginTop: '8px', fontSize: '10px', color: '#888', textAlign: 'center' }}>Rechnung gespeichert</p>}
    </div>
  );
}
