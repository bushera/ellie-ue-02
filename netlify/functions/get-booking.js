const fetch = require('node-fetch');

exports.handler = async (event) => {
  const user_id = event.queryStringParameters.user_id;

  if (!user_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing user_id" }),
    };
  }

  const AIRTABLE_API_KEY = process.env.GET_BOOKINGS_API;
  const BASE_ID = process.env.GET_BOOKINGS_BASE_ID;
  const TABLE_NAME = process.env.GET_BOOKINGS_TABLE;

  if (!AIRTABLE_API_KEY || !BASE_ID || !TABLE_NAME) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing Airtable environment variables" }),
    };
  }

  console.log(`Calling Airtable: https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula={User_ID}='${user_id}'`);


  const filterFormula = encodeURIComponent(`{User_ID} = "${user_id}"`);
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=${filterFormula}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Error fetching from Airtable:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server Error" }),
    };
  }
};
