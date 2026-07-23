import { useState, useEffect, useRef, useMemo } from 'react';
import { hybridSearch } from '../utils/searchService';

export default function SearchBar({ items, fields, weights, placeholder, onResults, minQueryLength = 1, debounceMs = 200 }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(items);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const searched = hybridSearch(items, query, fields, weights);
      setResults(searched);
      if (onResults) onResults(searched, query);
    }, debounceMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, items, fields, weights, debounceMs]);

  useEffect(() => {
    setResults(items);
  }, [items]);

  const count = items?.length || 0;
  const algo = count < 50 ? 'simple' : count <= 500 ? 'token' : 'fuzzy';

  return (
    <div style={{ position: 'relative', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || `Search ${fields?.join(', ') || '...'}`}
          style={{
            flex: 1, padding: '10px 14px', fontSize: '14px',
            borderRadius: '4px', outline: 'none',
          }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'rgba(255,255,255,0.3)' }}>
            &times;
          </button>
        )}
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
        {query ? `${results.length} / ${count} results` : `${count} items`}
        <span style={{ marginLeft: '8px' }}>({algo})</span>
      </div>
    </div>
  );
}
