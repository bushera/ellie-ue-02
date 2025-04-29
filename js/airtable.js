document.addEventListener("DOMContentLoaded", async function () {
  const airtableApiKey = "patT2ZtryQSA2JzpX.75d12024b136349527032e8fc46f45c3c79635c651891d34bd9fbe8047c85448";
  const airtableBaseId = "appAtnhxiXYiC9Can";
  const airtableTableName = "User_Data";
  const websiteDomain = "Ellie(UE)";
  const currentPage = window.location.href;

  let ipData = getIpFromLocalStorage();

  if (!ipData) {
      ipData = await fetchIpAndSaveLocally();
  }

  if (!ipData || !ipData.ip) {
      console.error("Failed to retrieve IP data.");
      return;
  }

  const ipAdd = ipData.ip;
  const existingRecord = await checkAirtableForIp(ipAdd, airtableApiKey, airtableBaseId, airtableTableName);

  let userId = "";

  if (existingRecord) {
      userId = existingRecord.fields.User_ID;
      const updateData = {
          fields: {
              User_ID: userId,
              Visit_Time: new Date().toISOString(),
              Status: "Returning User",
              Website: websiteDomain,
              Page_URL: currentPage
          },
      };
      await updateAirtableRecord(existingRecord.id, updateData, airtableApiKey, airtableBaseId, airtableTableName);
  } else {
      userId = generateUserId();
      const newUserData = {
          fields: {
              User_ID: userId,
              IP_Address: ipData.ip,
              Country_Code: ipData.country || "Unknown",
              Country: ipData.country_name || "Unknown",
              Region: ipData.region || "Unknown",
              Region_code: ipData.region_code || "Unknown",
              Calling_code: ipData.country_calling_code || "Unknown",
              City: ipData.city || "Unknown",
              Languages: ipData.languages || "Unknown",
              Visit_Time: new Date().toISOString(),
              Status: "New User",
              Website: websiteDomain,
              Page_URL: currentPage
          },
      };
      await createAirtableRecord(newUserData, airtableApiKey, airtableBaseId, airtableTableName);
  }

  // Save the userId to localStorage so voiceflow.js can use it
  localStorage.setItem("User_ID", userId);
});

function generateUserId() {
  return 'UE-User-' + Math.random().toString(36).substr(2, 9);
}

function getIpFromLocalStorage() {
  const ipData = localStorage.getItem("ipData");
  return ipData ? JSON.parse(ipData) : null;
}

async function fetchIpAndSaveLocally() {
  try {
      const response = await fetch("https://ipapi.co/json/");
      if (response.ok) {
          const data = await response.json();
          localStorage.setItem("ipData", JSON.stringify(data));
          return data;
      }
  } catch (error) {
      console.error("Error fetching IP data:", error);
  }
  return null;
}

async function checkAirtableForIp(ipAdd, airtableApiKey, airtableBaseId, airtableTableName) {
  const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}?filterByFormula=IP_Address='${ipAdd}'`;
  try {
      const response = await fetch(url, {
          headers: {
              Authorization: `Bearer ${airtableApiKey}`,
              "Content-Type": "application/json",
          },
      });

      if (response.ok) {
          const result = await response.json();
          if (result.records && result.records.length > 0) {
              return result.records[0];
          }
      } else {
          console.error("Error querying Airtable:", await response.text());
      }
  } catch (error) {
      console.error("Error querying Airtable:", error);
  }
  return null;
}

async function createAirtableRecord(data, airtableApiKey, airtableBaseId, airtableTableName) {
  const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`;
  try {
      const response = await fetch(url, {
          method: "POST",
          headers: {
              Authorization: `Bearer ${airtableApiKey}`,
              "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
      });

      if (!response.ok) {
          console.error("Error creating Airtable record:", await response.text());
      }
  } catch (error) {
      console.error("Error creating Airtable record:", error);
  }
}

async function updateAirtableRecord(recordId, data, airtableApiKey, airtableBaseId, airtableTableName) {
  const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}/${recordId}`;
  try {
      const response = await fetch(url, {
          method: "PATCH",
          headers: {
              Authorization: `Bearer ${airtableApiKey}`,
              "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
      });

      if (!response.ok) {
          console.error("Error updating Airtable record:", await response.text());
      }
  } catch (error) {
      console.error("Error updating Airtable record:", error);
  }
}
