import { useState, useEffect } from 'react';
import { useAnnouncements } from '../context/AnnouncementContext';
import { useRestaurants } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';

const PRIORITY_COLORS = {
  IMPORTANT: '#dc3545',
  WARNING: '#ffc107',
  INFO: '#17a2b8',
};

const PRIORITY_OPTIONS = ['INFO', 'WARNING', 'IMPORTANT'];

export default function AnnouncementsPage() {
  const {
    announcements, loading, error,
    fetchByRestaurant, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  } = useAnnouncements();
  const { selectedRestaurantId, selectedRestaurant } = useRestaurants();
  const { hasRole } = useAuth();

  const canManage = hasRole('OWNER') || hasRole('MANAGER');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    message: '',
    priority: 'INFO',
    expiresAt: '',
  });

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchByRestaurant(selectedRestaurantId);
    }
  }, [selectedRestaurantId, fetchByRestaurant]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        message: formData.message,
        priority: formData.priority,
        restaurantId: selectedRestaurantId,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };
      if (editingId) {
        await updateAnnouncement(editingId, payload);
      } else {
        await createAnnouncement(payload);
      }
      resetForm();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      message: announcement.message,
      priority: announcement.priority,
      expiresAt: announcement.expiresAt ? announcement.expiresAt.substring(0, 16) : '',
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleToggleActive = async (announcement) => {
    try {
      await updateAnnouncement(announcement.id, { active: !announcement.active });
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ message: '', priority: 'INFO', expiresAt: '' });
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString();
  };

  if (!selectedRestaurantId) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Announcements</h1>
        <p>Select a restaurant from the navigation bar to manage announcements.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Announcements — {selectedRestaurant?.name}</h1>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {canManage && (
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px' }}>
            {showForm ? 'Cancel' : 'New Announcement'}
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '8px'
        }}>
          <h2>{editingId ? 'Edit Announcement' : 'New Announcement'}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Message *</label>
              <textarea name="message" value={formData.message}
                onChange={handleInputChange} required rows="3"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div>
              <label>Priority</label>
              <select name="priority" value={formData.priority}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Expires At (optional)</label>
              <input type="datetime-local" name="expiresAt" value={formData.expiresAt}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            marginTop: '20px', padding: '10px 30px', backgroundColor: '#007bff',
            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
            {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : announcements.length === 0 ? (
        <p>No announcements.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {announcements.map(a => (
            <div key={a.id} style={{
              border: `2px solid ${PRIORITY_COLORS[a.priority] || '#ccc'}`,
              borderRadius: '8px', padding: '16px',
              opacity: a.active ? 1 : 0.5,
              backgroundColor: a.active ? '#fff' : '#f8f9fa',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: '4px',
                    fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase',
                    backgroundColor: PRIORITY_COLORS[a.priority],
                    color: a.priority === 'WARNING' ? '#000' : '#fff',
                    marginBottom: '8px'
                  }}>
                    {a.priority}
                  </div>
                  <p style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>{a.message}</p>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Created: {formatDate(a.createdAt)}
                    {a.expiresAt && <> &middot; Expires: {formatDate(a.expiresAt)}</>}
                    {!a.active && <span style={{ color: '#dc3545' }}> &middot; Deactivated</span>}
                  </div>
                </div>
                {canManage && (
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                    <button onClick={() => handleToggleActive(a)} style={{
                      padding: '4px 10px', cursor: 'pointer', fontSize: '12px',
                      backgroundColor: a.active ? '#dc3545' : '#28a745',
                      color: 'white', border: 'none', borderRadius: '4px',
                    }}>
                      {a.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleEdit(a)} style={{ padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(a.id)} style={{
                      padding: '4px 10px', cursor: 'pointer', fontSize: '12px', color: '#dc3545'
                    }}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
