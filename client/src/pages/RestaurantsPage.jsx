import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRestaurants } from '../context/RestaurantContext';

export default function RestaurantsPage() {
  const { restaurants, loading, error, fetchRestaurants, createRestaurant } = useRestaurants();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    mode: 'SEMI_AUTO',
    maxExtensionMinutes: 60,
    warningBeforeMinutes: 15,
    slotDurationMinutes: 120,
    bufferMinutes: 30,
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
      mode: 'SEMI_AUTO',
      maxExtensionMinutes: 60,
      warningBeforeMinutes: 15,
      slotDurationMinutes: 120,
      bufferMinutes: 30,
      taxRate: 0,
      serviceFeeRate: 0,
      dataRetentionDays: 30,
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Restaurants Management</h1>
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: '20px', padding: '10px 20px' }}>
        {showForm ? 'Cancel' : 'Add Restaurant'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ 
          border: '1px solid #ccc', 
          padding: '20px', 
          marginBottom: '20px',
          borderRadius: '8px'
        }}>
          <h2>Add New Restaurant</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            
            <div>
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Mode</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="SEMI_AUTO">Semi-Auto</option>
                <option value="FULL_AUTO">Full Auto</option>
              </select>
            </div>

            <div>
              <label>Slot Duration (minutes)</label>
              <input
                type="number"
                name="slotDurationMinutes"
                value={formData.slotDurationMinutes}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Buffer Duration (minutes)</label>
              <input
                type="number"
                name="bufferMinutes"
                value={formData.bufferMinutes}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Max Extension (minutes)</label>
              <input
                type="number"
                name="maxExtensionMinutes"
                value={formData.maxExtensionMinutes}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Warning Before (minutes)</label>
              <input
                type="number"
                name="warningBeforeMinutes"
                value={formData.warningBeforeMinutes}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Tax Rate (%)</label>
              <input
                type="number"
                name="taxRate"
                value={formData.taxRate}
                onChange={handleInputChange}
                step="0.01"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Service Fee (%)</label>
              <input
                type="number"
                name="serviceFeeRate"
                value={formData.serviceFeeRate}
                onChange={handleInputChange}
                step="0.01"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Data Retention (days)</label>
              <input
                type="number"
                name="dataRetentionDays"
                value={formData.dataRetentionDays}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ 
            marginTop: '20px', 
            padding: '10px 30px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
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
              border: '1px solid #dee2e6', borderRadius: '8px',
              textDecoration: 'none', color: 'inherit', backgroundColor: '#fff',
              gap: '20px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', minWidth: '180px' }}>{restaurant.name}</div>
              <div style={{ fontSize: '13px', color: '#666', flex: 1 }}>{restaurant.address || '-'}</div>
              <span style={{
                padding: '4px 10px', borderRadius: '4px', fontSize: '12px',
                backgroundColor: restaurant.mode === 'FULL_AUTO' ? '#28a745' : '#ffc107',
                color: 'white', fontWeight: 'bold'
              }}>
                {restaurant.mode}
              </span>
              <span style={{ fontSize: '13px', color: '#007bff' }}>&rarr;</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}