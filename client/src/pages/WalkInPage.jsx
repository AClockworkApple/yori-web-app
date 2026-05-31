import { useState, useEffect } from 'react';
import { useRestaurants } from '../context/RestaurantContext';
import { useBookings } from '../context/BookingContext';
import { useTables } from '../context/TableContext';

export default function WalkInPage() {
  const { restaurants, fetchRestaurants } = useRestaurants();
  const { fetchWalkIns, createBooking, seatCustomer, completeBooking, addBookingTable } = useBookings();
  const { tables, fetchTablesByRestaurant } = useTables();
  const [walkIns, setWalkIns] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    partySize: 2,
    tableIds: [],
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchTablesByRestaurant(selectedRestaurant);
      loadWalkIns();
    }
  }, [selectedRestaurant]);

  const loadWalkIns = async () => {
    if (!selectedRestaurant) return;
    const data = await fetchWalkIns(selectedRestaurant);
    setWalkIns(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTableToggle = (tableId) => {
    const current = formData.tableIds;
    if (current.includes(tableId)) {
      setFormData({ ...formData, tableIds: current.filter(id => id !== tableId) });
    } else {
      setFormData({ ...formData, tableIds: [...current, tableId] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const now = new Date();
      const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      await createBooking({
        restaurantId: selectedRestaurant,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        partySize: parseInt(formData.partySize),
        scheduledStart: now.toISOString(),
        scheduledEnd: end.toISOString(),
        tableIds: formData.tableIds,
        source: 'walk-in',
        status: 'PENDING',
      });
      setFormData({ customerName: '', customerPhone: '', customerEmail: '', partySize: 2, tableIds: [] });
      setShowForm(false);
      loadWalkIns();
    } catch (err) {
      alert('Failed to register walk-in: ' + err.message);
    }
  };

  const handleSeat = async (walkIn) => {
    try {
      await seatCustomer(walkIn.id);
      loadWalkIns();
    } catch (err) {
      alert('Failed to seat walk-in: ' + err.message);
    }
  };

  const handleComplete = async (walkIn) => {
    try {
      await completeBooking(walkIn.id);
      loadWalkIns();
    } catch (err) {
      alert('Failed to complete walk-in: ' + err.message);
    }
  };

  const availableTables = tables.filter(t => t.status === 'AVAILABLE');

  return (
    <div style={{ padding: '20px' }}>
      <h1>Walk-in Management</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>Restaurant: </label>
        <select value={selectedRestaurant} onChange={(e) => setSelectedRestaurant(e.target.value)}>
          <option value="">-- Select Restaurant --</option>
          {restaurants.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {selectedRestaurant && (
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 16px', marginBottom: '20px', cursor: 'pointer' }}>
          {showForm ? 'Cancel' : 'Register Walk-in'}
        </button>
      )}

      {showForm && selectedRestaurant && (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '20px', borderRadius: '4px' }}>
          <h3>Register Walk-in</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Name: </label>
              <input name="customerName" value={formData.customerName} onChange={handleInputChange} required style={{ width: '100%' }} />
            </div>
            <div>
              <label>Phone: </label>
              <input name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} required style={{ width: '100%' }} />
            </div>
            <div>
              <label>Email: </label>
              <input name="customerEmail" type="email" value={formData.customerEmail} onChange={handleInputChange} style={{ width: '100%' }} />
            </div>
            <div>
              <label>Party Size: </label>
              <input name="partySize" type="number" min="1" value={formData.partySize} onChange={handleInputChange} style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <label>Assign Tables: </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
              {availableTables.length === 0 && <span style={{ color: '#999' }}>No available tables</span>}
              {availableTables.map(table => (
                <label key={table.id} style={{
                  padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer',
                  backgroundColor: formData.tableIds.includes(table.id) ? '#007bff' : '#fff',
                  color: formData.tableIds.includes(table.id) ? '#fff' : '#000',
                }}>
                  <input type="checkbox" checked={formData.tableIds.includes(table.id)} onChange={() => handleTableToggle(table.id)} style={{ display: 'none' }} />
                  {table.tableNumber || table.name} ({table.capacity})
                </label>
              ))}
            </div>
          </div>

          <button type="submit" style={{ marginTop: '16px', padding: '8px 20px', cursor: 'pointer' }}>Register</button>
        </form>
      )}

      <h2>Walk-in Queue</h2>
      {walkIns.length === 0 && <p>No walk-ins registered.</p>}
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th>Time</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Party Size</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {walkIns.map(w => (
            <tr key={w.id}>
              <td>{new Date(w.createdAt).toLocaleTimeString()}</td>
              <td>{w.customerName}</td>
              <td>{w.customerPhone}</td>
              <td>{w.partySize}</td>
              <td>{w.status}</td>
              <td>
                {w.status === 'PENDING' && (
                  <button onClick={() => handleSeat(w)} style={{ marginRight: '4px', cursor: 'pointer' }}>Seat</button>
                )}
                {w.status === 'SEATED' && (
                  <button onClick={() => handleComplete(w)} style={{ cursor: 'pointer' }}>Complete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
