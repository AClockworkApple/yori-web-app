import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .animate-fade-up { animation: fadeUp 0.8s ease-out forwards; }
  .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
  .animate-scale-in { animation: scaleIn 0.6s ease-out forwards; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .shimmer-text {
    background: linear-gradient(90deg, #fff 25%, #ffd700 50%, #fff 75%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
  }
  .scroll-hidden { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
  .scroll-visible { opacity: 1; transform: translateY(0); }
`;
document.head.appendChild(style);

function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setVisible(true), delay);
        observer.unobserve(el);
      }
    }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`scroll-hidden ${visible ? 'scroll-visible' : ''}`}>
      {children}
    </div>
  );
}

const API_URL = '/api/public';
const ASSETS_URL = '/assets/images';

export default function CustomerHomePage() {
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/restaurants`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setRestaurant(data[0]);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 40px', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Link to="/" style={{
          fontSize: '22px', fontWeight: 'bold', color: '#fff', textDecoration: 'none',
          letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <img src={restaurant?.logoUrl || `${ASSETS_URL}/logo-placeholder.svg`}
            alt={restaurant?.name || 'YORI'}
            onError={(e) => { e.target.onerror = null; e.target.src = `${ASSETS_URL}/logo-placeholder.svg`; }}
            style={{ height: '36px', maxWidth: '160px', objectFit: 'contain' }} />
        </Link>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px', letterSpacing: '1px' }}>HOME</Link>
          <Link to="/menu" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', letterSpacing: '1px' }}>MENU</Link>
          <Link to="/booking" style={{
            color: '#fff', textDecoration: 'none', fontSize: '14px', letterSpacing: '1px',
            padding: '8px 20px', border: '1px solid #fff', borderRadius: '4px', transition: 'all 0.3s'
          }}>RESERVE</Link>
          <a href="/login" style={{
            color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '12px', letterSpacing: '1px',
            marginLeft: '8px'
          }}>STAFF</a>
        </div>
      </nav>

      <section style={{
        height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {restaurant?.heroVideoUrl ? (
          <video autoPlay muted loop playsInline style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', filter: 'blur(4px)', transform: 'scale(1.05)',
          }}>
            <source src={restaurant.heroVideoUrl} type="video/mp4" />
          </video>
        ) : (
          <img src={restaurant?.heroImageUrl || `${ASSETS_URL}/hero-placeholder.svg`}
            alt="" aria-hidden="true"
            onError={(e) => { e.target.onerror = null; e.target.src = `${ASSETS_URL}/hero-placeholder.svg`; }}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', filter: 'blur(4px)', transform: 'scale(1.05)',
            }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.55)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }} />
        <div className="animate-float" style={{
          position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)',
          top: '20%', right: '15%',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="animate-fade-in" style={{ marginBottom: '24px' }}>
            <span style={{
              fontSize: '14px', letterSpacing: '4px', color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.15)', padding: '6px 16px', borderRadius: '20px'
            }}>
              WILLKOMMEN
            </span>
          </div>
          <h1 className="animate-fade-up" style={{
            fontSize: 'clamp(48px, 10vw, 120px)', fontWeight: '200', margin: '0 0 16px',
            letterSpacing: '8px'
          }}>
            YORI
          </h1>
          <p className="animate-fade-up" style={{
            fontSize: 'clamp(16px, 2vw, 24px)', color: 'rgba(255,255,255,0.6)',
            margin: '0 0 40px', letterSpacing: '2px', fontWeight: '300'
          }}>
            DEGGENDORF &mdash; MODERN ASIAN CUISINE
          </p>
          <div className="animate-fade-up" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/menu" style={{
              padding: '14px 40px', backgroundColor: '#fff', color: '#000',
              textDecoration: 'none', borderRadius: '4px', fontWeight: '600',
              fontSize: '14px', letterSpacing: '1px', transition: 'all 0.3s',
            }}>
              VIEW MENU
            </Link>
            <Link to="/booking" style={{
              padding: '14px 40px', border: '1px solid rgba(255,255,255,0.4)', color: '#fff',
              textDecoration: 'none', borderRadius: '4px', fontWeight: '400',
              fontSize: '14px', letterSpacing: '1px', transition: 'all 0.3s',
            }}>
              BOOK A TABLE
            </Link>
          </div>
        </div>
        <div style={{
          position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.5
        }}>
          <span style={{ fontSize: '11px', letterSpacing: '2px' }}>SCROLL</span>
          <div style={{
            width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.3)',
          }} />
        </div>
      </section>

      <section style={{
        padding: '120px 40px', maxWidth: '1100px', margin: '0 auto',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <ScrollReveal>
            <div>
              <span style={{
                fontSize: '12px', letterSpacing: '3px', color: 'rgba(255,255,255,0.4)',
                marginBottom: '16px', display: 'block'
              }}>
                OUR STORY
              </span>
              <h2 style={{
                fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '300', margin: '0 0 24px',
                lineHeight: '1.2'
              }}>
                Where Tradition Meets<br />Modern Elegance
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', fontSize: '15px', margin: 0
              }}>
                At Yori Deggendorf, we bring together the finest Asian culinary traditions with a contemporary
                twist. Our chefs source the freshest ingredients to create dishes that delight both the eyes
                and the palate. Whether you are joining us for a intimate dinner or a celebration with friends,
                every visit is a journey through flavor.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div style={{
              aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)',
              position: 'relative',
            }}>
              <img src={restaurant?.storyImageUrl || `${ASSETS_URL}/story-placeholder.svg`}
                alt=""
                onError={(e) => { e.target.onerror = null; e.target.src = `${ASSETS_URL}/story-placeholder.svg`; }}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                }} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section style={{
        padding: '100px 40px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <span style={{
                fontSize: '12px', letterSpacing: '3px', color: 'rgba(255,255,255,0.4)',
                marginBottom: '12px', display: 'block'
              }}>
                THE EXPERIENCE
              </span>
              <h2 style={{
                fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: '300', margin: 0
              }}>
                Why Dine With Us
              </h2>
            </div>
          </ScrollReveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { title: 'Exquisite Cuisine', desc: 'Crafted by master chefs using the finest seasonal ingredients from local and Asian markets.' },
              { title: 'Elegant Ambiance', desc: 'A modern dining space designed for comfort, with warm lighting and a refined atmosphere.' },
              { title: 'Impeccable Service', desc: 'Our attentive staff ensures every detail is taken care of, from arrival to farewell.' },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 150}>
                <div style={{
                  padding: '40px 32px', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px', textAlign: 'center', height: '100%',
                  transition: 'all 0.4s', cursor: 'default',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.15)', margin: '0 auto 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {['✦', '◆', '●'][i]}
                  </div>
                  <h3 style={{ fontWeight: '400', fontSize: '18px', margin: '0 0 12px', letterSpacing: '1px' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        padding: '100px 40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center'
      }}>
        <ScrollReveal>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: '300', margin: '0 0 16px'
          }}>
            Ready to Join Us?
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: '1.7', margin: '0 0 40px'
          }}>
            Reserve your table and experience the finest modern Asian cuisine in Deggendorf.
          </p>
          <Link to="/booking" style={{
            display: 'inline-block', padding: '16px 48px', backgroundColor: '#fff', color: '#000',
            textDecoration: 'none', borderRadius: '4px', fontWeight: '600',
            fontSize: '14px', letterSpacing: '1px', transition: 'all 0.3s',
          }}>
            BOOK A TABLE
          </Link>
        </ScrollReveal>
      </section>

      <footer style={{
        padding: '48px 40px', borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '3px', marginBottom: '16px' }}>YORI</div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 8px' }}>
          Deggendorf &middot; Modern Asian Cuisine
        </p>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: 0 }}>
          &copy; {new Date().getFullYear()} Yori Deggendorf. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
