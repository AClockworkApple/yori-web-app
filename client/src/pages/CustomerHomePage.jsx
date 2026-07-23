import { useState, useEffect, useRef } from 'react';
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
  @keyframes slideText {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-up { animation: fadeUp 0.8s ease-out forwards; }
  .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
  .animate-slide-text { animation: slideText 1s ease-out forwards; }
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
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 40px', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', letterSpacing: '1px' }}>
          HOME
        </Link>
        <Link to="/" style={{
          fontSize: '22px', fontWeight: 'bold', color: '#fff', textDecoration: 'none',
          letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <img src={restaurant?.logoUrl || `${ASSETS_URL}/logo-placeholder.svg`}
            alt={restaurant?.name || 'YORI'}
            onError={(e) => { e.target.onerror = null; e.target.src = `${ASSETS_URL}/logo-placeholder.svg`; }}
            style={{ height: '36px', maxWidth: '160px', objectFit: 'contain' }} />
        </Link>
        <Link to="/menu" style={{
          color: '#fff', textDecoration: 'none', fontSize: '14px', letterSpacing: '1px',
        }}>
          MENU
        </Link>
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
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="animate-slide-text" style={{
            fontSize: 'clamp(48px, 10vw, 120px)', fontWeight: '200', margin: '0 0 8px',
            letterSpacing: '8px'
          }}>
            FUSION
          </h1>
          <p className="animate-slide-text" style={{
            fontSize: 'clamp(24px, 4vw, 48px)', color: '#8B0000',
            margin: '0 0 8px', letterSpacing: '4px', fontWeight: '300',
            animationDelay: '0.2s'
          }}>
            elegant
          </p>
          <div className="animate-slide-text" style={{
            display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px',
            animationDelay: '0.4s'
          }}>
            <span style={{ fontSize: 'clamp(18px, 3vw, 32px)', fontWeight: '200', letterSpacing: '2px' }}>
              Fresh
            </span>
            <span style={{ fontSize: 'clamp(18px, 3vw, 32px)', fontWeight: '200', letterSpacing: '2px', color: '#8B0000' }}>
              Hochwertig
            </span>
          </div>
          <div className="animate-fade-up" style={{ marginTop: '48px' }}>
            <Link to="/menu" style={{
              padding: '14px 40px', backgroundColor: '#8B0000', color: '#000',
              textDecoration: 'none', borderRadius: '4px', fontWeight: '600',
              fontSize: '14px', letterSpacing: '1px', transition: 'all 0.3s',
            }}>
              SPEISEKARTE ANSEHEN
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
              <h2 style={{
                fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '300', margin: '0 0 24px',
                lineHeight: '1.2'
              }}>
                TRADITION<br/>
                <span style={{ color: '#8B0000' }}>RESPECT</span><br/>
                QUALITY
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', fontSize: '15px', margin: 0
              }}>
                Yori ist mehr als nur ein ungezwungenes kulinarisches Erlebnis, es vermittelt Ihnen ein
                Gefuhl, das Sie nie vergessen werden. Vom Wabisabi Japans bis zur Kunst der Fusion hofft
                das Yori-Team, dass Sie ein Erlebnis wie nie zuvor erleben werden.
              </p>
              <Link to="/" style={{
                display: 'inline-block', marginTop: '24px', color: '#8B0000', textDecoration: 'none',
                fontSize: '14px', letterSpacing: '1px', fontWeight: '500',
              }}>
                Dein Yori Team
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div style={{
              aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden',
              position: 'relative',
            }}>
              <img src={restaurant?.storyImageUrl || `${ASSETS_URL}/story-placeholder.svg`}
                alt="Yori Restaurant"
                onError={(e) => { e.target.onerror = null; e.target.src = `${ASSETS_URL}/story-placeholder.svg`; }}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                }} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section style={{ padding: '0', margin: '0', width: '100%' }}>
        <ScrollReveal>
          <img src={restaurant?.kitchenImageUrl || `${ASSETS_URL}/kitchen-placeholder.svg`}
            alt="Our kitchen"
            onError={(e) => { e.target.onerror = null; e.target.src = `${ASSETS_URL}/kitchen-placeholder.svg`; }}
            style={{
              width: '100%', height: '60vh', objectFit: 'cover', display: 'block',
            }} />
        </ScrollReveal>
      </section>

      <section style={{
        padding: '120px 40px', maxWidth: '1100px', margin: '0 auto',
      }}>
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '300', margin: '0 0 8px',
              lineHeight: '1.2'
            }}>
              Fusion Kitchen
            </h2>
            <p style={{
              fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: '300', color: 'rgba(255,255,255,0.4)',
              margin: 0, letterSpacing: '2px'
            }}>
              in Deggendorf
            </p>
          </div>
        </ScrollReveal>
      </section>

      <section style={{
        padding: '120px 40px', maxWidth: '1100px', margin: '0 auto',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <ScrollReveal>
            <div style={{ order: 2 }}>
              <h2 style={{
                fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '300', margin: '0 0 24px',
                lineHeight: '1.2'
              }}>
                PURE<br/>
                <span style={{ color: '#8B0000' }}>ELEGANT</span><br/>
                highclasses
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', fontSize: '15px', margin: 0
              }}>
                Yori, ein entzuckendes japanisches Restaurant, bietet ein authentisches kulinarisches
                Erlebnis in ruhiger Atmosphare. Yori ist bekannt fur frisches Sushi, Sashimi und
                köstliches Tempura und verbindet traditionelle Aromen mit modernen Akzenten. Mit
                tadellosem Service und einer ruhigen Atmosphare ist es die erste Wahl fur alle, die
                bei ihrem kulinarischen Erlebnis einen Vorgeschmack auf Japan suchen.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div style={{ order: 1, aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={restaurant?.storyImageUrl || `${ASSETS_URL}/ingredients-placeholder.svg`}
                alt="Fresh ingredients"
                onError={(e) => { e.target.onerror = null; e.target.src = `${ASSETS_URL}/ingredients-placeholder.svg`; }}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                }} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section style={{
        padding: '100px 40px', background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h3 style={{
                fontSize: '12px', letterSpacing: '3px', color: 'rgba(255,255,255,0.4)',
                margin: '0 0 12px', textTransform: 'uppercase'
              }}>
                Frische Zutaten
              </h3>
              <h2 style={{
                fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: '300', margin: 0
              }}>
                Von den besten Herstellern
              </h2>
            </div>
          </ScrollReveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { label: 'Sushi', desc: 'Frischer Fisch, taeglich geliefert' },
              { label: 'Tempura', desc: 'Kunstvolle Zubereitung' },
              { label: 'Ramen', desc: 'Hausgemachte Brühe' },
            ].map((item, i) => (
              <ScrollReveal key={item.label} delay={i * 150}>
                <div style={{
                  padding: '32px', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px', textAlign: 'center',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px', color: '#8B0000' }}>
                    {['Nigiri', 'Rolle', 'Suppe'][i]}
                  </div>
                  <h3 style={{ fontWeight: '400', fontSize: '16px', margin: '0 0 8px', letterSpacing: '1px' }}>
                    {item.label}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        padding: '120px 40px', maxWidth: '1100px', margin: '0 auto',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <ScrollReveal>
            <div style={{ aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={`${ASSETS_URL}/founder-placeholder.svg`}
                alt="Founder"
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                }} />
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div>
              <p style={{
                color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: '1.8',
                fontStyle: 'italic', margin: '0 0 20px'
              }}>
                &bdquo;Als Grunder unseres Sushi-Restaurants treibt mich eine tiefe Liebe zur Kunst der
                Sushi-Zubereitung an. Jedes Brotchen und jedes Sashimi-Stuck ist eine Leinwand, eine
                Geschmacksverschmelzung und ein Stick meines Herzens. Ich mochte es teilen.&ldquo;
              </p>
              <p style={{ color: '#8B0000', fontSize: '13px', letterSpacing: '1px', margin: 0 }}>
                NGOC Tien Nguyen
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section style={{
        padding: '120px 40px', maxWidth: '1100px', margin: '0 auto',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <ScrollReveal>
            <div style={{ order: 2 }}>
              <h2 style={{
                fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '300', margin: '0 0 24px',
                lineHeight: '1.2'
              }}>
                Art Of<br/>
                <span style={{ color: '#8B0000' }}>Fusion</span>
              </h2>
              <p style={{
                fontSize: '16px', color: 'rgba(255,255,255,0.4)', margin: '0 0 20px',
                letterSpacing: '1px'
              }}>
                Ein japanischer Raum in Deggendorf
              </p>
              <p style={{
                color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', fontSize: '15px', margin: 0
              }}>
                Japanisches Essen bietet eine harmonische Mischung aus Tradition und Innovation.
                Zartes Sushi, herzhaftes Nigiri und kunstvolles Tempura spiegeln Prazision und
                Ausgewogenheit wider. Umami-reiche Aromen, frische Zutaten und eine sorgfaltige
                Prasentation schaffen eine kulinarische Reise, die Einfachheit und kulinarische
                Meisterschaft zelebriert.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div style={{ order: 1 }}>
              <Link to="/booking" style={{
                display: 'inline-block', padding: '14px 40px', backgroundColor: '#8B0000', color: '#000',
                textDecoration: 'none', borderRadius: '4px', fontWeight: '600',
                fontSize: '14px', letterSpacing: '1px', transition: 'all 0.3s',
              }}>
                RESERVIEREN
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section style={{ padding: '0', margin: '0', width: '100%' }}>
        <ScrollReveal>
          <img src={restaurant?.teamImageUrl || `${ASSETS_URL}/team-placeholder.svg`}
            alt="Our team"
            onError={(e) => { e.target.onerror = null; e.target.src = `${ASSETS_URL}/team-placeholder.svg`; }}
            style={{
              width: '100%', height: '50vh', objectFit: 'cover', display: 'block',
            }} />
        </ScrollReveal>
      </section>

      <section style={{
        padding: '100px 40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center'
      }}>
        <ScrollReveal>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: '300', margin: '0 0 8px'
          }}>
            Geniessen Unsere Kuche
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.4)', fontSize: '15px', margin: '0 0 12px'
          }}>
            Kommen Sie und feiern Sie mit uns
          </p>
          <Link to="/booking" style={{
            display: 'inline-block', padding: '16px 48px', backgroundColor: '#8B0000', color: '#000',
            textDecoration: 'none', borderRadius: '4px', fontWeight: '600',
            fontSize: '14px', letterSpacing: '1px', transition: 'all 0.3s', marginTop: '24px'
          }}>
            BOOK A TABLE
          </Link>
        </ScrollReveal>
      </section>

      <footer style={{
        padding: '48px 40px', borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center'
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
        <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '3px', marginBottom: '16px' }}>YORI</div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 8px' }}>
          Westlicher Stadtgraben 21, 94469 Deggendorf
        </p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', margin: '0 0 4px' }}>
          info@yori-deggendorf.de &middot; +49 991 9815 6853
        </p>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: '12px 0 0' }}>
          &copy; {new Date().getFullYear()} Yori Deggendorf. All rights reserved.
        </p>
      </footer>
    </div>
  );
}