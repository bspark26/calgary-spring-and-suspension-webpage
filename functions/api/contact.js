const TO = 'calgaryspring@gmail.com';
const FROM = 'website@calgaryspringandsuspension.com';
const SERVICES = new Set([
  'Not sure',
  'Spring & suspension',
  'Axle & differential',
  'Custom ride height',
  'Trailer repair',
  'Automotive service',
  'Performance diesel',
]);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function line(value, max) {
  return typeof value === 'string'
    ? value.trim().replace(/[\r\n\t]+/g, ' ').slice(0, max)
    : '';
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) {
    return json({ ok: false, error: 'Invalid origin.' }, 403);
  }

  if (!request.headers.get('Content-Type')?.startsWith('application/json')) {
    return json({ ok: false, error: 'Invalid request format.' }, 415);
  }

  const declaredSize = Number(request.headers.get('Content-Length') || 0);
  if (declaredSize > 12000) {
    return json({ ok: false, error: 'Message is too long.' }, 413);
  }

  let data;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return json({ ok: false, error: 'Message is too long.' }, 413);
    data = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'Invalid message.' }, 400);
  }

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return json({ ok: false, error: 'Invalid message.' }, 400);
  }

  // Quietly discard common bot submissions.
  if (data.website) return json({ ok: true });

  const name = line(data.name, 120);
  const email = line(data.email, 254);
  const phone = line(data.phone, 40);
  const service = line(data.service, 80) || 'Not sure';
  const message = typeof data.message === 'string' ? data.message.trim() : '';

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      message.length < 10 || message.length > 4000 || !SERVICES.has(service)) {
    return json({ ok: false, error: 'Please check the required fields.' }, 400);
  }

  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.EMAIL_API_TOKEN) {
    return json({ ok: false, error: 'Form delivery is not configured yet.' }, 503);
  }

  const text = [
    'New website inquiry',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    `Service: ${service}`,
    '',
    'Message:',
    message,
  ].join('\n');

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/email/sending/send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.EMAIL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: TO,
          from: FROM,
          replyTo: email,
          subject: `New website inquiry: ${service}`,
          text,
        }),
      },
    );
    const result = await response.json();
    if (!response.ok || !result.success) {
      console.error('Contact delivery failed', response.status, result.errors);
      return json({ ok: false, error: 'Could not deliver your message.' }, 502);
    }
    return json({ ok: true });
  } catch (error) {
    console.error('Contact delivery failed', error);
    return json({ ok: false, error: 'Could not deliver your message.' }, 502);
  }
}
