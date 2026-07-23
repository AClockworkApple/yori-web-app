import { useState, useEffect } from 'react';
import { aiConfigService } from '../services/aiConfigService';
import { useRestaurants } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';

const PROVIDER_LABELS = {
  gemini: 'Google Gemini',
  openai: 'OpenAI',
  claude: 'Anthropic Claude',
  deepseek: 'DeepSeek',
  mistral: 'Mistral AI',
  cohere: 'Cohere',
};

export default function AiConfigPage() {
  const { selectedRestaurantId, selectedRestaurant } = useRestaurants();
  const { hasRole } = useAuth();
  const canEdit = hasRole('OWNER', 'MANAGER');

  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [configs, setConfigs] = useState([]);
  const [activeConfig, setActiveConfig] = useState(null);

  const [queryInput, setQueryInput] = useState('');
  const [queryResult, setQueryResult] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState(null);

  useEffect(() => {
    aiConfigService.getProviders()
      .then(setProviders)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedRestaurantId) return;
    aiConfigService.getConfigs(selectedRestaurantId)
      .then(setConfigs)
      .catch(() => {});
    aiConfigService.getActiveConfig(selectedRestaurantId)
      .then(setActiveConfig)
      .catch(() => setActiveConfig(null));
  }, [selectedRestaurantId]);

  const handleSave = async () => {
    if (!selectedProvider || !apiKey || !selectedRestaurantId) {
      setError('Please select a provider and enter an API key');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const existingConfig = configs.find(c => c.provider === selectedProvider);
      if (existingConfig) {
        await aiConfigService.updateConfig(existingConfig.id, {
          apiKey,
          isActive: true,
        });
        setSuccess(`API key updated for ${PROVIDER_LABELS[selectedProvider] || selectedProvider}`);
      } else {
        await aiConfigService.createConfig({
          restaurantId: selectedRestaurantId,
          provider: selectedProvider,
          apiKey,
          isActive: true,
        });
        setSuccess(`API key saved for ${PROVIDER_LABELS[selectedProvider] || selectedProvider}`);
      }
      const updated = await aiConfigService.getConfigs(selectedRestaurantId);
      setConfigs(updated);
      const active = await aiConfigService.getActiveConfig(selectedRestaurantId);
      setActiveConfig(active);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (configId) => {
    setError(null);
    setSuccess(null);
    try {
      await aiConfigService.updateConfig(configId, { isActive: true });
      const updated = await aiConfigService.getConfigs(selectedRestaurantId);
      setConfigs(updated);
      const active = await aiConfigService.getActiveConfig(selectedRestaurantId);
      setActiveConfig(active);
      setSuccess('AI provider activated');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (configId) => {
    setError(null);
    setSuccess(null);
    try {
      await aiConfigService.deleteConfig(configId);
      const updated = await aiConfigService.getConfigs(selectedRestaurantId);
      setConfigs(updated);
      const active = await aiConfigService.getActiveConfig(selectedRestaurantId);
      setActiveConfig(active);
      setSuccess('AI configuration deleted');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuery = async () => {
    if (!queryInput.trim() || !selectedRestaurantId) return;
    setQueryLoading(true);
    setQueryError(null);
    setQueryResult('');
    try {
      const result = await aiConfigService.query(selectedRestaurantId, queryInput);
      setQueryResult(result.response);
    } catch (err) {
      setQueryError(err.message);
    } finally {
      setQueryLoading(false);
    }
  };

  if (!selectedRestaurantId) {
    return (
      <div style={{ padding: '24px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h1>AI Configuration</h1>
        <p>Select a restaurant from the navigation bar to configure AI.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 40px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>AI Configuration {selectedRestaurant?.name ? `— ${selectedRestaurant.name}` : ''}</h1>

      {error && <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: 'rgba(220,53,69,0.15)', color: '#ff6b6b', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: 'rgba(40,167,69,0.15)', color: 'green', borderRadius: '4px' }}>{success}</div>}

      {activeConfig && (
        <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: 'rgba(40,167,69,0.15)', color: 'green', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 'bold' }}>Active:</span>
          <span>{PROVIDER_LABELS[activeConfig.provider] || activeConfig.provider}</span>
        </div>
      )}

      {canEdit && (
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '20px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Add / Update API Key</h3>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>AI Provider</label>
            <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}>
              <option value="">-- Select Provider --</option>
              {providers.map(p => (
                <option key={p} value={p}>{PROVIDER_LABELS[p] || p}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>API Key</label>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..." style={{ width: '100%', padding: '8px', fontSize: '14px', fontFamily: 'monospace', boxSizing: 'border-box' }} />
          </div>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '10px 24px', backgroundColor: 'rgba(255,215,0,0.15)', color: '#ffd700',
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
          }}>
            {saving ? 'Saving...' : 'Save API Key'}
          </button>
        </div>
      )}

      {configs.length > 0 && (
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '20px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Saved Configurations</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(255,255,255,0.04)', textAlign: 'left' }}>
                  <th style={{ padding: '8px', borderBottom: '2px solid rgba(255,255,255,0.08)' }}>Provider</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid rgba(255,255,255,0.08)' }}>Status</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid rgba(255,255,255,0.08)' }}>Created</th>
                  {canEdit && <th style={{ padding: '8px', borderBottom: '2px solid rgba(255,255,255,0.08)' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {configs.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{PROVIDER_LABELS[c.provider] || c.provider}</td>
                    <td style={{ padding: '8px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: c.isActive ? 'rgba(40,167,69,0.25)' : 'rgba(108,117,125,0.25)', color: c.isActive ? 'green' : 'rgba(255,255,255,0.5)',
                      }}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '8px', color: 'rgba(255,255,255,0.35)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    {canEdit && (
                      <td style={{ padding: '8px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {!c.isActive && (
                            <button onClick={() => handleActivate(c.id)} style={{
                              padding: '4px 10px', backgroundColor: 'rgba(40,167,69,0.25)', color: 'green',
                              border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                            }}>Activate</button>
                          )}
                          <button onClick={() => handleDelete(c.id)} style={{
                            padding: '4px 10px', backgroundColor: 'rgba(220,53,69,0.25)', color: '#ff6b6b',
                            border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                          }}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeConfig && (
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Test AI Query</h3>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
              Ask a restaurant-related question
            </label>
            <textarea value={queryInput} onChange={(e) => setQueryInput(e.target.value)}
              placeholder="e.g. What menu items are popular today?"
              style={{ width: '100%', padding: '8px', fontSize: '14px', boxSizing: 'border-box', minHeight: '80px' }} />
          </div>
          <button onClick={handleQuery} disabled={queryLoading || !queryInput.trim()} style={{
            padding: '10px 24px', backgroundColor: 'rgba(23,162,184,0.25)', color: '#17a2b8',
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
          }}>
            {queryLoading ? 'Thinking...' : 'Send Query'}
          </button>

          {queryError && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(255,193,7,0.15)', color: '#ffc107', borderRadius: '4px' }}>
              {queryError}
            </div>
          )}

          {queryResult && (
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '4px', whiteSpace: 'pre-wrap', fontSize: '14px' }}>
              <strong>Response:</strong>
              <p style={{ margin: '8px 0 0 0', lineHeight: '1.6' }}>{queryResult}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
