const Table = require('../models/Table');
const Booking = require('../models/Booking');

function doTimeRangesOverlap(startA, endA, startB, endB) {
  return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
}

function extractTableNumber(name) {
  if (!name) return 0;
  const match = name.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function findBestCombination(tables, partySize) {
  if (tables.length === 0) return null;

  for (const table of tables) {
    if (table.seats >= partySize) {
      return { tables: [table], totalSeats: table.seats };
    }
  }

  const sorted = [...tables].sort((a, b) => extractTableNumber(a.name) - extractTableNumber(b.name));

  for (let size = 2; size <= sorted.length; size++) {
    for (let start = 0; start <= sorted.length - size; start++) {
      const combo = sorted.slice(start, start + size);
      const totalSeats = combo.reduce((sum, t) => sum + (t.seats || 2), 0);
      if (totalSeats >= partySize) {
        const numA = extractTableNumber(combo[0].name);
        const numB = extractTableNumber(combo[combo.length - 1].name);
        const gap = numB - numA;
        let bestCombo = combo;
        let bestSeats = totalSeats;
        let bestGap = gap;

        for (let s2 = 0; s2 <= sorted.length - size; s2++) {
          if (s2 === start) continue;
          const c2 = sorted.slice(s2, s2 + size);
          const seats2 = c2.reduce((sum, t) => sum + (t.seats || 2), 0);
          if (seats2 < partySize) continue;
          const g2 = extractTableNumber(c2[c2.length - 1].name) - extractTableNumber(c2[0].name);
          if (g2 < bestGap || (g2 === bestGap && seats2 < bestSeats)) {
            bestCombo = c2;
            bestSeats = seats2;
            bestGap = g2;
          }
        }
        return { tables: bestCombo, totalSeats: bestSeats };
      }
    }
  }

  return null;
}

async function assignTablesForBooking(restaurantId, partySize, scheduledStart, scheduledEnd) {
  const allTables = await Table.getByRestaurant(restaurantId);
  const availableTables = allTables.filter(t => t.status !== 'MAINTENANCE');

  const allBookings = await Booking.getByRestaurant(restaurantId);
  const overlapping = allBookings.filter(b => {
    if (b.status === 'CANCELLED' || b.status === 'NO_SHOW') return false;
    if (b.tableIds && b.tableIds.length > 0) return false;
    return doTimeRangesOverlap(b.scheduledStart, b.scheduledEnd, scheduledStart, scheduledEnd);
  });

  const bookedTableIds = new Set();
  for (const b of overlapping) {
    if (b.tableIds) {
      b.tableIds.forEach(id => bookedTableIds.add(id));
    }
  }

  const freeTables = availableTables.filter(t => !bookedTableIds.has(t.id));

  const result = findBestCombination(freeTables, partySize);
  if (!result) return [];

  return result.tables.map(t => t.id);
}

module.exports = { assignTablesForBooking, findBestCombination, extractTableNumber };
