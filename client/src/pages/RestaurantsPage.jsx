import { useState, useEffect } from 'react';
import { useRestaurants } from '../context/RestaurantContext';

export default function RestaurantsPage() {
  const { restaurants, loading, error, fetchRestaurants, createRestaurant, updateRestaurant, deleteRestaurant } = useRestaurants();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
    ownerId: 'demo-owner',
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
      if (editingId) {
        await updateRestaurant(editingId, formData);
      } else {
        await createRestaurant(formData);
      }
      resetForm();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (restaurant) => {
    setFormData({
      name: restaurant.name,
      address: restaurant.address || '',
      mode: restaurant.mode || 'SEMI_AUTO',
      maxExtensionMinutes: restaurant.maxExtensionMinutes || 60,
      warningBeforeMinutes: restaurant.warningBeforeMinutes || 15,
      slotDurationMinutes: restaurant.slotDurationMinutes || 120,
      bufferMinutes: restaurant.bufferMinutes || 30,
      taxRate: restaurant.taxRate || 0,
      serviceFeeRate: restaurant.serviceFeeRate || 0,
      dataRetentionDays: restaurant.dataRetentionDays || 30,
      ownerId: restaurant.ownerId,
    });
    setEditingId(restaurant.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await deleteRestaurant(id);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
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
      ownerId: 'demo-owner',
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
          <h2>{editingId ? 'Edit Restaurant' : 'Add New Restaurant'}</h2>
          
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
            {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : restaurants.length === 0 ? (
        <p>No restaurants found. Add one to get started.</p>
      ) : (
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          marginTop: '20px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Address</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Mode</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Slot Duration</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Buffer</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Tax Rate</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((restaurant) => (
              <tr key={restaurant.id}>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{restaurant.name}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{restaurant.address || '-'}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: restaurant.mode === 'FULL_AUTO' ? '#28a745' : '#ffc107',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {restaurant.mode}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{restaurant.slotDurationMinutes} min</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{restaurant.bufferMinutes} min</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{restaurant.taxRate}%</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <button onClick={() => handleEdit(restaurant)} style={{ marginRight: '10px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(restaurant.id)} style={{ color: 'red' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}