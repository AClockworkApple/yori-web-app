const AiConfig = require('../models/AiConfig');
const { isRestaurantRelated } = require('../utils/aiSafeguard');
const { queryProvider } = require('../utils/aiProvider');
const { logAction } = require('../utils/auditLogger');

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
      const { restaurantId, provider, apiKey, isActive } = req.body;
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
      const { provider, apiKey, isActive } = req.body;
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

      const response = await queryProvider(config.provider, config.apiKey, query);
      res.json({ response, provider: config.provider });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = aiConfigController;
