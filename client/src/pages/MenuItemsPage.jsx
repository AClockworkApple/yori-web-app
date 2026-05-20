import { useState, useEffect } from 'react';
import { useMenuItems } from '../context/MenuItemContext';

export default function MenuItemsPage() {
  const { 
    menuItems, generalMenuItems, categories, loading, error, 
    fetchMenuItems, fetchGeneralMenu, fetchMenuItemsByRestaurant, 
    fetchCategories, importGeneralMenu, createMenuItem, 
    updateMenuItem, toggleMenuItemAvailability, deleteMenuItem 
  } = useMenuItems();
  
  const [viewMode, setViewMode] = useState('restaurant');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterRestaurant, setFilterRestaurant] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  const [formData, setFormData] = useState({
    restaurantId: '',
    name: '',
    description: '',
    price: 0,
    category: 'General',
    isGeneral: false,
  });

  useEffect(() => {
    if (viewMode === 'general') {
      fetchGeneralMenu();
    } else if (filterRestaurant) {
      fetchMenuItemsByRestaurant(filterRestaurant);
      fetchCategories(filterRestaurant);
    } else {
      fetchMenuItems();
    }
  }, [viewMode, filterRestaurant]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMenuItem(editingId, formData);
      } else {
        await createMenuItem(formData);
      }
      resetForm();
      if (viewMode === 'general') {
        fetchGeneralMenu();
      } else {
        fetchMenuItemsByRestaurant(filterRestaurant);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      restaurantId: item.restaurantId || '',
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      isGeneral: item.isGeneral || false,
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
    if (!filterRestaurant) {
      alert('Please enter a Restaurant ID to import menu items');
      return;
    }
    try {
      await importGeneralMenu(filterRestaurant);
      alert('General menu imported successfully');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      restaurantId: '',
      name: '',
      description: '',
      price: 0,
      category: 'General',
      isGeneral: false,
    });
  };

  const displayedItems = viewMode === 'general' ? generalMenuItems : menuItems;
  const filteredItems = filterCategory
    ? displayedItems.filter(item => item.category === filterCategory)
    : displayedItems;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Menu Items Management</h1>
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px' }}>
          {showForm ? 'Cancel' : 'Add Menu Item'}
        </button>
        
        <div style={{ borderLeft: '1px solid #ccc', paddingLeft: '10px', marginLeft: '10px' }}>
          <label style={{ marginRight: '10px' }}>
            <input
              type="radio"
              name="viewMode"
              value="general"
              checked={viewMode === 'general'}
              onChange={() => setViewMode('general')}
            />
            General Menu
          </label>
          <label style={{ marginRight: '10px' }}>
            <input
              type="radio"
              name="viewMode"
              value="restaurant"
              checked={viewMode === 'restaurant'}
              onChange={() => setViewMode('restaurant')}
            />
            Restaurant Menu
          </label>
        </div>

        {viewMode === 'restaurant' && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Filter by Restaurant ID"
              value={filterRestaurant}
              onChange={(e) => setFilterRestaurant(e.target.value)}
              style={{ padding: '8px', width: '200px' }}
            />
            <button onClick={handleImport} style={{ padding: '8px', backgroundColor: '#28a745', color: 'white' }}>
              Import General Menu
            </button>
          </div>
        )}

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '8px' }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {filterCategory && (
          <button onClick={() => setFilterCategory('')} style={{ padding: '8px' }}>
            Clear Filter
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ 
          border: '1px solid #ccc', 
          padding: '20px', 
          marginBottom: '20px',
          borderRadius: '8px'
        }}>
          <h2>{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {viewMode === 'restaurant' ? (
              <div>
                <label>Restaurant ID *</label>
                <input
                  type="text"
                  name="restaurantId"
                  value={formData.restaurantId}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
            ) : (
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="isGeneral"
                  checked={formData.isGeneral}
                  onChange={handleInputChange}
                  style={{ marginRight: '10px' }}
                />
                <label>Add to General Menu</label>
              </div>
            )}

            <div>
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Margherita Pizza"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., Main Course"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description..."
                rows="3"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
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
      ) : filteredItems.length === 0 ? (
        <p>No menu items found.</p>
      ) : (
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          marginTop: '20px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Restaurant</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Price</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Source</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} style={{ opacity: item.isAvailable ? 1 : 0.5 }}>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <div><strong>{item.name}</strong></div>
                  {item.description && (
                    <div style={{ fontSize: '12px', color: '#666' }}>{item.description}</div>
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  {item.isGeneral ? 'General' : (item.restaurantId || '-')}
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <span style={{ 
                    padding: '4px 8px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {item.category}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>${item.price.toFixed(2)}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <span style={{ 
                    padding: '4px 8px',
                    backgroundColor: item.isGeneral ? '#007bff' : (item.source === 'general' ? '#17a2b8' : '#28a745'),
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {item.isGeneral ? 'General' : (item.source === 'general' ? 'Imported' : 'Custom')}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <button
                    onClick={() => handleToggleAvailability(item.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: item.isAvailable ? '#28a745' : '#dc3545',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <button onClick={() => handleEdit(item)} style={{ marginRight: '10px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} style={{ color: 'red' }}>
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