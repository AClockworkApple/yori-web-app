const Conversation = require('../models/Conversation');
const AiConfig = require('../models/AiConfig');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const RestaurantHour = require('../models/RestaurantHour');
const Booking = require('../models/Booking');
const { isRestaurantRelated } = require('../utils/aiSafeguard');
const { queryProvider } = require('../utils/aiProvider');
const { validateBookingTime } = require('./bookingController');
const { emitBookingUpdate } = require('../socket/setup');
const { assignTablesForBooking } = require('../utils/tableAssignment');

const MAX_CONTEXT_MESSAGES = 20;
const MAX_CONTEXT_TOKENS = 3000;
const MAX_MENU_ITEMS = 80;

const BOOKING_MARKER = '---BOOKING_REQUEST---';
const BOOKING_END_MARKER = '---END_BOOKING_REQUEST---';

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function extractBookingRequest(aiResponse) {
  const startIdx = aiResponse.indexOf(BOOKING_MARKER);
  if (startIdx === -1) return null;
  const endIdx = aiResponse.indexOf(BOOKING_END_MARKER, startIdx);
  const jsonStr = endIdx !== -1
    ? aiResponse.substring(startIdx + BOOKING_MARKER.length, endIdx).trim()
    : aiResponse.substring(startIdx + BOOKING_MARKER.length).trim();
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Berlin' }) +
    ' at ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });
}

async function processBookingRequest(bookingData, restaurant) {
  const { customerName, customerEmail, customerPhone, partySize, scheduledStart } = bookingData;

  if (!customerName || !partySize || !scheduledStart) {
    return { error: 'Missing required booking fields: customerName, partySize, and scheduledStart are required.' };
  }

  if (customerEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return { error: 'Invalid email format.' };
    }
  }

  const timeCheck = await validateBookingTime(scheduledStart, restaurant.id);
  if (timeCheck.error) {
    return { error: timeCheck.error };
  }

  const scheduledEnd = timeCheck.scheduledEnd;

  const tableIds = await assignTablesForBooking(restaurant.id, partySize, scheduledStart, scheduledEnd);

  const booking = await Booking.create({
    restaurantId: restaurant.id,
    customerName,
    customerEmail: customerEmail || null,
    customerPhone: customerPhone || null,
    partySize,
    scheduledStart,
    scheduledEnd,
    source: 'chat',
    status: 'PENDING',
    tableIds,
  });

  if (booking) {
    try {
      emitBookingUpdate(restaurant.id, { action: 'created', booking });
    } catch { /* ignore */ }
  }

  return {
    success: true,
    booking: {
      id: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      partySize: booking.partySize,
      scheduledStart: booking.scheduledStart,
      scheduledEnd: booking.scheduledEnd,
      status: booking.status,
      tableIds: booking.tableIds || [],
    },
    message: `Booking confirmed for ${customerName} (${partySize} guests) on ${formatDate(scheduledStart)}. Your booking reference is ${booking.id}.${tableIds.length > 0 ? ` You have been assigned ${tableIds.length} table(s).` : ''}`,
  };
}

async function buildSystemPrompt(restaurants) {
  const restaurantList = Array.isArray(restaurants) ? restaurants : [restaurants];

  const parts = [];

  parts.push(`You are the official AI assistant for Yori, a restaurant chain with ${restaurantList.length} location${restaurantList.length > 1 ? 's' : ''}.`);

  for (const restaurant of restaurantList) {
    parts.push(`\n=== YORI ${restaurant.name.toUpperCase()} (ID: ${restaurant.id}) ===`);
    if (restaurant.address) parts.push(`Address: ${restaurant.address}`);
    if (restaurant.phone) parts.push(`Phone: ${restaurant.phone}`);

    try {
      const hours = await RestaurantHour.getByRestaurant(restaurant.id);
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
      const items = await MenuItem.getRestaurantMenu(restaurant.id);
      const available = items.filter(i => i.isAvailable !== false).slice(0, MAX_MENU_ITEMS);
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
  }

  parts.push('\n=== INSTRUCTIONS ===');
  parts.push('You are Yori\'s AI assistant. Answer ONLY using the Yori restaurant data above.');
  parts.push('');
  parts.push('CRITICAL RULES:');
  parts.push('- When asked about food, menu, recommendations, "what\'s good", or anything to eat: you MUST list specific dish names with prices from the YORI menu above.');
  parts.push('- You are NOT a general food advisor. You work FOR Yori. Recommend YORI dishes only.');
  parts.push('- Never suggest generic dishes like "Birria Tacos" or "Chicken Tikka Masala" unless they appear in the Yori menu data above.');
  parts.push('- Always say which Yori location each dish is from.');
  parts.push('- If the customer doesn\'t specify a location, recommend from ALL Yori locations and list their addresses.');
  parts.push('- When asked about opening hours, always give the full address and phone number.');
  parts.push('- Assume German timezone (Europe/Berlin) for all times.');
  parts.push('');
  parts.push('BOOKING:');
  parts.push('Collect: name, party size, date/time, optionally email/phone.');
  if (restaurantList.length > 1) {
    parts.push('Ask which Yori location they want to book. Use the restaurant ID (not the name) in the booking request.');
    parts.push('Format: ---BOOKING_REQUEST---{"restaurantId":"THE_RESTAURANT_ID_FROM_ABOVE","customerName":"...","partySize":N,"scheduledStart":"ISO","customerEmail":"...","customerPhone":"..."}---END_BOOKING_REQUEST---');
  } else {
    parts.push('Format: ---BOOKING_REQUEST---{"customerName":"...","partySize":N,"scheduledStart":"ISO","customerEmail":"...","customerPhone":"..."}---END_BOOKING_REQUEST---');
  }
  parts.push('Only output booking request AFTER customer confirms. Manual mode restaurants: tell them to call instead.');

  parts.push('');
  parts.push('BEHAVIOUR: Be warm and helpful like a restaurant host. Decline unrelated topics politely.');

  return parts.join('\n');
}

function pruneMessages(messages, systemPrompt) {
  const systemTokens = estimateTokens(systemPrompt);
  let availableTokens = MAX_CONTEXT_TOKENS - systemTokens;
  if (availableTokens < 500) availableTokens = 500;

  const pruned = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const msgTokens = estimateTokens(messages[i].content + (messages[i].role || ''));
    if (availableTokens - msgTokens < 0) break;
    if (pruned.length >= MAX_CONTEXT_MESSAGES) break;
    pruned.unshift(messages[i]);
    availableTokens -= msgTokens;
  }

  return pruned;
}

