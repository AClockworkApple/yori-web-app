const RESTAURANT_KEYWORDS = [
  'menu', 'dish', 'dishes', 'ingredient', 'recipe', 'order', 'orders',
  'booking', 'bookings', 'reservation', 'reservations', 'table', 'tables',
  'customer', 'customers', 'guest', 'guests', 'party', 'party size',
  'bill', 'check', 'receipt', 'payment', 'pay', 'cash', 'card', 'tip', 'tips',
  'restaurant', 'restaurants', 'kitchen', 'chef', 'cook', 'waiter', 'waitress',
  'staff', 'employee', 'shift', 'schedule', 'supplier', 'inventory',
  'revenue', 'report', 'daily report', 'sales', 'tax', 'vat', 'service fee',
  'discount', 'promotion', 'special', 'allergy', 'allergies', 'dietary',
  'price', 'pricing', 'cost', 'opening hours', 'closing time', 'break time',
  'capacity', 'seat', 'seats', 'available', 'occupied', 'cleaning',
  'maintenance', 'status', 'walk-in', 'walk in', 'waitlist', 'wait list',
  'queue', 'wait time', 'no-show', 'no show', 'cancellation', 'confirm',
  'reminder', 'email', 'notification', 'announcement', 'category', 'categories',
  'receipt', 'reconciliation', 'cash', 'drawer', 'variance',
  'opening balance', 'declared', 'expected',
  'staff schedule', 'break', 'lunch', 'dinner', 'breakfast',
  'hygiene', 'cleanliness', 'sanitation',
  'online ordering', 'delivery', 'takeaway', 'takeout', 'dine-in',
  'loyalty', 'rewards', 'feedback', 'review', 'rating',
];

const BLOCKED_PATTERNS = [
  /how\s*(to|do\s+I)\s*(hack|exploit|crack|bypass|cheat)/i,
  /write\s*(a|an|some)\s*(poem|story|essay|code|program|function|script)/i,
  /what\s+is\s+the\s+(meaning|purpose)\s+of\s+(life|universe)/i,
  /how\s+(to\s+)?(make|create)\s+(a\s+)?(bomb|weapon|drug|poison)/i,
  /tell\s+me\s+(a\s+)?joke/i,
  /generate\s+(an\s+)?(image|picture|video|audio|music)/i,
  /solve\s+(this\s+)?(math|equation|calculus|physics)/i,
  /who\s+won\s+(the\s+)?(election|war|match|game|tournament)/i,
  /what\s+is\s+your\s+(name|purpose|mission|creator)/i,
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions|prompts|directions)/i,
  /forget\s+(all\s+)?(previous|everything)/i,
  /you\s+are\s+(a\s+)?(now|an?)\s+(new|different|better)\s+(AI|assistant|bot|persona)/i,
  /act\s+as\s+(a\s+)?(developer|programmer|writer|poet|lawyer|doctor)/i,
  /system\s+(prompt|instruction|message)/i,
  /DAN|do\s+anything\s+now|jailbreak|prompt\s+injection/i,
];

function isRestaurantRelated(query) {
  if (!query || typeof query !== 'string') return { allowed: false, reason: 'Empty or invalid query' };

  const lower = query.toLowerCase();

  const matchedKeyword = RESTAURANT_KEYWORDS.some(kw => lower.includes(kw));
  if (!matchedKeyword) {
    return { allowed: false, reason: 'Query does not appear to be related to restaurant management.' };
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(lower)) {
      return { allowed: false, reason: 'Query contains a restricted topic or pattern.' };
    }
  }

  return { allowed: true, reason: null };
}

module.exports = { isRestaurantRelated, RESTAURANT_KEYWORDS };
