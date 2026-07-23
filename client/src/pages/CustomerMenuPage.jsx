import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = '/api/public';
const ASSETS_URL = '/assets/images';

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .menu-fade { animation: fadeUp 0.6s ease-out forwards; opacity: 0; }
  .menu-fade:nth-child(1) { animation-delay: 0.05s; }
  .menu-fade:nth-child(2) { animation-delay: 0.1s; }
  .menu-fade:nth-child(3) { animation-delay: 0.15s; }
  .menu-fade:nth-child(4) { animation-delay: 0.2s; }
  .menu-fade:nth-child(5) { animation-delay: 0.25s; }
  .menu-fade:nth-child(6) { animation-delay: 0.3s; }
  .menu-fade:nth-child(7) { animation-delay: 0.35s; }
  .menu-fade:nth-child(8) { animation-delay: 0.4s; }
  .menu-fade:nth-child(9) { animation-delay: 0.45s; }
  .menu-fade:nth-child(10) { animation-delay: 0.5s; }
  .menu-fade:nth-child(11) { animation-delay: 0.55s; }
  .menu-fade:nth-child(12) { animation-delay: 0.6s; }
  .menu-fade:nth-child(13) { animation-delay: 0.65s; }
  .menu-fade:nth-child(14) { animation-delay: 0.7s; }
  .menu-fade:nth-child(15) { animation-delay: 0.75s; }
  .menu-fade:nth-child(16) { animation-delay: 0.8s; }
  .menu-fade:nth-child(17) { animation-delay: 0.85s; }
  .menu-fade:nth-child(18) { animation-delay: 0.9s; }
  .menu-fade:nth-child(19) { animation-delay: 0.95s; }
  .menu-fade:nth-child(20) { animation-delay: 1s; }
`;
document.head.appendChild(style);

export default function CustomerMenuPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/restaurants`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRestaurants(data);
          if (data.length > 0) setSelectedId(data[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setMenuLoading(true);
    fetch(`${API_URL}/restaurants/${selectedId}/menu`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setMenuItems(data);
        setMenuLoading(false);
      })
      .catch(() => setMenuLoading(false));
  }, [selectedId]);

  const categories = Array.isArray(menuItems) ? [...new Set(menuItems.map(i => i.category))] : [];

  const currentRestaurant = Array.isArray(restaurants) ? restaurants.find(r => r.id === selectedId) : null;

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
          <Link to="/menu" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px', letterSpacing: '1px' }}>MENU</Link>
          <Link to="/booking" style={{
            color: '#fff', textDecoration: 'none', fontSize: '14px', letterSpacing: '1px',
            padding: '8px 20px', border: '1px solid #fff', borderRadius: '4px',
          }}>RESERVE</Link>
        </div>
      </nav>

      <div style={{ paddingTop: '100px', paddingLeft: '40px', paddingRight: '40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{
            fontSize: '12px', letterSpacing: '3px', color: 'rgba(255,255,255,0.4)',
            marginBottom: '12px', display: 'block'
          }}>
            OUR MENU
          </span>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '200',
            letterSpacing: '4px', margin: '0 0 32px'
          }}>
            CULINARY SELECTIONS
          </h1>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading restaurants...</p>
          ) : restaurants.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>No restaurants available.</p>
          ) : (
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              style={{
                padding: '12px 20px', fontSize: '14px', letterSpacing: '1px',
                backgroundColor: '#1a1a1a', color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px',
                cursor: 'pointer', minWidth: '220px',
              }}
            >
              {restaurants.map(r => (
                <option key={r.id} value={r.id} style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {currentRestaurant && (
          <div style={{
            textAlign: 'center', marginBottom: '48px', fontSize: '13px', color: 'rgba(255,255,255,0.4)'
          }}>
            {currentRestaurant.address && <span>{currentRestaurant.address} &middot; </span>}
            {currentRestaurant.phone && <span>{currentRestaurant.phone}</span>}
          </div>
        )}

        {menuLoading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading menu...</p>
        ) : menuItems.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No menu items available for this restaurant.</p>
        ) : (
          categories.map(category => (
            <div key={category} style={{ marginBottom: '48px' }}>
              <h2 style={{
                fontSize: '16px', fontWeight: '400', letterSpacing: '2px',
                margin: '0 0 20px', paddingBottom: '12px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.5)'
              }}>
                {category.toUpperCase()}
              </h2>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
                {menuItems.filter(i => i.category === category).map((item, idx) => (
                  <div key={item.id} className="menu-fade" style={{
                    display: 'flex', alignItems: 'stretch',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px', overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.3s',
                  }}>
                    <div style={{
                      width: '130px', minHeight: '130px', flexShrink: 0,
                      overflow: 'hidden', position: 'relative',
                    }}>
                      <img src={item.imageUrl || `${ASSETS_URL}/dish-placeholder.svg`}
                        alt={item.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = `${ASSETS_URL}/dish-placeholder.svg`; }}
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                        }} />
                    </div>
                    <div style={{
                      flex: 1, padding: '16px 20px',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    }}>
                      <div>
                        <div style={{
                          fontSize: '17px', fontWeight: '700', marginBottom: '6px',
                          color: '#8B0000', letterSpacing: '0.3px',
                        }}>
                          {item.name}
                          {item.itemNumber && (
                            <span style={{
                              fontSize: '11px', color: 'rgba(255,255,255,0.2)',
                              marginLeft: '8px', fontWeight: '400'
                            }}>
                              #{item.itemNumber}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <div style={{
                            fontSize: '13px', color: 'rgba(255,255,255,0.45)',
                            lineHeight: '1.5', marginBottom: '8px'
                          }}>
                            {item.description}
                          </div>
                        )}
                      </div>
                      <div style={{
                        fontSize: '19px', fontWeight: '600', color: '#fff',
                        marginTop: '8px',
                      }}>
                        €{item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Link to="/booking" style={{
            display: 'inline-block', padding: '16px 48px', backgroundColor: '#8B0000',
            color: '#000', textDecoration: 'none', borderRadius: '4px', fontWeight: '600',
            fontSize: '14px', letterSpacing: '1px',
          }}>
            BOOK A TABLE
          </Link>
        </div>
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
