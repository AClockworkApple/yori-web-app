import { useState, useEffect } from 'react';
import { useOrders } from '../context/OrderContext';
import { useRestaurants } from '../context/RestaurantContext';

export default function OrdersPage() {
  const { orders, loading, error, fetchOrdersByRestaurant, createOrder, closeOrder, deleteOrder } = useOrders();
  const { selectedRestaurantId, selectedRestaurant } = useRestaurants();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bookingId: '',
    employeeId: '',
    taxRate: 0,
    serviceFeeRate: 0,
  });

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchOrdersByRestaurant(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOrder({ ...formData, restaurantId: selectedRestaurantId });
      resetForm();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleClose = async (id) => {
    if (confirm('Close this order?')) {
      try {
        await closeOrder(id);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(id);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({ bookingId: '', employeeId: '', taxRate: 0, serviceFeeRate: 0 });
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: '#ffc107',
      CLOSED: '#28a745',
      SPLIT: '#17a2b8',
    };
    return colors[status] || '#6c757d';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  if (!selectedRestaurantId) {
    return (
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        <h1>Orders Management</h1>
        <p>Select a restaurant from the navigation bar to manage orders.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Orders — {selectedRestaurant?.name}</h1>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px' }}>
          {showForm ? 'Cancel' : 'Create Order'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '8px'
        }}>
          <h2>Create New Order</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>Booking ID (optional)</label>
              <input type="text" name="bookingId" value={formData.bookingId}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div>
              <label>Employee ID *</label>
              <input type="text" name="employeeId" value={formData.employeeId}
                onChange={handleInputChange} required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div>
              <label>Tax Rate (%)</label>
              <input type="number" name="taxRate" value={formData.taxRate}
                onChange={handleInputChange} step="0.01" min="0"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div>
              <label>Service Fee (%)</label>
              <input type="number" name="serviceFeeRate" value={formData.serviceFeeRate}
                onChange={handleInputChange} step="0.01" min="0"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={{
            marginTop: '20px', padding: '10px 30px', backgroundColor: '#007bff',
            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Order ID</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Created</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Subtotal</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Tax</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Service Fee</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Tip</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Total</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <strong>{order.id.substring(0, 8)}...</strong>
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  {formatDateTime(order.createdAt)}
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: getStatusColor(order.status), color: 'white', fontSize: '12px' }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{formatCurrency(order.subtotal)}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{formatCurrency(order.taxAmount)}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{formatCurrency(order.serviceFeeAmount)}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{formatCurrency(order.tip)}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <strong>{formatCurrency(order.total)}</strong>
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  {order.status === 'OPEN' && (
                    <>
                      <button onClick={() => window.location.href = `/orders/${order.id}`} style={{ marginRight: '10px' }}>
                        Add Items
                      </button>
                      <button onClick={() => handleClose(order.id)} style={{ marginRight: '10px', backgroundColor: '#28a745', color: 'white' }}>
                        Close
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(order.id)} style={{ color: 'red' }}>
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
