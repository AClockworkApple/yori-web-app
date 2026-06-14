import { useState, useEffect } from 'react';
import { useUsers } from '../context/UserContext';
import { useRestaurants } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';

const CREATE_ROLE_OPTIONS = ['MANAGER', 'STAFF'];
const FILTER_ROLE_OPTIONS = ['OWNER', 'MANAGER', 'STAFF', 'CUSTOMER'];

export default function UsersPage() {
  const { users, loading, error, fetchUsers, fetchUsersByRole, createUser, updateUser, deleteUser } = useUsers();
  const { restaurants, fetchRestaurants } = useRestaurants();
  const { user: currentUser, hasRole } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'STAFF',
    restaurantId: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        restaurantId: formData.restaurantId || null,
      };
      if (editingId) {
        await updateUser(editingId, payload);
      } else {
        payload.password = formData.password;
        await createUser(payload);
      }
      resetForm();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantId || '',
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleFilterRole = (role) => {
    setFilterRole(role);
    if (role) {
      fetchUsersByRole(role);
    } else {
      fetchUsers();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'STAFF',
      restaurantId: '',
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      OWNER: '#dc3545',
      MANAGER: '#17a2b8',
      STAFF: '#28a745',
      CUSTOMER: '#6c757d',
    };
    return colors[role] || '#6c757d';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>User Management</h1>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        {hasRole('OWNER') && (
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px' }}>
            {showForm ? 'Cancel' : 'Add User'}
          </button>
        )}
        <select
          value={filterRole}
          onChange={(e) => handleFilterRole(e.target.value)}
          style={{ padding: '8px' }}
        >
          <option value="">All Roles</option>
          {FILTER_ROLE_OPTIONS.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          border: '1px solid #ccc',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px'
        }}>
          <h2>{editingId ? 'Edit User' : 'Create New User'}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

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

            {!editingId && (
              <div>
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
            )}

            <div>
              <label>Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                {CREATE_ROLE_OPTIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Restaurant</label>
              <select
                name="restaurantId"
                value={formData.restaurantId}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">-- Select Restaurant --</option>
                {restaurants.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
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
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Restaurant</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <strong>{user.name}</strong>
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{user.email}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: getRoleColor(user.role),
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  {user.restaurantId
                    ? (restaurants.find(r => r.id === user.restaurantId)?.name || user.restaurantId)
                    : '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  {hasRole('OWNER') && (
                    <>
                      <button onClick={() => handleEdit(user)} style={{ marginRight: '5px' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(user.id)} style={{ color: 'red' }}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
