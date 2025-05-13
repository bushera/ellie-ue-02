const fetch = require('node-fetch');


const user_id = event.queryStringParameters.user_id;

if (!user_id) {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: "Missing user_id in query parameters" }),
  };
}


exports.handler = async function (event) {
  const user_id = event.queryStringParameters.user_id;

  const AIRTABLE_API_KEY = process.env.GET_BOOKINGS_API;
  const BASE_ID = process.env.GET_BOOKINGS_BASE_ID;
  const TABLE_NAME = process.env.GET_BOOKINGS_TABLE;

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula={User_ID}='${user_id}'`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch Airtable data' }),
    };
  }
};
