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
    CREATE: '#28a745',
    UPDATE: '#007bff',
    DELETE: '#dc3545',
    STATUS_CHANGE: '#ffc107',
    SEAT: '#17a2b8',
    COMPLETE: '#6f42c1',
    EXTEND: '#fd7e14',
    IMPORT: '#20c997',
    TOGGLE_AVAILABILITY: '#e83e8c',
    DELETE_CATEGORY: '#dc3545',
    RENAME_CATEGORY: '#6c757d',
  };

  return (
    <div style={{ padding: '20px' }}>
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
              <tr style={{ backgroundColor: '#f8f9fa' }}>
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
                      fontSize: '11px', fontWeight: 'bold', color: '#fff',
                      backgroundColor: actionColors[log.action] || '#6c757d',
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.resource}</td>
                  <td style={{ fontSize: '12px', color: '#666', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.resourceId || '-'}
                  </td>
                  <td style={{ fontSize: '12px', color: '#666', maxWidth: '250px' }}>
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