async function handleChat(req, res) {
  try {
    const { restaurantId, message, conversationId, customerName, customerEmail } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const trimmed = message.trim();
    if (!trimmed) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const safeguard = isRestaurantRelated(trimmed);
    if (!safeguard.allowed) {
      return res.status(400).json({
        error: 'I can only help with restaurant-related questions.',
        reason: safeguard.reason,
        blocked: true,
      });
    }

    let restaurants;
    if (restaurantId) {
      const restaurant = await Restaurant.getById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      restaurants = [restaurant];
    } else {
      restaurants = await Restaurant.getAll();
      if (restaurants.length === 0) {
        return res.status(404).json({ error: 'No restaurants found' });
      }
    }

    let conv;
    if (conversationId) {
      conv = await Conversation.getById(conversationId);
      if (!conv) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      conv = await Conversation.create({
        restaurantId: restaurantId || null,
        customerName: customerName || null,
        customerEmail: customerEmail || null,
      });
    }

    await Conversation.addMessage(conv.id, 'user', trimmed);

    const recentMessages = await Conversation.getRecentMessages(conv.id, MAX_CONTEXT_MESSAGES);

    const systemPrompt = await buildSystemPrompt(restaurants);
    const contextMessages = pruneMessages(recentMessages, systemPrompt);

    const providerMessages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    let aiResponse;
    try {
      const aiConfig = restaurants.length === 1
        ? await AiConfig.getActiveByRestaurant(restaurants[0].id)
        : null;

      if (restaurants.length === 1 && !aiConfig) {
        return res.status(503).json({ error: 'AI support is not configured for this restaurant yet.' });
      }

      if (restaurants.length === 1) {
        aiResponse = await queryProvider(aiConfig.provider, aiConfig.apiKey, providerMessages);
      } else {
        const configs = [];
        for (const r of restaurants) {
          const cfg = await AiConfig.getActiveByRestaurant(r.id);
          if (cfg) configs.push(cfg);
        }
        if (configs.length === 0) {
          return res.status(503).json({ error: 'AI support is not configured for any restaurant yet.' });
        }
        aiResponse = await queryProvider(configs[0].provider, configs[0].apiKey, providerMessages);
      }
    } catch (err) {
      await Conversation.addMessage(conv.id, 'assistant', 'I\'m sorry, I encountered an error processing your request. Please try again later.');
      return res.status(502).json({ error: 'AI provider error', detail: err.message });
    }

    let finalResponse = aiResponse;

    const bookingRequest = extractBookingRequest(aiResponse);
    if (bookingRequest) {
      let targetRestaurant;
      if (bookingRequest.restaurantId) {
        targetRestaurant = restaurants.find(r => r.id === bookingRequest.restaurantId);
      }
      if (!targetRestaurant && restaurants.length === 1) {
        targetRestaurant = restaurants[0];
      }
      if (!targetRestaurant) {
        finalResponse = aiResponse.replace(
          new RegExp(`${BOOKING_MARKER}[\\s\\S]*?${BOOKING_END_MARKER}`),
          'Which restaurant would you like to book? Please specify the restaurant name and I\'ll check availability.'
        );
      } else if (targetRestaurant.mode === 'MANUAL') {
        finalResponse = aiResponse.replace(
          new RegExp(`${BOOKING_MARKER}[\\s\\S]*?${BOOKING_END_MARKER}`),
          `Sorry, online bookings are not available for ${targetRestaurant.name}. Please call or visit directly to make a reservation.`
        );
      } else {
        const result = await processBookingRequest({ ...bookingRequest, restaurantId: targetRestaurant.id }, targetRestaurant);
        const markerRegex = new RegExp(`${BOOKING_MARKER}[\\s\\S]*?${BOOKING_END_MARKER}`);
        if (result.success) {
          finalResponse = aiResponse.replace(markerRegex,
            `${result.message} (${targetRestaurant.name})`);
        } else {
          finalResponse = aiResponse.replace(markerRegex,
            `Sorry, I couldn't complete the booking at ${targetRestaurant.name}: ${result.error}`);
        }
      }
    }

    await Conversation.addMessage(conv.id, 'assistant', finalResponse);

    res.json({
      conversationId: conv.id,
      response: finalResponse,
      messageCount: conv.messageCount + 2,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getConversationHistory(req, res) {
  try {
    const { conversationId } = req.params;
    const messages = await Conversation.getMessages(conversationId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { handleChat, getConversationHistory };