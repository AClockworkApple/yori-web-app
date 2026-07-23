import { useState, useEffect } from 'react';
import { useUsers } from '../context/UserContext';
import { useRestaurants } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';

const CREATE_ROLE_OPTIONS = ['MANAGER', 'STAFF'];
const FILTER_ROLE_OPTIONS = ['OWNER', 'MANAGER', 'STAFF', 'CUSTOMER'];

export default function UsersPage() {
  const { users, loading, error, fetchUsers, fetchUsersByRole, createUser, updateUser, deleteUser } = useUsers();
  const { restaurants, fetchRestaurants } = useRestaurants();
  const { user: currentUser, hasRole } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState([]);
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
      OWNER: 'rgba(220,53,69,0.25)',
      MANAGER: 'rgba(23,162,184,0.25)',
      STAFF: 'rgba(40,167,69,0.25)',
      CUSTOMER: 'rgba(108,117,125,0.25)',
    };
    return colors[role] || 'rgba(108,117,125,0.25)';
  };

  const getRoleTextColor = (role) => {
    const colors = {
      OWNER: '#ff6b6b',
      MANAGER: '#17a2b8',
      STAFF: 'green',
      CUSTOMER: 'rgba(255,255,255,0.5)',
    };
    return colors[role] || 'rgba(255,255,255,0.5)';
  };

  const displayUsers = searchActive ? searchedUsers : users;

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>User Management</h1>

      {error && <p style={{ color: '#ff6b6b' }}>Error: {error}</p>}

      <SearchBar
        items={users}
        fields={['name', 'email', 'role']}
        weights={{ name: 3, email: 2, role: 1 }}
        placeholder="Search by name, email, role..."
        onResults={(results, q) => {
          setSearchedUsers(results);
          setSearchActive(q.length > 0);
        }}
      />

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
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px'
        }}>
          <h2>{editingId ? 'Edit User' : 'Create New User'}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.5)' }}>Email *</label>
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
              <label style={{ color: 'rgba(255,255,255,0.5)' }}>Name *</label>
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
                <label style={{ color: 'rgba(255,255,255,0.5)' }}>Password *</label>
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
              <label style={{ color: 'rgba(255,255,255,0.5)' }}>Role *</label>
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
              <label style={{ color: 'rgba(255,255,255,0.5)' }}>Restaurant</label>
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
            backgroundColor: 'rgba(255,215,0,0.15)',
            color: '#ffd700',
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
      ) : displayUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Restaurant</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayUsers.map((user) => (
              <tr key={user.id}>
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <strong>{user.name}</strong>
                </td>
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>{user.email}</td>
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: getRoleColor(user.role),
                    color: getRoleTextColor(user.role),
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {user.restaurantId
                    ? (restaurants.find(r => r.id === user.restaurantId)?.name || user.restaurantId)
                    : '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {hasRole('OWNER') && (
                    <>
                      <button onClick={() => handleEdit(user)} style={{ marginRight: '5px' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(user.id)} style={{ color: '#ff6b6b' }}>
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
