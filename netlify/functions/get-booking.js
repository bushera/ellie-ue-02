require('dotenv').config();
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const user_id = event.queryStringParameters.user_id;

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.BASE_ID;
  const TABLE_NAME = process.env.TABLE_NAME;

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula={User_ID}='${user_id}'`;

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
};
