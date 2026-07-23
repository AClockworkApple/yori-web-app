const AiConfig = require('../models/AiConfig');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const RestaurantHour = require('../models/RestaurantHour');
const { isRestaurantRelated } = require('../utils/aiSafeguard');
const { queryProvider } = require('../utils/aiProvider');
const { logAction } = require('../utils/auditLogger');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function buildTestPrompt(restaurantId) {
  const restaurant = await Restaurant.getById(restaurantId);
  if (!restaurant) return null;

  const parts = [];
  parts.push('You are the official AI assistant for Yori, a restaurant chain.');
  parts.push(`\n=== YORI ${restaurant.name.toUpperCase()} (ID: ${restaurant.id}) ===`);
  if (restaurant.address) parts.push(`Address: ${restaurant.address}`);
  if (restaurant.phone) parts.push(`Phone: ${restaurant.phone}`);

  try {
    const hours = await RestaurantHour.getByRestaurant(restaurantId);
    if (hours.length > 0) {
      parts.push('Hours:');
      const sorted = hours.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      for (const h of sorted) {
        const dayName = DAY_NAMES[h.dayOfWeek] || `Day ${h.dayOfWeek}`;
        let line = `  ${dayName}: ${h.openTime} - ${h.closeTime}`;
        if (h.breakStart && h.breakEnd) line += ` (break ${h.breakStart}-${h.breakEnd})`;
        parts.push(line);
      }
    }
  } catch { /* ignore */ }

  try {
    const items = await MenuItem.getRestaurantMenu(restaurantId);
    const available = items.filter(i => i.isAvailable !== false);
    if (available.length > 0) {
      parts.push(`Menu (${available.length} items):`);
      const byCategory = {};
      for (const item of available) {
        const cat = item.category || 'General';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(item);
      }
      for (const [category, catItems] of Object.entries(byCategory)) {
        for (const item of catItems) {
          const price = item.price != null ? item.price.toFixed(2) : 'N/A';
          parts.push(`  [${category}] ${item.name} - $${price}${item.description ? ' | ' + item.description : ''}`);
        }
      }
    } else {
      parts.push('Menu: No menu items available.');
    }
  } catch { /* ignore */ }

  parts.push('\n=== INSTRUCTIONS ===');
  parts.push('You are Yori\'s AI assistant. Answer ONLY using the Yori restaurant data above.');
  parts.push('CRITICAL: When asked about food, recommendations, or "what\'s good", you MUST list specific dish names with prices from the YORI menu above. Never give generic food advice. You work FOR Yori.');
  parts.push('Always mention the Yori location. Assume German timezone (Europe/Berlin).');
  parts.push('Be warm and helpful. Decline unrelated topics politely.');

  return parts.join('\n');
}

const aiConfigController = {
  async getProviders(req, res) {
    res.json(AiConfig.getProviders());
  },

  async getConfigs(req, res) {
    try {
      const { restaurantId } = req.params;
      const configs = await AiConfig.getByRestaurant(restaurantId);
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getActiveConfig(req, res) {
    try {
      const { restaurantId } = req.params;
      const config = await AiConfig.getActiveByRestaurant(restaurantId);
      if (!config) {
        return res.status(404).json({ error: 'No active AI configuration found for this restaurant' });
      }
      res.json({
        id: config.id,
        restaurantId: config.restaurantId,
        provider: config.provider,
        isActive: config.isActive,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createConfig(req, res) {
    try {
      const { restaurantId, provider, apiKey: rawApiKey, isActive } = req.body;
      const apiKey = rawApiKey ? rawApiKey.trim() : '';
      if (!restaurantId || !provider || !apiKey) {
        return res.status(400).json({ error: 'restaurantId, provider, and apiKey are required' });
      }
      const validProviders = AiConfig.getProviders();
      if (!validProviders.includes(provider)) {
        return res.status(400).json({ error: `Invalid provider. Valid: ${validProviders.join(', ')}` });
      }
      const config = await AiConfig.create({ restaurantId, provider, apiKey, isActive });
      await logAction(req.user, 'CREATE', 'AiConfig', config.id, { provider }, restaurantId);
      res.status(201).json(config);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateConfig(req, res) {
    try {
      const { id } = req.params;
      const { provider, apiKey: rawApiKey, isActive } = req.body;
      const apiKey = rawApiKey ? rawApiKey.trim() : undefined;
      const updateData = {};
      if (provider) updateData.provider = provider;
      if (apiKey) updateData.apiKey = apiKey;
      if (isActive !== undefined) updateData.isActive = isActive;

      const config = await AiConfig.update(id, updateData);
      if (!config) {
        return res.status(404).json({ error: 'AI config not found' });
      }
      await logAction(req.user, 'UPDATE', 'AiConfig', id, { provider: provider || config.provider }, config.restaurantId);
      res.json({
        id: config.id,
        restaurantId: config.restaurantId,
        provider: config.provider,
        isActive: config.isActive,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteConfig(req, res) {
    try {
      const { id } = req.params;
      await AiConfig.delete(id);
      res.json({ message: 'AI config deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async query(req, res) {
    try {
      const { restaurantId, query } = req.body;
      if (!restaurantId || !query) {
        return res.status(400).json({ error: 'restaurantId and query are required' });
      }

      const safeguard = isRestaurantRelated(query);
      if (!safeguard.allowed) {
        return res.status(400).json({
          error: 'Query blocked by safeguard',
          reason: safeguard.reason,
          blocked: true,
        });
      }

      const config = await AiConfig.getActiveByRestaurant(restaurantId);
      if (!config) {
        return res.status(404).json({ error: 'No active AI configuration found. Please configure an AI provider first.' });
      }

      const systemPrompt = await buildTestPrompt(restaurantId);
      const messages = [
        { role: 'system', content: systemPrompt || 'You are a helpful restaurant assistant.' },
        { role: 'user', content: query },
      ];
      const response = await queryProvider(config.provider, config.apiKey, messages);
      res.json({ response, provider: config.provider });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = aiConfigController;
