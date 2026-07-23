import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMenuItems } from '../context/MenuItemContext';
import { useRestaurants } from '../context/RestaurantContext';
import SearchBar from '../components/SearchBar';

const DEFAULT_CATEGORIES = ['General', 'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish', 'Soup', 'Salad'];

export default function MenuItemsPage() {
  const {
    menuItems, generalMenuItems, categories, loading, error,
    fetchGeneralMenu, fetchMenuItemsByRestaurant,
    fetchCategories, importGeneralMenu, createMenuItem,
    updateMenuItem, toggleMenuItemAvailability, deleteMenuItem
  } = useMenuItems();
  const { restaurants, selectedRestaurantId, selectedRestaurant, setSelectedRestaurantId } = useRestaurants();

  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...categories])];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [searchedItems, setSearchedItems] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'General',
    itemNumber: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchMenuItemsByRestaurant(selectedRestaurantId);
      fetchCategories(selectedRestaurantId);
    } else {
      fetchGeneralMenu();
    }
  }, [selectedRestaurantId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, price: parseFloat(formData.price), itemNumber: formData.itemNumber };
      if (formData.category === '__new__') payload.category = newCategory;
      if (selectedRestaurantId) {
        payload.restaurantId = selectedRestaurantId;
      } else {
        payload.isGeneral = true;
      }
      if (editingId) {
        await updateMenuItem(editingId, payload);
      } else {
        await createMenuItem(payload);
      }
      resetForm();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      itemNumber: item.itemNumber || '',
      imageUrl: item.imageUrl || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteMenuItem(id);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await toggleMenuItemAvailability(id);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleImport = async () => {
    try {
      await importGeneralMenu(selectedRestaurantId);
      alert('General menu imported successfully');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'General',
      itemNumber: '',
      imageUrl: '',
    });
  };

  const displayedItems = selectedRestaurantId ? menuItems : generalMenuItems;
  const filteredItems = filterCategory
    ? displayedItems.filter(item => item.category === filterCategory)
    : displayedItems;
  const displayItems = searchActive ? searchedItems : filteredItems;

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>
        {selectedRestaurantId
          ? `Menu Items — ${selectedRestaurant?.name}`
          : 'General Menu Items'}
      </h1>
      {selectedRestaurantId && (
        <Link to={`/restaurants/${selectedRestaurantId}`} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '12px' }}>&larr; Back to Restaurant</Link>
      )}

      {error && <p style={{ color: '#ff6b6b' }}>Error: {error}</p>}

      <SearchBar
        items={filteredItems}
        fields={['name', 'description', 'category', 'itemNumber']}
        weights={{ name: 3, description: 1, category: 2, itemNumber: 2 }}
        placeholder="Search by name, category, item number..."
        onResults={(results, q) => {
          setSearchedItems(results);
          setSearchActive(q.length > 0);
        }}
      />

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px' }}>
          {showForm ? 'Cancel' : 'Add Menu Item'}
        </button>

        <select
          value={selectedRestaurantId}
          onChange={(e) => setSelectedRestaurantId(e.target.value)}
          style={{ padding: '8px', minWidth: '200px' }}
        >
          <option value="">General Menu (shared)</option>
          {restaurants.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        {selectedRestaurantId && (
          <button onClick={handleImport} style={{ padding: '8px', backgroundColor: 'rgba(40,167,69,0.3)', color: '#28a745', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px' }}>
            Import General Menu
          </button>
        )}

        {selectedRestaurantId && (
          <Link to="/categories" style={{ padding: '8px 14px', backgroundColor: 'rgba(111,66,193,0.2)', color: '#b794f4', textDecoration: 'none', borderRadius: '4px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.08)' }}>
            Manage Categories
          </Link>
        )}

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '8px' }}
        >
          <option value="">All Categories</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {filterCategory && (
          <button onClick={() => setFilterCategory('')} style={{ padding: '8px' }}>
            Clear Filter
          </button>
        )}

        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
          {selectedRestaurantId ? 'Restaurant menu' : 'General menu (shared across all restaurants)'}
        </span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          border: '1px solid rgba(255,255,255,0.08)', padding: '20px', marginBottom: '20px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)'
        }}>
          <h2>{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '0.5px' }}>Name *</label>
              <input type="text" name="name" value={formData.name}
                onChange={handleInputChange} placeholder="e.g., Margherita Pizza" required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '0.5px' }}>Category *</label>
              {formData.category === '__new__' ? (
                <input type="text" value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name" required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
              ) : (
                  <select name="category" value={formData.category}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (e.target.value !== '__new__') setNewCategory('');
                    }} required
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                    <option value="">Select category...</option>
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__new__">+ Add new category...</option>
                  </select>
              )}
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '0.5px' }}>Price *</label>
              <input type="number" name="price" value={formData.price}
                onChange={handleInputChange} step="0.01" min="0" required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '0.5px' }}>Item Number</label>
              <input type="text" name="itemNumber" value={formData.itemNumber}
                onChange={handleInputChange} placeholder="e.g., M-001"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '0.5px' }}>Image URL</label>
              <input type="text" name="imageUrl" value={formData.imageUrl}
                onChange={handleInputChange} placeholder="https://example.com/image.jpg"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '25px' }}>
              {!selectedRestaurantId && (
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                  This item will be added to the General Menu (shared across all restaurants)
                </span>
              )}
              {selectedRestaurantId && (
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                  This item will be added to {selectedRestaurant?.name}
                </span>
              )}
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '0.5px' }}>Description</label>
            <textarea name="description" value={formData.description}
              onChange={handleInputChange} placeholder="Optional description..." rows="3"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
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
      ) : displayItems.length === 0 ? (
        <p>No menu items found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Item #</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Name</th>
              {!selectedRestaurantId && (
                <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Restaurant</th>
              )}
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Price</th>
              {selectedRestaurantId && (
                <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Source</th>
              )}
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item) => (
              <tr key={item.id} style={{ opacity: item.isAvailable ? 1 : 0.5 }}>
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
                  {item.itemNumber || '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div><strong>{item.name}</strong></div>
                  {item.description && (
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{item.description}</div>
                  )}
                </td>
                {!selectedRestaurantId && (
                  <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {item.isGeneral ? 'General' : (item.restaurantId || '-')}
                  </td>
                )}
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '4px', fontSize: '12px' }}>
                    {item.category}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>€{item.price.toFixed(2)}</td>
                {selectedRestaurantId && (
                  <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                      backgroundColor: item.isGeneral ? 'rgba(0,123,255,0.2)' : (item.source === 'general' ? 'rgba(23,162,184,0.2)' : 'rgba(40,167,69,0.2)'),
                      color: item.isGeneral ? '#6cb2eb' : (item.source === 'general' ? '#5bc0de' : '#28a745')
                    }}>
                      {item.isGeneral ? 'General' : (item.source === 'general' ? 'Imported' : 'Custom')}
                    </span>
                  </td>
                )}
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={() => handleToggleAvailability(item.id)}
                    style={{
                      padding: '4px 8px', borderRadius: '4px',
                      backgroundColor: item.isAvailable ? 'rgba(40,167,69,0.3)' : 'rgba(220,53,69,0.3)',
                      color: item.isAvailable ? '#28a745' : '#dc3545', border: 'none', cursor: 'pointer'
                    }}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                </td>
                <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={() => handleEdit(item)} style={{ marginRight: '10px' }}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} style={{ color: '#ff6b6b' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
