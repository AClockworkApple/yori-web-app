import { useState, useEffect } from 'react';
import { useAnnouncements } from '../context/AnnouncementContext';
import { useRestaurants } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';

const PRIORITY_COLORS = {
  IMPORTANT: 'rgba(220,53,69,0.25)',
  WARNING: 'rgba(255,193,7,0.25)',
  INFO: 'rgba(23,162,184,0.25)',
};

const PRIORITY_TEXT_COLORS = {
  IMPORTANT: '#ff6b6b',
  WARNING: '#ffc107',
  INFO: '#17a2b8',
};

const PRIORITY_OPTIONS = ['INFO', 'WARNING', 'IMPORTANT'];

export default function AnnouncementsPage() {
  const {
    announcements, loading, error,
    fetchByRestaurant, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  } = useAnnouncements();
  const { restaurants, selectedRestaurantId, selectedRestaurant, setSelectedRestaurantId } = useRestaurants();
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
      <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Announcements</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>Select a restaurant to manage announcements.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {restaurants.map(r => (
            <button key={r.id} onClick={() => setSelectedRestaurantId(r.id)} style={{
              display: 'flex', alignItems: 'center', padding: '16px 20px',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'left',
              gap: '16px', transition: 'all 0.2s', width: '100%',
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}>
              <div style={{ fontSize: '16px', fontWeight: '600', minWidth: '180px', color: '#fff' }}>{r.name}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', flex: 1 }}>{r.address || '-'}</div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>&rarr;</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Announcements — {selectedRestaurant?.name}</h1>

      {error && <p style={{ color: '#ff6b6b' }}>Error: {error}</p>}

      {canManage && (
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px' }}>
            {showForm ? 'Cancel' : 'New Announcement'}
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          border: '1px solid rgba(255,255,255,0.08)', padding: '20px', marginBottom: '20px', borderRadius: '8px'
        }}>
          <h2>{editingId ? 'Edit Announcement' : 'New Announcement'}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: 'rgba(255,255,255,0.5)' }}>Message *</label>
              <textarea name="message" value={formData.message}
                onChange={handleInputChange} required rows="3"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.5)' }}>Priority</label>
              <select name="priority" value={formData.priority}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.5)' }}>Expires At (optional)</label>
              <input type="datetime-local" name="expiresAt" value={formData.expiresAt}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
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
      ) : announcements.length === 0 ? (
        <p>No announcements.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {announcements.map(a => (
            <div key={a.id} style={{
              border: `2px solid ${PRIORITY_COLORS[a.priority] || 'rgba(255,255,255,0.08)'}`,
              borderRadius: '8px', padding: '16px',
              opacity: a.active ? 1 : 0.5,
              backgroundColor: a.active ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.04)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: '4px',
                    fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase',
                    backgroundColor: PRIORITY_COLORS[a.priority],
                    color: PRIORITY_TEXT_COLORS[a.priority] || 'rgba(255,255,255,0.8)',
                    marginBottom: '8px'
                  }}>
                    {a.priority}
                  </div>
                  <p style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>{a.message}</p>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                    Created: {formatDate(a.createdAt)}
                    {a.expiresAt && <> &middot; Expires: {formatDate(a.expiresAt)}</>}
                    {!a.active && <span style={{ color: '#ff6b6b' }}> &middot; Deactivated</span>}
                  </div>
                </div>
                {canManage && (
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                    <button onClick={() => handleToggleActive(a)} style={{
                      padding: '4px 10px', cursor: 'pointer', fontSize: '12px',
                      backgroundColor: a.active ? 'rgba(220,53,69,0.25)' : 'rgba(40,167,69,0.25)',
                      color: a.active ? '#ff6b6b' : 'green', border: 'none', borderRadius: '4px',
                    }}>
                      {a.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleEdit(a)} style={{ padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(a.id)} style={{
                      padding: '4px 10px', cursor: 'pointer', fontSize: '12px', color: '#ff6b6b'
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
