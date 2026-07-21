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
  if (endIdx === -1) return null;
  const jsonStr = aiResponse.substring(startIdx + BOOKING_MARKER.length, endIdx).trim();
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
    tableIds: [],
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
    },
    message: `Booking confirmed for ${customerName} (${partySize} guests) on ${formatDate(scheduledStart)}. Your booking reference is ${booking.id}.`,
  };
}

async function buildSystemPrompt(restaurant) {
  const parts = [
    'You are a friendly customer support assistant for a restaurant.',
    'You MUST ONLY answer questions related to the restaurant, its menu, bookings, hours, and services.',
  ];

  if (restaurant) {
    parts.push('\n--- RESTAURANT INFO ---');
    parts.push(`Name: ${restaurant.name}`);
    if (restaurant.address) parts.push(`Address: ${restaurant.address}`);
    if (restaurant.phone) parts.push(`Phone: ${restaurant.phone}`);
    if (restaurant.taxNumber) parts.push(`Tax number: ${restaurant.taxNumber}`);
    if (restaurant.taxRate != null) parts.push(`Tax rate: ${restaurant.taxRate}%`);
    if (restaurant.serviceFeeRate != null) parts.push(`Service fee: ${restaurant.serviceFeeRate}%`);
  }

  if (restaurant) {
    try {
      const hours = await RestaurantHour.getByRestaurant(restaurant.id);
      if (hours.length > 0) {
        parts.push('\n--- OPENING HOURS ---');
        const sorted = hours.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
        for (const h of sorted) {
          const dayName = DAY_NAMES[h.dayOfWeek] || `Day ${h.dayOfWeek}`;
          let line = `${dayName}: ${h.openTime} - ${h.closeTime}`;
          if (h.breakStart && h.breakEnd) line += ` (break: ${h.breakStart} - ${h.breakEnd})`;
          parts.push(line);
        }
      }
    } catch { /* ignore */ }
  }

  if (restaurant) {
    try {
      const items = await MenuItem.getRestaurantMenu(restaurant.id);
      const available = items.filter(i => i.isAvailable !== false).slice(0, MAX_MENU_ITEMS);
      if (available.length > 0) {
        parts.push(`\n--- MENU (${available.length} item${available.length > 1 ? 's' : ''}) ---`);
        const byCategory = {};
        for (const item of available) {
          const cat = item.category || 'General';
          if (!byCategory[cat]) byCategory[cat] = [];
          byCategory[cat].push(item);
        }
        for (const [category, catItems] of Object.entries(byCategory)) {
          parts.push(`\n${category}:`);
          for (const item of catItems) {
            const price = item.price != null ? item.price.toFixed(2) : 'N/A';
            parts.push(`  - ${item.name} ($${price})${item.description ? ': ' + item.description : ''}`);
          }
        }
      }
    } catch { /* ignore */ }
  }

  parts.push('\n--- BOOKING INSTRUCTIONS ---');
  parts.push('You can help customers make reservations. When a customer wants to book a table:');
  parts.push('1. Collect the required information: their name, party size (number of guests), and desired date & time.');
  parts.push('2. Optionally collect their email (needed for confirmation) and phone number.');
  parts.push('3. Once you have all the information, summarize the booking details and ask the customer to confirm.');
  parts.push('4. After the customer confirms, output the booking request EXACTLY in this format on its own line:');
  parts.push('---BOOKING_REQUEST---');
  parts.push('{"customerName": "...", "partySize": N, "scheduledStart": "ISO date string", "customerEmail": "...", "customerPhone": "..."}');
  parts.push('---END_BOOKING_REQUEST---');
  parts.push('5. The system will process the booking and replace the marker with the result.');
  parts.push('Important: Only output the booking request after the customer has confirmed. Do not book without confirmation.');

  parts.push('\n--- GUIDELINES ---');
  parts.push('Be polite, concise, and helpful. If you cannot answer a question because it is not related to the restaurant, politely explain that you can only help with restaurant-related topics.');
  parts.push('Do not make up information about menu items or pricing. Base your answers on the provided menu and restaurant data above. If a customer asks about something not listed, honestly say it is not available.');
  parts.push('When discussing dates and times, always clarify the timezone with the customer.');

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

    if (!restaurantId || !message) {
      return res.status(400).json({ error: 'restaurantId and message are required' });
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

    const restaurant = await Restaurant.getById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const aiConfig = await AiConfig.getActiveByRestaurant(restaurantId);
    if (!aiConfig) {
      return res.status(503).json({ error: 'AI support is not configured for this restaurant yet.' });
    }

    let conv;
    if (conversationId) {
      conv = await Conversation.getById(conversationId);
      if (!conv || conv.restaurantId !== restaurantId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      conv = await Conversation.create({
        restaurantId,
        customerName: customerName || null,
        customerEmail: customerEmail || null,
      });
    }

    await Conversation.addMessage(conv.id, 'user', trimmed);

    const recentMessages = await Conversation.getRecentMessages(conv.id, MAX_CONTEXT_MESSAGES);

    const systemPrompt = await buildSystemPrompt(restaurant);
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
      aiResponse = await queryProvider(aiConfig.provider, aiConfig.apiKey, providerMessages);
    } catch (err) {
      await Conversation.addMessage(conv.id, 'assistant', 'I\'m sorry, I encountered an error processing your request. Please try again later.');
      return res.status(502).json({ error: 'AI provider error', detail: err.message });
    }

    let finalResponse = aiResponse;

    const bookingRequest = extractBookingRequest(aiResponse);
    if (bookingRequest) {
      const result = await processBookingRequest(bookingRequest, restaurant);
      const markerRegex = new RegExp(`${BOOKING_MARKER}[\\s\\S]*?${BOOKING_END_MARKER}`);
      if (result.success) {
        finalResponse = aiResponse.replace(markerRegex,
          `✅ ${result.message}`);
      } else {
        finalResponse = aiResponse.replace(markerRegex,
          `❌ Sorry, I couldn't complete the booking: ${result.error}`);
      }
    }

    await Conversation.addMessage(conv.id, 'assistant', finalResponse);

    res.json({
      conversationId: conv.id,
      response: finalResponse,
      provider: aiConfig.provider,
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