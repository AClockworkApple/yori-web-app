import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = '/api/public';
const BOOKING_API = '/api/public/bookings';

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .form-fade { animation: fadeUp 0.5s ease-out forwards; }
`;
document.head.appendChild(style);

export default function CustomerBookingPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    restaurantId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    partySize: 2,
    scheduledStart: '',
  });

  useEffect(() => {
    fetch(`${API_URL}/restaurants`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRestaurants(data);
          if (data.length > 0) {
            setForm(prev => ({ ...prev, restaurantId: data[0].id }));
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const startDate = new Date(form.scheduledStart);
    const slotMinutes = 120;
    const endDate = new Date(startDate.getTime() + slotMinutes * 60000);

    try {
      const response = await fetch(BOOKING_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: form.restaurantId,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone || null,
          partySize: parseInt(form.partySize, 10),
          scheduledStart: startDate.toISOString(),
          scheduledEnd: endDate.toISOString(),
          source: 'pre-booking',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create booking');
        setSubmitting(false);
        return;
      }

      if (data.requiresConfirmation) {
        const confirmed = await fetch(BOOKING_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantId: form.restaurantId,
            customerName: form.customerName,
            customerEmail: form.customerEmail,
            customerPhone: form.customerPhone || null,
            partySize: parseInt(form.partySize, 10),
            scheduledStart: startDate.toISOString(),
            scheduledEnd: endDate.toISOString(),
            source: 'pre-booking',
            confirmedOverbook: true,
          }),
        });

        const confirmedData = await confirmed.json();
        if (!confirmed.ok) {
          setError(confirmedData.error || 'Booking failed');
          setSubmitting(false);
          return;
        }
      }

      setSuccess(true);
      setSubmitting(false);
    } catch (err) {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  const minDateTime = new Date().toISOString().slice(0, 16);

  if (success) {
    return (
      <div style={{
        backgroundColor: '#000', color: '#fff', minHeight: '100vh',
        fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column'
      }}>
        <nav style={{
          padding: '16px 40px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        }}>
          <Link to="/" style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', textDecoration: 'none', letterSpacing: '2px' }}>
            YORI
          </Link>
        </nav>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          alignItems: 'center', textAlign: 'center', padding: '40px'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', marginBottom: '24px'
          }}>
            ✓
          </div>
          <h1 style={{ fontWeight: '300', fontSize: '32px', margin: '0 0 12px', letterSpacing: '2px' }}>
            Booking Confirmed
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 32px', fontSize: '15px' }}>
            A confirmation email has been sent to {form.customerEmail}
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/" style={{
              padding: '12px 32px', backgroundColor: '#8B0000', color: '#000',
              textDecoration: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '14px'
            }}>
              BACK HOME
            </Link>
            <Link to="/menu" style={{
              padding: '12px 32px', border: '1px solid rgba(255,255,255,0.4)', color: '#fff',
              textDecoration: 'none', borderRadius: '4px', fontSize: '14px'
            }}>
              VIEW MENU
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#000', color: '#fff', minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 40px', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Link to="/" style={{
          fontSize: '22px', fontWeight: 'bold', color: '#fff', textDecoration: 'none', letterSpacing: '2px'
        }}>
          YORI
        </Link>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', letterSpacing: '1px' }}>HOME</Link>
          <Link to="/menu" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', letterSpacing: '1px' }}>MENU</Link>
          <Link to="/booking" style={{
            color: '#fff', textDecoration: 'none', fontSize: '14px', letterSpacing: '1px',
            padding: '8px 20px', border: '1px solid #fff', borderRadius: '4px',
          }}>RESERVE</Link>
        </div>
      </nav>

      <div style={{
        paddingTop: '120px', paddingLeft: '40px', paddingRight: '40px', paddingBottom: '60px',
        maxWidth: '600px', margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{
            fontSize: '12px', letterSpacing: '3px', color: 'rgba(255,255,255,0.4)',
            marginBottom: '12px', display: 'block'
          }}>
            RESERVATION
          </span>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '200',
            letterSpacing: '4px', margin: 0
          }}>
            BOOK A TABLE
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="form-fade" style={{
          backgroundColor: 'rgba(255,255,255,0.02)', padding: '40px',
          borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)'
        }}>
          {error && (
            <p style={{
              color: '#ff6b6b', fontSize: '14px', margin: '0 0 20px',
              padding: '12px', backgroundColor: 'rgba(255,107,107,0.1)',
              borderRadius: '4px'
            }}>
              {error}
            </p>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', letterSpacing: '1px' }}>
              RESTAURANT
            </label>
            <select name="restaurantId" value={form.restaurantId}
              onChange={handleChange} required
              style={{
                width: '100%', padding: '12px', fontSize: '14px', borderRadius: '4px',
                backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
              {loading ? (
                <option>Loading...</option>
              ) : Array.isArray(restaurants) && restaurants.length > 0 ? (
                restaurants.map(r => (
                  <option key={r.id} value={r.id} style={{ backgroundColor: '#222', color: '#fff' }}>{r.name}</option>
                ))
              ) : (
                <option value="" disabled>No restaurants available</option>
              )}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', letterSpacing: '1px' }}>
              NAME *
            </label>
            <input type="text" name="customerName" value={form.customerName}
              onChange={handleChange} required
              style={{
                width: '100%', padding: '12px', fontSize: '14px', borderRadius: '4px',
                backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', letterSpacing: '1px' }}>
                EMAIL *
              </label>
              <input type="email" name="customerEmail" value={form.customerEmail}
                onChange={handleChange} required
                style={{
                  width: '100%', padding: '12px', fontSize: '14px', borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', letterSpacing: '1px' }}>
                PHONE
              </label>
              <input type="tel" name="customerPhone" value={form.customerPhone}
                onChange={handleChange}
                style={{
                  width: '100%', padding: '12px', fontSize: '14px', borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', letterSpacing: '1px' }}>
                PARTY SIZE *
              </label>
              <input type="number" name="partySize" value={form.partySize}
                onChange={handleChange} min="1" required
                style={{
                  width: '100%', padding: '12px', fontSize: '14px', borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', letterSpacing: '1px' }}>
                DATE & TIME *
              </label>
              <input type="datetime-local" name="scheduledStart" value={form.scheduledStart}
                onChange={handleChange} min={minDateTime} required
                style={{
                  width: '100%', padding: '12px', fontSize: '14px', borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  colorScheme: 'dark',
                }} />
            </div>
          </div>

          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: '16px', fontSize: '14px', letterSpacing: '1px',
            backgroundColor: '#8B0000', color: '#000', border: 'none', borderRadius: '4px',
            fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}>
            {submitting ? 'SUBMITTING...' : 'CONFIRM RESERVATION'}
          </button>
        </form>
      </div>

      <footer style={{
        padding: '48px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
          <a href="https://www.facebook.com/profile.php?id=61551866423333" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="https://www.instagram.com/yori.deggendorf/" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: 0 }}>
          &copy; {new Date().getFullYear()} Yori Deggendorf. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
