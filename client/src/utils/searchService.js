function normalize(v) {
  if (v == null) return '';
  return String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function simpleSubstring(items, query, fields) {
  const q = normalize(query);
  if (!q) return items;
  return items.filter(item => fields.some(f => normalize(item[f]).includes(q)));
}

function tokenWeighted(items, query, fields, weights = {}) {
  const q = normalize(query);
  if (!q) return items;
  const tokens = q.split(/\s+/).filter(Boolean);

  return items.map(item => {
    let score = 0;
    for (const token of tokens) {
      for (const field of fields) {
        const val = normalize(item[field]);
        const w = weights[field] || 1;
        if (val === token) score += 5 * w;
        else if (val.startsWith(token)) score += 3 * w;
        else if (val.includes(token)) score += 1 * w;
      }
    }
    return { item, score };
  })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(r => r.item);
}

function buildTrigramIndex(items, fields) {
  const index = new Map();
  items.forEach((item, idx) => {
    const text = fields.map(f => normalize(item[f])).join(' ');
    const trigrams = new Set();
    for (let i = 0; i < text.length - 2; i++) {
      trigrams.add(text.slice(i, i + 3));
    }
    for (const tri of trigrams) {
      if (!index.has(tri)) index.set(tri, []);
      index.get(tri).push(idx);
    }
  });
  return { index, items };
}

function fuzzyIndexed(items, query, fields) {
  const q = normalize(query);
  if (!q) return items;

  const { index, items: stored } = buildTrigramIndex(items, fields);
  const queryTrigrams = new Set();
  for (let i = 0; i < q.length - 2; i++) {
    queryTrigrams.add(q.slice(i, i + 3));
  }

  const scores = new Map();
  for (const tri of queryTrigrams) {
    const matches = index.get(tri) || [];
    for (const idx of matches) {
      scores.set(idx, (scores.get(idx) || 0) + 1);
    }
  }

  const threshold = Math.max(1, Math.floor(queryTrigrams.size * 0.4));
  return [...scores.entries()]
    .filter(([, score]) => score >= threshold)
    .sort((a, b) => b[1] - a[1])
    .map(([idx]) => stored[idx]);
}

export function hybridSearch(items, query, fields, weights = {}) {
  if (!query || !items || items.length === 0) return items || [];
  const count = items.length;

  if (count < 50) {
    return simpleSubstring(items, query, fields);
  }

  if (count <= 500) {
    return tokenWeighted(items, query, fields, weights);
  }

  return fuzzyIndexed(items, query, fields);
}
