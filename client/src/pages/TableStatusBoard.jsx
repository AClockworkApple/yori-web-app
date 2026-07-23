import { useState, useEffect, useCallback } from 'react';
import { tableService } from '../services/tableService';
import { useRestaurants } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const STATUS_COLORS = {
  AVAILABLE: 'rgba(40,167,69,0.25)',
  OCCUPIED: 'rgba(220,53,69,0.25)',
  CLEANING: 'rgba(255,193,7,0.25)',
  MAINTENANCE: 'rgba(108,117,125,0.25)',
};

const STATUS_TEXT_COLORS = {
  AVAILABLE: 'green',
  OCCUPIED: '#ff6b6b',
  CLEANING: '#ffc107',
  MAINTENANCE: 'rgba(255,255,255,0.5)',
};

const STATUS_BORDERS = {
  AVAILABLE: 'rgba(40,167,69,0.5)',
  OCCUPIED: 'rgba(220,53,69,0.5)',
  CLEANING: 'rgba(255,193,7,0.5)',
  MAINTENANCE: 'rgba(108,117,125,0.5)',
};

const STATUS_LABELS = {
  AVAILABLE: 'Free',
  OCCUPIED: 'Occupied',
  CLEANING: 'Cleaning',
  MAINTENANCE: 'Maintenance',
};

const NEXT_STATUSES = {
  AVAILABLE: ['OCCUPIED', 'CLEANING', 'MAINTENANCE'],
  OCCUPIED: ['CLEANING', 'AVAILABLE', 'MAINTENANCE'],
  CLEANING: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'],
  MAINTENANCE: ['AVAILABLE', 'OCCUPIED', 'CLEANING'],
};

export default function TableStatusBoard() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMenu, setStatusMenu] = useState(null);
  const { selectedRestaurantId, selectedRestaurant } = useRestaurants();
  const { hasRole } = useAuth();
  const { socket } = useSocket();

  const fetchTables = useCallback(async () => {
    if (!selectedRestaurantId) return;
    try {
      const data = await tableService.getByRestaurant(selectedRestaurantId);
      setTables(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (!socket) return;

    const handleTableUpdate = (data) => {
      if (data.action === 'created' || data.action === 'updated' || data.action === 'statusChanged') {
        setTables(prev => {
          const idx = prev.findIndex(t => t.id === data.table.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = data.table;
            return next;
          }
          return [...prev, data.table];
        });
      } else if (data.action === 'deleted') {
        setTables(prev => prev.filter(t => t.id !== data.tableId));
      }
    };

    socket.on('table:updated', handleTableUpdate);
    return () => socket.off('table:updated', handleTableUpdate);
  }, [socket]);

  const handleStatusChange = async (tableId, newStatus) => {
    try {
      await tableService.updateStatus(tableId, newStatus);
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
      setStatusMenu(null);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  if (!selectedRestaurantId) {
    return (
      <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Table Status Board</h1>
        <p>Select a restaurant from the navigation bar to view the table status board.</p>
      </div>
    );
  }

  const canChangeStatus = hasRole('OWNER', 'MANAGER', 'STAFF');

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Table Status — {selectedRestaurant?.name}</h1>
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', alignItems: 'center' }}>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: STATUS_COLORS[key] }} />
              <span>{label}</span>
            </div>
          ))}
          {!loading && <span style={{ color: '#999' }}>({tables.length} tables)</span>}
        </div>
      </div>

      {error && <p style={{ color: '#ff6b6b', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px' }}>Error: {error}</p>}

      {loading ? (
        <p>Loading tables...</p>
      ) : tables.length === 0 ? (
        <p>No tables found for this restaurant.</p>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px', position: 'relative'
        }}>
          {tables.map(table => (
            <div key={table.id} style={{
              border: `3px solid ${STATUS_BORDERS[table.status] || 'rgba(255,255,255,0.08)'}`,
              borderRadius: '12px', padding: '24px 16px',
              backgroundColor: STATUS_COLORS[table.status] || 'rgba(255,255,255,0.03)',
              color: STATUS_TEXT_COLORS[table.status] || 'rgba(255,255,255,0.8)',
              textAlign: 'center', position: 'relative',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              cursor: canChangeStatus ? 'pointer' : 'default',
            }}
              onClick={() => canChangeStatus && setStatusMenu(statusMenu === table.id ? null : table.id)}
            >
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                {table.name || table.id}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>
                {table.seats} {table.seats === 1 ? 'seat' : 'seats'}
              </div>
              <div style={{
                fontSize: '13px', marginTop: '8px', opacity: 0.85,
                backgroundColor: 'rgba(0,0,0,0.15)', padding: '4px 12px', borderRadius: '20px',
                display: 'inline-block'
              }}>
                {STATUS_LABELS[table.status] || table.status}
              </div>

              {statusMenu === table.id && (
                <div style={{
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                  marginTop: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 10,
                  padding: '8px', minWidth: '140px',
                }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px', padding: '0 8px' }}>
                    Change to:
                  </div>
                  {(NEXT_STATUSES[table.status] || []).map(newStatus => (
                    <button key={newStatus} onClick={() => handleStatusChange(table.id, newStatus)}
                      style={{
                        display: 'block', width: '100%', padding: '8px 12px', border: 'none',
                        backgroundColor: STATUS_COLORS[newStatus], color: STATUS_TEXT_COLORS[newStatus] || '#fff',
                        borderRadius: '4px', cursor: 'pointer', marginBottom: '4px',
                        fontSize: '13px', fontWeight: 'bold', textAlign: 'left'
                      }}>
                      {STATUS_LABELS[newStatus]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
