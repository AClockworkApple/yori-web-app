const nodemailer = require('nodemailer');

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yori.de';
const FROM_NAME = process.env.FROM_NAME || 'Yori Deggendorf';

function createTransport() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

const transport = createTransport();

function formatDateTime(isoString) {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function buildBookingHtml(booking, restaurant, template) {
  const lines = [];
  if (template === 'confirmation') {
    lines.push('<h2>Bestätigung Ihrer Reservierung</h2>');
    lines.push(`<p>Sehr geehrte/r ${booking.customerName},</p>`);
    lines.push(`<p>vielen Dank für Ihre Reservierung bei <strong>${restaurant.name}</strong>.</p>`);
  } else if (template === 'reminder') {
    lines.push('<h2>Erinnerung an Ihre bevorstehende Reservierung</h2>');
    lines.push(`<p>Sehr geehrte/r ${booking.customerName},</p>`);
    lines.push(`<p>dies ist eine freundliche Erinnerung an Ihre Reservierung bei <strong>${restaurant.name}</strong>.</p>`);
  } else if (template === 'cancellation') {
    lines.push('<h2>Reservierung storniert</h2>');
    lines.push(`<p>Sehr geehrte/r ${booking.customerName},</p>`);
    lines.push(`<p>Ihre Reservierung bei <strong>${restaurant.name}</strong> wurde storniert.</p>`);
  } else if (template === 'status_update') {
    lines.push('<h2>Status-Update Ihrer Reservierung</h2>');
    lines.push(`<p>Sehr geehrte/r ${booking.customerName},</p>`);
    lines.push(`<p>der Status Ihrer Reservierung bei <strong>${restaurant.name}</strong> wurde aktualisiert.</p>`);
  }

  lines.push('<table style="border-collapse:collapse;width:100%;max-width:500px;margin-top:16px">');
  lines.push(`<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Datum</td><td style="padding:8px;border:1px solid #ddd">${formatDateTime(booking.scheduledStart)}</td></tr>`);
  lines.push(`<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Personen</td><td style="padding:8px;border:1px solid #ddd">${booking.partySize}</td></tr>`);
  if (booking.customerPhone) {
    lines.push(`<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Telefon</td><td style="padding:8px;border:1px solid #ddd">${booking.customerPhone}</td></tr>`);
  }
  if (restaurant.address) {
    lines.push(`<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Restaurant</td><td style="padding:8px;border:1px solid #ddd">${restaurant.name}<br>${restaurant.address}</td></tr>`);
  }
  if (restaurant.phone) {
    lines.push(`<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Kontakt</td><td style="padding:8px;border:1px solid #ddd">${restaurant.phone}</td></tr>`);
  }
  lines.push(`<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Status</td><td style="padding:8px;border:1px solid #ddd">${booking.status}</td></tr>`);
  lines.push('</table>');

  lines.push('<p style="margin-top:20px;font-size:13px;color:#666">Vielen Dank für Ihren Besuch!</p>');
  lines.push('<p style="font-size:12px;color:#999">Yori Deggendorf &middot; Reservierungssystem</p>');

  return lines.join('\n');
}

function buildSubject(template, restaurant) {
  if (template === 'confirmation') return `Reservierungsbestätigung — ${restaurant.name}`;
  if (template === 'reminder') return `Erinnerung: Ihre Reservierung bei ${restaurant.name}`;
  if (template === 'cancellation') return `Reservierung storniert — ${restaurant.name}`;
  return `Status-Update — ${restaurant.name}`;
}

async function sendEmail(to, subject, html) {
  if (!transport) {
    console.log(`[email] Would send email to ${to}: ${subject}`);
    console.log(`[email] Body preview: ${html.substring(0, 200)}...`);
    return { simulated: true, to, subject };
  }

  try {
    const info = await transport.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`[email] Sent to ${to}: ${subject} (id: ${info.messageId})`);
    return { success: true, to, subject, messageId: info.messageId };
  } catch (err) {
    console.error(`[email] Failed to send to ${to}: ${err.message}`);
    return { success: false, to, subject, error: err.message };
  }
}

async function sendConfirmation(booking, restaurant) {
  const subject = buildSubject('confirmation', restaurant);
  const html = buildBookingHtml(booking, restaurant, 'confirmation');
  return sendEmail(booking.customerEmail, subject, html);
}

async function sendReminder(booking, restaurant) {
  const subject = buildSubject('reminder', restaurant);
  const html = buildBookingHtml(booking, restaurant, 'reminder');
  return sendEmail(booking.customerEmail, subject, html);
}

async function sendCancellation(booking, restaurant) {
  const subject = buildSubject('cancellation', restaurant);
  const html = buildBookingHtml(booking, restaurant, 'cancellation');
  return sendEmail(booking.customerEmail, subject, html);
}

async function sendStatusUpdate(booking, restaurant) {
  const subject = buildSubject('status_update', restaurant);
  const html = buildBookingHtml(booking, restaurant, 'status_update');
  return sendEmail(booking.customerEmail, subject, html);
}

module.exports = {
  sendConfirmation,
  sendReminder,
  sendCancellation,
  sendStatusUpdate,
};
