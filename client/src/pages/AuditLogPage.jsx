import { useState, useEffect } from 'react';
import { useRestaurants } from '../context/RestaurantContext';
import { auditLogService } from '../services/auditLogService';

export default function AuditLogPage() {
  const { selectedRestaurantId, selectedRestaurant } = useRestaurants();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [selectedRestaurantId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await auditLogService.getAll(selectedRestaurantId);
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const actionColors = {
    CREATE: 'rgba(40,167,69,0.25)',
    UPDATE: 'rgba(255,215,0,0.15)',
    DELETE: 'rgba(220,53,69,0.25)',
    STATUS_CHANGE: 'rgba(255,193,7,0.25)',
    SEAT: 'rgba(23,162,184,0.25)',
    COMPLETE: 'rgba(111,66,193,0.25)',
    EXTEND: 'rgba(253,126,20,0.25)',
    IMPORT: 'rgba(32,201,151,0.25)',
    TOGGLE_AVAILABILITY: 'rgba(232,62,140,0.25)',
    DELETE_CATEGORY: 'rgba(220,53,69,0.25)',
    RENAME_CATEGORY: 'rgba(108,117,125,0.25)',
  };

  const actionTextColors = {
    CREATE: 'green',
    UPDATE: '#ffd700',
    DELETE: '#ff6b6b',
    STATUS_CHANGE: '#ffc107',
    SEAT: '#17a2b8',
    COMPLETE: '#6f42c1',
    EXTEND: '#fd7e14',
    IMPORT: '#20c997',
    TOGGLE_AVAILABILITY: '#e83e8c',
    DELETE_CATEGORY: '#ff6b6b',
    RENAME_CATEGORY: 'rgba(255,255,255,0.5)',
  };

  return (
    <div style={{ padding: '24px 40px' }}>
      <h1>Audit Log{selectedRestaurant ? ` — ${selectedRestaurant.name}` : ''}</h1>
      <button onClick={loadLogs} style={{ marginBottom: '16px', padding: '6px 16px', cursor: 'pointer' }}>
        Refresh
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p>No audit log entries found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <th>Time</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Resource ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.userName || log.userId}</td>
                  <td>{log.userRole}</td>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: '3px',
                      fontSize: '11px', fontWeight: 'bold', color: actionTextColors[log.action] || 'rgba(255,255,255,0.5)',
                      backgroundColor: actionColors[log.action] || 'rgba(108,117,125,0.25)',
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.resource}</td>
                  <td style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.resourceId || '-'}
                  </td>
                  <td style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', maxWidth: '250px' }}>
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
