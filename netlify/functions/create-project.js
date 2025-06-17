export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  /* -------- Parse body -------- */
  let fields;
  try {
    fields = JSON.parse(event.body);          // whatever QuoteForm sends
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  /* -------- ENV -------- */
  const AIRTABLE_API_KEY = process.env.GET_BOOKINGS_API;
  const BASE_ID = process.env.GET_BOOKINGS_BASE_ID;
  /* -------- Airtable -------- */
  const url = `https://api.airtable.com/v0/${BASE_ID}/Projects`;

  try {
    const res  = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),       // Airtable expects { fields: {...} }
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Airtable: ${res.status} – ${txt}`);
    }

    const json = await res.json();
    return { statusCode: 200, body: JSON.stringify(json) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};
