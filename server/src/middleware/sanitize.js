const MAX_STRING_LENGTH = 500;

function sanitizeValue(value, maxLength) {
  if (typeof value === 'string') {
    value = value.trim();
    if (value.length > maxLength) {
      value = value.substring(0, maxLength);
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(v => sanitizeValue(v, maxLength));
  }
  if (value && typeof value === 'object') {
    return sanitizeObject(value, maxLength);
  }
  return value;
}

function sanitizeObject(obj, maxLength) {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'tableIds' || key === 'tables') {
      sanitized[key] = value;
      continue;
    }
    sanitized[key] = sanitizeValue(value, maxLength);
  }
  return sanitized;
}

function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    const maxLen = req.originalUrl.startsWith('/api/auth') ? 200 : MAX_STRING_LENGTH;
    req.body = sanitizeObject(req.body, maxLen);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query, 200);
  }
  next();
}

module.exports = sanitizeInput;
