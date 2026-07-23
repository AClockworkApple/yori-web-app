import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRestaurants } from '../context/RestaurantContext';

export default function RestaurantsPage() {
  const { restaurants, loading, error, fetchRestaurants, createRestaurant } = useRestaurants();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    mode: 'AUTO',
    maxExtensionMinutes: 60,
    warningBeforeMinutes: 15,
    slotDurationMinutes: 120,
    bufferMinutes: 30,
    overbookingPercentage: 30,
    taxRate: 0,
    serviceFeeRate: 0,
    dataRetentionDays: 30,
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRestaurant(formData);
      resetForm();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({
      name: '',
      address: '',
      mode: 'AUTO',
      maxExtensionMinutes: 60,
      warningBeforeMinutes: 15,
      slotDurationMinutes: 120,
      bufferMinutes: 30,
      overbookingPercentage: 30,
      taxRate: 0,
      serviceFeeRate: 0,
      dataRetentionDays: 30,
    });
  };

  const labelStyle = { color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' };

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Restaurants Management</h1>

      {error && <p style={{ color: '#ff6b6b' }}>Error: {error}</p>}

      <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: '20px' }}>
        {showForm ? 'Cancel' : 'Add Restaurant'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          border: '1px solid rgba(255,255,255,0.08)', padding: '24px', marginBottom: '24px',
          borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)'
        }}>
          <h2 style={{ marginBottom: '20px' }}>Add New Restaurant</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input type="text" name="name" value={formData.name}
                onChange={handleInputChange} required
                style={{ width: '100%', padding: '10px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={labelStyle}>Address</label>
              <input type="text" name="address" value={formData.address}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={labelStyle}>Mode</label>
              <select name="mode" value={formData.mode}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', marginTop: '4px' }}>
                <option value="AUTO">Auto</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Slot Duration (minutes)</label>
              <input type="number" name="slotDurationMinutes" value={formData.slotDurationMinutes}
                onChange={handleInputChange} min="15" max="480"
                style={{ width: '100%', padding: '10px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={labelStyle}>Buffer Duration (minutes)</label>
              <input type="number" name="bufferMinutes" value={formData.bufferMinutes}
                onChange={handleInputChange} min="0" max="240"
                style={{ width: '100%', padding: '10px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={labelStyle}>Max Extension (minutes)</label>
              <input type="number" name="maxExtensionMinutes" value={formData.maxExtensionMinutes}
                onChange={handleInputChange} min="0" max="480"
                style={{ width: '100%', padding: '10px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={labelStyle}>Warning Before (minutes)</label>
              <input type="number" name="warningBeforeMinutes" value={formData.warningBeforeMinutes}
                onChange={handleInputChange} min="0" max="120"
                style={{ width: '100%', padding: '10px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={labelStyle}>Overbooking (%)</label>
              <input type="number" name="overbookingPercentage" value={formData.overbookingPercentage}
                onChange={handleInputChange} min="0" max="200"
                style={{ width: '100%', padding: '10px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={labelStyle}>Tax Rate (%)</label>
              <input type="number" name="taxRate" value={formData.taxRate}
                onChange={handleInputChange} min="0" max="100" step="0.01"
                style={{ width: '100%', padding: '10px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={labelStyle}>Service Fee (%)</label>
              <input type="number" name="serviceFeeRate" value={formData.serviceFeeRate}
                onChange={handleInputChange} min="0" max="100" step="0.01"
                style={{ width: '100%', padding: '10px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={labelStyle}>Data Retention (days)</label>
              <input type="number" name="dataRetentionDays" value={formData.dataRetentionDays}
                onChange={handleInputChange} min="1" max="365"
                style={{ width: '100%', padding: '10px', marginTop: '4px' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            marginTop: '20px', padding: '10px 30px',
            backgroundColor: 'rgba(255,215,0,0.15)', color: '#ffd700',
            border: '1px solid rgba(255,215,0,0.3)', borderRadius: '4px', cursor: 'pointer'
          }}>
            {loading ? 'Saving...' : 'Create'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : restaurants.length === 0 ? (
        <p>No restaurants found. Add one to get started.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
          {restaurants.map((restaurant) => (
            <Link key={restaurant.id} to={`/restaurants/${restaurant.id}`} style={{
              display: 'flex', alignItems: 'center', padding: '16px 20px',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
              textDecoration: 'none', color: 'inherit', backgroundColor: 'rgba(255,255,255,0.03)',
              gap: '20px', transition: 'background 0.2s',
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', minWidth: '180px', color: '#fff' }}>{restaurant.name}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', flex: 1 }}>{restaurant.address || '-'}</div>
              <span style={{
                padding: '4px 10px', borderRadius: '4px', fontSize: '12px',
                backgroundColor: 'rgba(111,66,193,0.25)', color: '#b388ff', fontWeight: '600', marginRight: '6px'
              }}>
                {restaurant.overbookingPercentage || 30}% OB
              </span>
              <span style={{
                padding: '4px 10px', borderRadius: '4px', fontSize: '12px',
                backgroundColor: restaurant.mode === 'AUTO' ? 'rgba(40,167,69,0.25)' : 'rgba(255,193,7,0.25)',
                color: restaurant.mode === 'AUTO' ? '#28a745' : '#ffc107', fontWeight: '600'
              }}>
                {restaurant.mode}
              </span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>&rarr;</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
