import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRestaurants } from '../context/RestaurantContext';
import { useMenuItems } from '../context/MenuItemContext';

const DEFAULT_CATEGORIES = ['General', 'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish', 'Soup', 'Salad'];

export default function CategoriesPage() {
  const { selectedRestaurantId, selectedRestaurant } = useRestaurants();
  const { categories, loading, error, fetchCategories, deleteCategory, renameCategory } = useMenuItems();
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState('');

  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...categories])];

  useEffect(() => {
    if (selectedRestaurantId) fetchCategories(selectedRestaurantId);
  }, [selectedRestaurantId]);

  const handleDelete = async (cat) => {
    if (confirm(`Delete category "${cat}"? Items will be moved to "General".`)) {
      try {
        await deleteCategory(selectedRestaurantId, cat);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleRename = async (cat) => {
    if (!newName.trim()) return;
    if (newName.trim() === cat) { setRenaming(null); return; }
    try {
      await renameCategory(selectedRestaurantId, cat, newName.trim());
      setRenaming(null);
      setNewName('');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    if (allCategories.includes(createName.trim())) {
      alert('Category already exists.');
      return;
    }
    if (!confirm(`Create category "${createName.trim()}"?`)) return;
    setCreateName('');
    setCreating(false);
  };

  if (!selectedRestaurantId) {
    return (
      <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Categories</h1>
        <p>Select a restaurant from the navigation bar to manage categories.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Categories — {selectedRestaurant?.name}</h1>
      <Link to={`/restaurants/${selectedRestaurantId}`} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '12px' }}>&larr; Back to Restaurant</Link>

      {error && <p style={{ color: '#ff6b6b' }}>Error: {error}</p>}

      <button onClick={() => setCreating(!creating)} style={{ padding: '10px 20px', marginBottom: '20px' }}>
        {creating ? 'Cancel' : 'Add Category'}
      </button>

      {creating && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
          <input type="text" value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="New category name" required
            style={{ padding: '8px', flex: 1, maxWidth: '300px' }} />
          <button onClick={handleCreate} style={{ padding: '8px 16px', backgroundColor: 'rgba(255,215,0,0.15)', color: '#ffd700', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : allCategories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Source</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allCategories.map(cat => {
              const isDefault = DEFAULT_CATEGORIES.includes(cat);
              return (
                <tr key={cat}>
                  <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {renaming === cat ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input type="text" value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          style={{ padding: '6px', width: '200px' }} />
                        <button onClick={() => handleRename(cat)} style={{ padding: '4px 10px', backgroundColor: 'rgba(40,167,69,0.25)', color: 'green', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => { setRenaming(null); setNewName(''); }} style={{ padding: '4px 10px', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    ) : (
                      <strong>{cat}</strong>
                    )}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                      backgroundColor: isDefault ? 'rgba(255,215,0,0.15)' : 'rgba(40,167,69,0.25)', color: isDefault ? '#ffd700' : 'green'
                    }}>
                      {isDefault ? 'Default' : 'Custom'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {renaming !== cat && (
                      <>
                        <button onClick={() => { setRenaming(cat); setNewName(cat); }} style={{ marginRight: '10px' }}>Rename</button>
                        <button onClick={() => handleDelete(cat)} style={{ color: '#ff6b6b' }}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
