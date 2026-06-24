import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useRestaurants } from '../context/RestaurantContext';
import { useBookings } from '../context/BookingContext';
import { useMenuItems } from '../context/MenuItemContext';
import { useTables } from '../context/TableContext';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import SearchBar from '../components/SearchBar';

export default function OrdersPage() {
  const { orders, orderItems, error, fetchOrdersByRestaurant, fetchOrder, createOrder, addItem, removeItem, closeOrder, deleteOrder, setCurrentOrder, currentOrder } = useOrders();
  const { selectedRestaurantId, selectedRestaurant } = useRestaurants();
  const { fetchBookingsByStatus } = useBookings();
  const { menuItems, fetchRestaurantMenu } = useMenuItems();
  const { tables, fetchTablesByRestaurant } = useTables();
  const { user } = useAuth();

  const [seatedBookings, setSeatedBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [orderQuantities, setOrderQuantities] = useState({});
  const [searchActiveOpen, setSearchActiveOpen] = useState(false);
  const [searchedOpenOrders, setSearchedOpenOrders] = useState([]);
  const [searchActiveClosed, setSearchActiveClosed] = useState(false);
  const [searchedClosedOrders, setSearchedClosedOrders] = useState([]);

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchOrdersByRestaurant(selectedRestaurantId);
      loadSeatedBookings();
      fetchRestaurantMenu(selectedRestaurantId);
      fetchTablesByRestaurant(selectedRestaurantId);
      bookingService.getByRestaurant(selectedRestaurantId).then(data => setAllBookings(data)).catch(() => {});
    }
  }, [selectedRestaurantId]);

  const loadSeatedBookings = async () => {
    try {
      const seated = await fetchBookingsByStatus(selectedRestaurantId, 'SEATED');
      setSeatedBookings(seated);
    } catch (err) {
      console.error('Failed to load seated bookings:', err);
    }
  };

  const getTableNames = (booking) => {
    if (!booking || !booking.tables || booking.tables.length === 0) return '-';
    return booking.tables.map(t => {
      const table = tables.find(x => x.id === t.tableId);
      return table ? table.name : t.tableId;
    }).join(', ');
  };

  const getBookingForOrder = (order) => {
    return allBookings.find(b => b.id === order.bookingId) || null;
  };

  const handleStartOrder = async (booking) => {
    try {
      const existingOrder = orders.find(o => o.bookingId === booking.id && o.status === 'OPEN');
      if (existingOrder) {
        setActiveOrderId(existingOrder.id);
        await setCurrentOrder(existingOrder);
        return;
      }
      const newOrder = await createOrder({
        restaurantId: selectedRestaurantId,
        bookingId: booking.id,
        employeeId: user.id,
        taxRate: selectedRestaurant?.taxRate || 0,
        serviceFeeRate: selectedRestaurant?.serviceFeeRate || 0,
      });
      setActiveOrderId(newOrder.id);
      setOrderQuantities({});
      loadSeatedBookings();
    } catch (err) {
      alert('Failed to start order: ' + err.message);
    }
  };

  const handleSelectOrder = async (order) => {
    setActiveOrderId(order.id);
    setOrderQuantities({});
    await fetchOrder(order.id);
  };

  const handleQuantityChange = (menuItemId, val) => {
    setOrderQuantities({ ...orderQuantities, [menuItemId]: Math.max(0, parseInt(val) || 0) });
  };

  const handleAddItem = async (menuItem) => {
    const qty = orderQuantities[menuItem.id] || 1;
    if (qty <= 0) return;
    try {
      await addItem(activeOrderId, {
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        quantity: qty,
        unitPrice: menuItem.price,
      });
      setOrderQuantities({ ...orderQuantities, [menuItem.id]: 0 });
    } catch (err) {
      alert('Failed to add item: ' + err.message);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(activeOrderId, itemId);
    } catch (err) {
      alert('Failed to remove item: ' + err.message);
    }
  };

  const handleCloseOrder = async () => {
    if (confirm('Close this order?')) {
      try {
        await closeOrder(activeOrderId);
        setActiveOrderId(null);
        setCurrentOrder(null);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleDeleteOrder = async (id) => {
    if (confirm('Delete this order?')) {
      try {
        await deleteOrder(id);
        if (activeOrderId === id) {
          setActiveOrderId(null);
          setCurrentOrder(null);
        }
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString();
  };

  if (!selectedRestaurantId) {
    return (
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        <h1>Orders Management</h1>
        <p>Select a restaurant from the navigation bar to manage orders.</p>
      </div>
    );
  }

  const openOrders = orders.filter(o => o.status === 'OPEN');
  const closedOrders = orders.filter(o => o.status === 'CLOSED' || o.status === 'SPLIT');
  const displayOpenOrders = searchActiveOpen ? searchedOpenOrders : openOrders;
  const displayClosedOrders = searchActiveClosed ? searchedClosedOrders : closedOrders;
  const menuCategories = [...new Set(menuItems.filter(m => m.isAvailable).map(m => m.category))];

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Orders — {selectedRestaurant?.name}</h1>
      {!activeOrderId && (
        <Link to={`/restaurants/${selectedRestaurantId}`} style={{ fontSize: '14px', color: '#007bff', display: 'block', marginBottom: '12px' }}>&larr; Back to Restaurant</Link>
      )}

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {activeOrderId && currentOrder?.id === activeOrderId ? (
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', marginBottom: '30px', backgroundColor: '#f8f9fa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0 }}>Order: {currentOrder.id.substring(0, 8)}...</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setActiveOrderId(null); setCurrentOrder(null); }} style={{ padding: '6px 14px', cursor: 'pointer' }}>&larr; Back to Orders</button>
              <button onClick={handleCloseOrder} style={{ padding: '6px 14px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close Order</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '30px' }}>
            <div style={{ flex: 1 }}>
              <h3>Order Items</h3>
              {orderItems.length === 0 ? (
                <p style={{ color: '#999' }}>No items yet. Add items from the menu.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'right' }}>Qty</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'right' }}>Price</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'right' }}>Total</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map(item => (
                      <tr key={item.id}>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{item.menuItemName}</td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'right' }}>{formatCurrency(item.totalPrice)}</td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                          <button onClick={() => handleRemoveItem(item.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>&times;</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ marginTop: '15px', fontSize: '15px' }}>
                <div><strong>Subtotal:</strong> {formatCurrency(currentOrder.subtotal)}</div>
                <div>Tax: {formatCurrency(currentOrder.taxAmount)}</div>
                <div>Service Fee: {formatCurrency(currentOrder.serviceFeeAmount)}</div>
                <div style={{ fontSize: '18px' }}><strong>Total: {formatCurrency(currentOrder.total)}</strong></div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h3>Menu Items</h3>
              {menuCategories.map(cat => (
                <div key={cat} style={{ marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>{cat}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {menuItems.filter(m => m.category === cat && m.isAvailable).map(item => (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '6px 10px', border: '1px solid #dee2e6', borderRadius: '4px',
                        backgroundColor: '#fff'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{formatCurrency(item.price)}</div>
                        </div>
                        <input type="number" min="0" value={orderQuantities[item.id] || 0}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          style={{ width: '50px', padding: '4px', textAlign: 'center' }} />
                        <button onClick={() => handleAddItem(item)}
                          disabled={!orderQuantities[item.id] || orderQuantities[item.id] <= 0}
                          style={{
                            padding: '4px 12px', backgroundColor: orderQuantities[item.id] > 0 ? '#007bff' : '#6c757d',
                            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
                          }}>Add</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {menuItems.length === 0 && <p style={{ color: '#999' }}>No menu items found.</p>}
            </div>
          </div>
        </div>
      ) : (
        <>
          <h2>Seated Customers</h2>
          {seatedBookings.length === 0 ? (
            <p>No seated customers.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '30px' }}>
              {seatedBookings.map(booking => {
                const hasOrder = orders.some(o => o.bookingId === booking.id && o.status === 'OPEN');
                return (
                  <div key={booking.id} style={{
                    border: '1px solid #dee2e6', borderRadius: '8px', padding: '16px',
                    backgroundColor: hasOrder ? '#e8f5e9' : '#fff'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{booking.customerName}</div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                      Party: {booking.partySize} | Tables: {getTableNames(booking)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                      {booking.source === 'walk-in' ? 'Walk-in' : 'Pre-booking'} &middot; {formatDateTime(booking.scheduledStart)}
                    </div>
                    <button onClick={() => handleStartOrder(booking)}
                      style={{
                        marginTop: '10px', padding: '6px 16px', cursor: 'pointer',
                        backgroundColor: hasOrder ? '#28a745' : '#007bff',
                        color: 'white', border: 'none', borderRadius: '4px'
                      }}>
                      {hasOrder ? 'Manage Order' : 'Start Order'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <h2>Open Orders</h2>
          <SearchBar
            items={openOrders}
            fields={['id']}
            weights={{ id: 1 }}
            placeholder="Search open orders by ID..."
            onResults={(results, q) => {
              setSearchedOpenOrders(results);
              setSearchActiveOpen(q.length > 0);
            }}
          />
          {displayOpenOrders.length === 0 ? (
            <p>No open orders.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '30px' }}>
              {displayOpenOrders.map(order => {
                const booking = getBookingForOrder(order);
                return (
                <div key={order.id} onClick={() => handleSelectOrder(order)} style={{
                  display: 'flex', alignItems: 'center', gap: '15px',
                  padding: '12px 16px', border: '1px solid #dee2e6', borderRadius: '8px',
                  backgroundColor: '#fff', cursor: 'pointer'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{booking ? booking.customerName : 'Unknown'}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Table{booking && booking.tables && booking.tables.length > 1 ? 's' : ''}: {getTableNames(booking)} &middot; {order.status}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{formatCurrency(order.total)}</div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
                </div>
                );
              })}
            </div>
          )}

          <h2>Closed Orders</h2>
          <SearchBar
            items={closedOrders}
            fields={['id']}
            weights={{ id: 1 }}
            placeholder="Search closed orders by ID..."
            onResults={(results, q) => {
              setSearchedClosedOrders(results);
              setSearchActiveClosed(q.length > 0);
            }}
          />
          {displayClosedOrders.length === 0 ? (
            <p>No closed orders.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Order ID</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Created</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Subtotal</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Tax</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Fee</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Tip</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayClosedOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}><strong>{order.id.substring(0, 8)}...</strong></td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{formatDateTime(order.createdAt)}</td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#28a745', color: 'white', fontSize: '12px' }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>{formatCurrency(order.subtotal)}</td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>{formatCurrency(order.taxAmount)}</td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>{formatCurrency(order.serviceFeeAmount)}</td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>{formatCurrency(order.tip)}</td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}><strong>{formatCurrency(order.total)}</strong></td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                      <button onClick={() => handleDeleteOrder(order.id)} style={{ color: 'red', marginRight: '8px' }}>Delete</button>
                      <a href={`/receipts/${order.id}`} style={{ color: '#007bff' }}>Receipt</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}