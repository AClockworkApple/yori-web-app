import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/restaurants');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', padding: '40px',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', textAlign: 'center', marginBottom: '40px',
      }}>
        <h1 style={{
          fontSize: '32px', fontWeight: '200', letterSpacing: '6px', margin: '0 0 8px',
        }}>YORI</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', letterSpacing: '2px', margin: 0 }}>
          STAFF PORTAL
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{
        width: '100%', maxWidth: '400px', padding: '40px',
        backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h2 style={{
          marginTop: 0, marginBottom: '28px', fontSize: '18px', fontWeight: '400',
          letterSpacing: '1px', textAlign: 'center',
        }}>Sign In</h2>

        {error && (
          <p style={{
            color: '#ff6b6b', fontSize: '14px', marginBottom: '20px',
            padding: '12px', backgroundColor: 'rgba(255,107,107,0.1)',
            borderRadius: '4px', textAlign: 'center',
          }}>{error}</p>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block', marginBottom: '6px', fontSize: '12px',
            color: 'rgba(255,255,255,0.45)', letterSpacing: '1px',
          }}>EMAIL</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'block', marginBottom: '6px', fontSize: '12px',
            color: 'rgba(255,255,255,0.45)', letterSpacing: '1px',
          }}>PASSWORD</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '14px', backgroundColor: '#fff', color: '#000',
          border: 'none', borderRadius: '4px', cursor: 'pointer',
          fontSize: '14px', fontWeight: '600', letterSpacing: '1px',
          transition: 'all 0.3s',
        }}>
          {loading ? 'Signing in...' : 'SIGN IN'}
        </button>
      </form>
    </div>
  );
}
