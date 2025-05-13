const fetch = require('node-fetch');

exports.handler = async (event) => {
  const user_id = event.queryStringParameters.user_id;

  const AIRTABLE_API_KEY = process.env.GET_BOOKINGS_API;
  const BASE_ID = process.env.GET_BOOKINGS_BASE_ID;
  const TABLE_NAME = process.env.GET_BOOKINGS_TABLE;
  

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula={User_ID}='${user_id}'`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log(">>> Airtable response:");
    console.log(JSON.stringify(data, null, 2)); // See full output in Netlify logs

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
