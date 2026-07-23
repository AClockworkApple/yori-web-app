import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTables } from '../context/TableContext';
import { useRestaurants } from '../context/RestaurantContext';

export default function TablesPage() {
  const { tables, loading, error, fetchTablesByRestaurant, createTable, updateTable, updateTableStatus, deleteTable } = useTables();
  const { selectedRestaurantId, selectedRestaurant } = useRestaurants();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    seats: 4,
    isMergeable: false,
  });

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchTablesByRestaurant(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, restaurantId: selectedRestaurantId };
      if (editingId) {
        await updateTable(editingId, payload);
      } else {
        await createTable(payload);
      }
      resetForm();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (table) => {
    setFormData({
      name: table.name,
      seats: table.seats,
      isMergeable: table.isMergeable,
    });
    setEditingId(table.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this table?')) {
      try {
        await deleteTable(id);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTableStatus(id, newStatus);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', seats: 4, isMergeable: false });
  };

  const getStatusColor = (status) => {
    const colors = {
      AVAILABLE: '#28a745',
      OCCUPIED: '#dc3545',
      CLEANING: '#ffc107',
      MAINTENANCE: '#6c757d',
    };
    return colors[status] || '#6c757d';
  };

  if (!selectedRestaurantId) {
    return (
      <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Tables Management</h1>
        <p>Select a restaurant from the navigation bar to manage tables.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Tables — {selectedRestaurant?.name}</h1>
      <Link to={`/restaurants/${selectedRestaurantId}`} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '12px' }}>&larr; Back to Restaurant</Link>

      {error && <p style={{ color: '#ff6b6b' }}>Error: {error}</p>}

      <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: '20px', padding: '10px 20px' }}>
        {showForm ? 'Cancel' : 'Add Table'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          border: '1px solid rgba(255,255,255,0.08)', padding: '20px', marginBottom: '20px', borderRadius: '8px'
        }}>
          <h2>{editingId ? 'Edit Table' : 'Add New Table'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '0.5px' }}>Table Name *</label>
              <input type="text" name="name" value={formData.name}
                onChange={handleInputChange} placeholder="e.g., Table 1" required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '0.5px' }}>Number of Seats</label>
              <input type="number" name="seats" value={formData.seats}
                onChange={handleInputChange} min="1"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '25px' }}>
              <input type="checkbox" name="isMergeable" checked={formData.isMergeable}
                onChange={handleInputChange} style={{ marginRight: '10px' }} />
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '0.5px' }}>Mergeable</label>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{
            marginTop: '20px', padding: '10px 30px', backgroundColor: 'rgba(255,215,0,0.15)',
            color: '#ffd700', border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
            {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : tables.length === 0 ? (
        <p>No tables found. Add one to get started.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Seats</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Mergeable</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table.id}>
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>{table.name}</td>
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>{table.seats}</td>
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>{table.isMergeable ? 'Yes' : 'No'}</td>
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <select value={table.status} onChange={(e) => handleStatusChange(table.id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '4px',
                      backgroundColor: getStatusColor(table.status), color: 'white', border: 'none', cursor: 'pointer' }}>
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </td>
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={() => handleEdit(table)} style={{ marginRight: '10px' }}>Edit</button>
                  <button onClick={() => handleDelete(table.id)} style={{ color: '#ff6b6b' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
