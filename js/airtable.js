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

    // 1. FORMAT TIMESTAMP FRIENDLY
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    let formattedDate = formatter.format(now);

    // 1a. Add ordinal suffix to day (e.g. 1st, 2nd)
    const day = now.getDate();
    const ordinalSuffix = (d) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };
    formattedDate = formattedDate.replace(
        /\b\d{1,2}\b/,
        day + ordinalSuffix(day)
    );

    const currentPageEntry = `${formattedDate} – ${currentPage}`;

    // 2. GET EXISTING VISIT HISTORY
    let existingHistory = "";  
    try {
        // Fetch full latest record again to ensure up-to-date visit_history
        const latestCheck = await checkAirtableForIp(ipAdd, airtableApiKey, airtableBaseId, airtableTableName);
        existingHistory = latestCheck?.fields?.Visit_history || "";
    } catch (err) {
        console.warn("Error fetching latest visit_history:", err);
    }

    // 3. COMPOSE UPDATED HISTORY
    let updatedHistoryString = "";
    if (!existingHistory || existingHistory.trim() === "") {
        updatedHistoryString = `Page visit:\n${currentPageEntry}`;
    } else {
        updatedHistoryString = `${existingHistory}\n${currentPageEntry}`;
    }

    // 4. UPDATE THE RECORD
    const updateData = {
        fields: {
            User_ID: userId,
            Visit_Time: now.toISOString(),
            Status: "Returning User",
            Website: websiteDomain,
            Page_URL: currentPage,
            Visit_history: updatedHistoryString
        },
    };

    await updateAirtableRecord(existingRecord.id, updateData, airtableApiKey, airtableBaseId, airtableTableName);
}



 else {
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
              Page_URL: currentPage,
              Visit_history: 'Page visit:' + currentPage,
          },
      };
      await createAirtableRecord(newUserData, airtableApiKey, airtableBaseId, airtableTableName);
  }

  console.log('[airtable.js] Dispatching userIdentified with userId:', userId);
document.dispatchEvent(new CustomEvent("userIdentified", {
  detail: { userId }
}));
  
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
