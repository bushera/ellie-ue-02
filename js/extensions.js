
export const CalExtension = {
  name: 'CalEmbed',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_cal' || trace.payload.name === 'ext_cal',
  render: ({ trace, element }) => {
    const { CalUrl, height, width } = trace.payload


    const iframe = document.createElement('iframe')
    iframe.src = CalUrl || 'https://cal.com/bushera/book-a-consultation',
    iframe.height = height || '280'
    iframe.width = width || '320'
    iframe.style.border = '0'
    iframe.allowFullscreen = true
    iframe.loading = 'lazy'
    iframe.id = 'cal-iframe'

    // Listen for Cal.com "booking completed" postMessage
    window.addEventListener('message', function (event) {
      if (
        event.origin.includes('cal.com') &&
        event.data === 'cal.com:booking-success'
      ) {
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: { message: 'Booking completed' },
        })
      }
    })

    element.appendChild(iframe)
  },
}


let user_id = 'UE_000';

document.addEventListener('userIdentified', (e) => {
  user_id = e.detail.userId || 'UE_000';
  console.log('[extensions.js] Using the userIdentified event with userId:', user_id);
});


/**export const BookingDashboardExtension = {
  name: 'BookingDashboard',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'booking_dashboard' || trace.payload.name === 'booking_dashboard',
  render: async ({ trace, element }) => {
    const container = document.createElement('div');
    container.id = 'booking-dashboard';

    container.innerHTML = `
      <style>
        #booking-dashboard {
          font-family: 'Nunito', sans-serif;
          padding: 10px;
          width: 320;
          font-size: 10px;
        }
        .user-header {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          margin-bottom: 10px;
          font-style: bold;
        }
        .user-header img {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          object-fit: cover;
        }
        .call {
          border: 1px solid #ddd;
          padding: 10px;
          margin: 10px 0;
          border-radius: 5px;
        }
        .active {
          border-left: 2px solid green;
        }
        .engaged {
          border-left: 2px solid red;
        }
        button {
          margin: 5px auto;
          display: block;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 90%;
        }
        button.cancel {
          background-color: rgb(0, 0, 0);
          color: white;
        }
        button.reschedule {
          background-color: #27ae60;
          color: white;
        }
        .book-another {
          margin: 10px auto 0;
          display: block;
          padding: 12px;
          background-color: rgb(65, 23, 189);
          color: white;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          width: 90%;
        }
      </style>

      <div class="user-header">
        <img src="https://ik.imagekit.io/bushera/profile%20images/01.png?updatedAt=1746351651791" alt="Avatar" />
        <span id="user-name">My Bookings</span>
      </div>

      <div id="active-section">
        <h2>Active Calls</h2>
        <div id="active-calls"></div>
      </div>

      <div id="engaged-section">
        <h2>Engaged History</h2>
        <div id="engaged-calls"></div>
      </div>

      <button class="book-another">+ Add Appointment</button>
    `;




    async function fetchBookings() {

      if (!user_id) {
        console.error("user_id is missing");
        return;
      }

      const res = await fetch(`/.netlify/functions/get-booking?user_id=${user_id}`);
      const data = await res.json();

      const activeContainer = container.querySelector('#active-calls');
      const engagedContainer = container.querySelector('#engaged-calls');
      const activeSection = container.querySelector('#active-section');
      const engagedSection = container.querySelector('#engaged-section');
      const userNameSpan = container.querySelector('#user-name');

      let activeExists = false;
      let engagedExists = false;

      let summary = {
        missed: 0,
        cancelled: 0,
        attended: 0,
        ended: 0,
      };

      data.records.forEach((record) => {
        const booking = {
          bookingId: record.fields.booking_id,
          title: record.fields.title,
          start: record.fields.start_date,
          end: record.fields.end_date,
          location: record.fields.location,
          status: record.fields.status,
          name: record.fields.name,
        };

        if (booking.name || userNameSpan.innerText === 'My Bookings') {
          userNameSpan.innerText = `${booking.name}'s Bookings`;
        }

        const startDate = new Date(booking.start);
        const endDate = new Date(booking.end);

        const formattedStart = `${startDate.getDate()} ${startDate.toLocaleString('default', {
          month: 'short',
        })}, ${startDate.getFullYear()} ${startDate.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })}`;

        const formattedEnd = endDate.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        });

        if (booking.status === 'ACCEPTED') {
          activeExists = true;
          const div = document.createElement('div');
          div.className = `call active`;
          div.innerHTML = `
            <h3>${booking.title}</h3>
            <p>${formattedStart} - ${formattedEnd} • ${booking.location}</p>
            <button class="cancel" data-id="${booking.bookingId}" data-title="${booking.title}">Cancel</button>
            <button class="reschedule" data-id="${booking.bookingId}" data-title="${booking.title}">Reschedule</button>
          `;
          activeContainer.appendChild(div);
        } else {
          engagedExists = true;

          switch (booking.status.toLowerCase()) {
            case 'missed':
              summary.missed++;
              break;
            case 'cancelled':
              summary.cancelled++;
              break;
            case 'attended':
              summary.attended++;
              break;
            case 'ended':
              summary.ended++;
              break;
          }
        }
      });

      if (!activeExists) activeSection.style.display = 'none';

      if (!engagedExists) {
        engagedSection.style.display = 'none';
      } else {
        engagedContainer.innerHTML = `
          <p>Missed: ${summary.missed}</p>
          <p>Cancelled: ${summary.cancelled}</p>
          <p>Attended: ${summary.attended}</p>
        `;
      }

      container.querySelectorAll('button.cancel, button.reschedule').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const bookingId = e.target.dataset.id;
          const action = e.target.classList.contains('cancel') ? 'cancel_intent' : 'reschedule_intent';
      
          window.voiceflow.chat.interact({
            type: 'intent',
            payload: {
              intent: action,
              entities: {
                bookingId: bookingId
              }
            }
          });
        });
      });
      
    }

    container.querySelector('.book-another').addEventListener('click', () => {
      window.voiceflow.chat.interact({
        type: 'intent',
        payload: { intent: 'book_consultation' }
      });
    });

    await fetchBookings();
    element.appendChild(container);
  },
}**/


/**export const BookingDashboardExtension = {
  name: 'BookingDashboard',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'booking_dashboard' || trace.payload.name === 'booking_dashboard',
  render: async ({ trace, element }) => {
    const container = document.createElement('div');
    container.id = 'booking-dashboard';

    container.innerHTML = `
      <style>
        #booking-dashboard {
          font-family: 'Nunito', sans-serif;
          padding: 10px;
          width: 350;
          font-size: 10px;
        }
        .user-header {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          margin-bottom: 10px;
          font-style: bold;
        }
        .user-header img {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          object-fit: cover;
        }
        .call {
          border: 1px solid #ddd;
          padding: 10px;
          margin: 10px 0;
          border-radius: 5px;
        }
        .active {
          border-left: 3px solid green;
        }
        .engaged {
          border-left: 3px solid red;
        }
        button {
          margin: 5px auto;
          display: block;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 90%;
        }
        button.cancel {
          background-color: rgb(0, 0, 0);
          color: white;
        }
        button.reschedule {
          background-color: #27ae60;
          color: white;
        }
        .book-another {
          margin: 10px auto 0;
          display: block;
          padding: 12px;
          background-color: rgb(65, 23, 189);
          color: white;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          width: 90%;
        }
      </style>

      <div class="user-header">
        <img src="https://ik.imagekit.io/bushera/profile%20images/01.png?updatedAt=1746351651791" alt="Avatar" />
        <span id="user-name">My Bookings</span>
      </div>

      <div id="active-section">
        <h2>Active Calls</h2>
        <div id="active-calls"></div>
      </div>

      <div id="engaged-section">
        <h2>Engaged History</h2>
        <div id="engaged-calls"></div>
      </div>

      <div class="book-another">+ Add Appointment</div>
    `;

    // Append container FIRST so elements are available in DOM
    element.appendChild(container);

    async function fetchBookings() {
      

      if (!user_id) {
        console.error("user_id is missing");
        return;
      }

      try {
        const res = await fetch(`/.netlify/functions/get-booking?user_id=${user_id}`);
        const data = await res.json();

        console.log("Fetched booking data:", data); // 👈 Add this line

        if (!data.records || !Array.isArray(data.records)) {
          console.error("No records received from server.");
          return;
        }

        if (!data.records || data.records.length === 0) {
          console.error("No records received from server.");
          return;
        }

        const activeContainer = container.querySelector('#active-calls');
        const engagedContainer = container.querySelector('#engaged-calls');
        const activeSection = container.querySelector('#active-section');
        const engagedSection = container.querySelector('#engaged-section');
        const userNameSpan = container.querySelector('#user-name');

        let activeExists = false;
        let engagedExists = false;

        let summary = {
          missed: 0,
          cancelled: 0,
          attended: 0,
          ended: 0,
        };

        data.records.forEach((record) => {
          const booking = {
            bookingId: record.fields.booking_id,
            title: record.fields.title,
            start: record.fields.start_date,
            end: record.fields.end_date,
            location: record.fields.location,
            status: record.fields.status,
            name: record.fields.name,
            url: record.fields.cal_url,
          };

          if (booking.name && userNameSpan.innerText === 'My Bookings') {
            userNameSpan.innerText = `${booking.name}'s Bookings`;
          }

          const startDate = new Date(booking.start);
          const endDate = new Date(booking.end);

          const formattedStart = `${startDate.getDate()} ${startDate.toLocaleString('default', {
            month: 'short',
          })}, ${startDate.getFullYear()} ${startDate.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}`;

          const formattedEnd = endDate.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          });

          if (booking.status === 'ACCEPTED') {
            activeExists = true;
            const div = document.createElement('div');
            div.className = `call active`;
            div.innerHTML = `
              <h3>${booking.title}</h3>
              <p>${formattedStart} - ${formattedEnd} • ${booking.location}</p>
              <a href="${booking.url}">Click to Join call via •${booking.url}</a>
              <button class="cancel" data-id="${booking.bookingId}" data-title="${booking.title}">Cancel</button>
              <button class="reschedule" data-id="${booking.bookingId}" data-title="${booking.title}">Reschedule</button>
            `;
            activeContainer.appendChild(div);
          } else {
            engagedExists = true;
            switch (booking.status.toLowerCase()) {
              case 'missed':
                summary.missed++;
                break;
              case 'cancelled':
                summary.cancelled++;
                break;
              case 'attended':
                summary.attended++;
                break;
              case 'ended':
                summary.ended++;
                break;
            }
          }
        });

        if (!activeExists) activeSection.style.display = 'none';

        if (!engagedExists) {
          engagedSection.style.display = 'none';
        } else {
          engagedContainer.innerHTML = `
            <p>Missed: ${summary.missed}</p>
            <p>Cancelled: ${summary.cancelled}</p>
            <p>Attended: ${summary.attended}</p>
          `;
        }

        // Button event listeners
        container.querySelectorAll('button.cancel, button.reschedule').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.id;
            const action = e.target.classList.contains('cancel') ? 'cancel_intent' : 'reschedule_intent';

            window.voiceflow.chat.interact({
              type: 'intent',
              payload: {
                intent: action,
                entities: {
                  bookingId: bookingId
                }
              }
            });
          });
        });

        // Book another appointment button
        const bookAnotherBtn = container.querySelector('.book-another');
        if (bookAnotherBtn) {
          bookAnotherBtn.addEventListener('click', () => {
            window.voiceflow.chat.interact({
              type: 'intent',
              payload: { name: 'book_consultation' }
            });
          });
        }

      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    }

    await fetchBookings();
  }
}**/

/**export const BookingDashboardExtension = {
  name: 'BookingDashboard',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'booking_dashboard' || trace.payload.name === 'booking_dashboard',
  render: async ({ trace, element }) => {
    const container = document.createElement('div');
    container.id = 'booking-dashboard';

    container.innerHTML = `
      <style>
        #booking-dashboard {
          font-family: 'Nunito', sans-serif;
          padding: 10px;
          font-size: 10px;
        }
        .user-header {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          margin-bottom: 10px;
          font-style: bold;
        }
        .user-header img {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          object-fit: cover;
        }
        .call {
          border: 1px solid #ddd;
          padding: 10px;
          margin: 10px 0;
          border-radius: 5px;
        }
        .active {
          border-left: 3px solid green;
        }
        .engaged {
          border-left: 3px solid red;
        }
        button {
          margin: 5px auto;
          display: block;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 90%;
        }
        button.cancel {
          background-color: rgb(0, 0, 0);
          color: white;
        }
        button.reschedule {
          background-color: #27ae60;
          color: white;
        }
        .book-another {
          margin: 10px auto 0;
          display: block;
          padding: 12px;
          background-color: rgb(65, 23, 189);
          color: white;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          width: 90%;
        }

      
        .carousel {
          position: relative;
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          white-space: wrap;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 10px;
          margin-bottom: 10px;
          box-sizing: border-box;
        }
        .carousel-inner {
          display: inline-flex;
          gap: 15px;
        }
        .carousel-item {
          background: #f7f7f7;
          border-radius: 5px;
          padding: 10px;
          box-sizing: border-box;
          display: inline-block;
          vertical-align: top;
          border: 1px solid #ddd;
        }
      </style>

      <div class="user-header">
        <img src="https://ik.imagekit.io/bushera/profile%20images/01.png?updatedAt=1746351651791" alt="Avatar" />
        <span id="user-name">My Bookings</span>
      </div>

      <div id="active-section">
        <h2>Active Calls</h2>
        <div id="active-calls"></div>
      </div>

      <div id="engaged-section">
        <h2>Engaged History</h2>
        <div id="engaged-calls"></div>
      </div>

      <div class="book-another">+ Add Appointment</div>
    `;

    // Append container FIRST so elements are available in DOM
    element.appendChild(container);

    async function fetchBookings() {
      if (!user_id) {
        console.error("user_id is missing");
        return;
      }

      try {
        const res = await fetch(`/.netlify/functions/get-booking?user_id=${user_id}`);
        const data = await res.json();

        console.log("Fetched booking data:", data);

        if (!data.records || !Array.isArray(data.records)) {
          console.error("No records received from server.");
          return;
        }

        if (!data.records || data.records.length === 0) {
          console.error("No records received from server.");
          return;
        }

        const activeContainer = container.querySelector('#active-calls');
        const engagedContainer = container.querySelector('#engaged-calls');
        const activeSection = container.querySelector('#active-section');
        const engagedSection = container.querySelector('#engaged-section');
        const userNameSpan = container.querySelector('#user-name');

        let activeExists = false;
        let engagedExists = false;

        let summary = {
          missed: 0,
          cancelled: 0,
          attended: 0,
          ended: 0,
        };

        // Create carousel container for active calls
        const carouselWrapper = document.createElement('div');
        carouselWrapper.className = 'carousel';
        const carouselInner = document.createElement('div');
        carouselInner.className = 'carousel-inner';
        carouselWrapper.appendChild(carouselInner);
        activeContainer.appendChild(carouselWrapper);

        data.records.forEach((record) => {
          const booking = {
            bookingId: record.fields.booking_id,
            title: record.fields.title,
            start: record.fields.start_date,
            end: record.fields.end_date,
            location: record.fields.location,
            status: record.fields.status,
            name: record.fields.name,
            url: record.fields.cal_url,
          };

          if (booking.name && userNameSpan.innerText === 'My Bookings') {
            userNameSpan.innerText = `${booking.name}'s Bookings`;
          }

          const startDate = new Date(booking.start);
          const endDate = new Date(booking.end);

          const formattedStart = `${startDate.getDate()} ${startDate.toLocaleString('default', {
            month: 'short',
          })}, ${startDate.getFullYear()} ${startDate.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}`;

          const formattedEnd = endDate.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          });

          if (booking.status === 'ACCEPTED') {
            activeExists = true;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'carousel-item active';

            itemDiv.innerHTML = `
              <h3>${booking.title}</h3>
              <p><b>Timing :</b> ${formattedStart} - ${formattedEnd} </p>
              <p><b>Location :</b> ${booking.location}</p>
              <a href="${booking.url}">Click to Join call via • ${booking.location}</a><br><br>
              <button class="cancel" data-id="${booking.bookingId}" data-title="${booking.title}">Cancel</button>
              <button class="reschedule" data-id="${booking.bookingId}" data-title="${booking.title}">Reschedule</button>
            `;

            carouselInner.appendChild(itemDiv);
          } else {
            engagedExists = true;
            switch (booking.status.toLowerCase()) {
              case 'missed':
                summary.missed++;
                break;
              case 'cancelled':
                summary.cancelled++;
                break;
              case 'attended':
                summary.attended++;
                break;
              case 'ended':
                summary.ended++;
                break;
            }
          }
        });

        if (!activeExists) activeSection.style.display = 'none';

        if (!engagedExists) {
          engagedSection.style.display = 'none';
        } else {
          engagedContainer.innerHTML = `
            <p>Missed: ${summary.missed}</p>
            <p>Cancelled: ${summary.cancelled}</p>
            <p>Attended: ${summary.attended}</p>
          `;
        }

        // Button event listeners
        container.querySelectorAll('button.cancel, button.reschedule').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.id;
            const action = e.target.classList.contains('cancel') ? 'cancel_intent' : 'reschedule_intent';

            window.voiceflow.chat.interact({
              type: 'intent',
              payload: {
                intent: action,
                entities: {
                  bookingId: bookingId
                }
              }
            });
          });
        });

        // Book another appointment button
        const bookAnotherBtn = container.querySelector('.book-another');
        if (bookAnotherBtn) {
          bookAnotherBtn.addEventListener('click', () => {
            window.voiceflow.chat.interact({
              type: 'intent',
              payload: { name: 'book_consultation' }
            });
          });
        }

      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    }

    await fetchBookings();
  }
};**/


export const BookingDashboardExtension = {
  name: 'BookingDashboard',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'booking_dashboard' || trace.payload.name === 'booking_dashboard',
  render: async ({ trace, element }) => {
    const container = document.createElement('div');
    container.id = 'booking-dashboard';

    container.innerHTML = `
      <style>
        #booking-dashboard {
          font-family: 'Nunito', sans-serif;
          padding: 10px;
          font-size: 10px;
        }
        .user-header {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          margin-bottom: 10px;
          font-weight: bold;
        }
        .user-header img {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          object-fit: cover;
        }
        .call {
          border: 1px solid #ddd;
          padding: 10px;
          margin: 10px 0;
          border-radius: 5px;
        }
        .active {
          border-left: 3px solid green;
        }
        .engaged {
          border-left: 3px solid red;
        }
        button {
          margin: 5px auto;
          display: block;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 90%;
        }
        button.cancel {
          background-color: rgb(0, 0, 0);
          color: white;
        }
        button.reschedule {
          background-color: #27ae60;
          color: white;
        }
        .book-another {
          margin: 10px auto 0;
          display: block;
          padding: 12px;
          background-color: rgb(65, 23, 189);
          color: white;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          width: 90%;
        }

        /* Carousel Styles */
        .carousel {
          position: relative;
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          padding-bottom: 10px;
          margin-bottom: 10px;
          box-sizing: border-box;
        }
        .carousel-inner {
          display: flex;
          gap: 15px;
        }
        .carousel-item {
          background: #f7f7f7;
          border-radius: 5px;
          padding: 10px;
          box-sizing: border-box;
          flex: 0 0 80%; /* width relative to container */
          max-width: 80%;
          border: 1px solid #ddd;
          user-select: none;
          vertical-align: top;
        }
        /* Navigation arrows */
        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(255, 255, 255, 0.8);
          border: none;
          cursor: pointer;
          font-size: 24px;
          padding: 5px 10px;
          border-radius: 50%;
          z-index: 10;
          user-select: none;
        }
        .carousel-nav.left {
          left: 5px;
        }
        .carousel-nav.right {
          right: 5px;
        }
      </style>

      <div class="user-header">
        <img src="https://ik.imagekit.io/bushera/profile%20images/01.png?updatedAt=1746351651791" alt="Avatar" />
        <span id="user-name">My Bookings</span>
      </div>

      <div id="active-section">
        <h2>Active Calls</h2>
        <div id="active-calls"></div>
      </div>

      <div id="engaged-section">
        <h2>Engaged History</h2>
        <div id="engaged-calls"></div>
      </div>

      <div class="book-another">+ Add Appointment</div>
    `;

    // Append container FIRST so elements are available in DOM
    element.appendChild(container);

    async function fetchBookings() {
      if (!user_id) {
        console.error("user_id is missing");
        return;
      }

      try {
        const res = await fetch(`/.netlify/functions/get-booking?user_id=${user_id}`);
        const data = await res.json();

        console.log("Fetched booking data:", data);

        if (!data.records || !Array.isArray(data.records) || data.records.length === 0) {
          console.error("No records received from server.");
          return;
        }

        const activeContainer = container.querySelector('#active-calls');
        const engagedContainer = container.querySelector('#engaged-calls');
        const activeSection = container.querySelector('#active-section');
        const engagedSection = container.querySelector('#engaged-section');
        const userNameSpan = container.querySelector('#user-name');

        let activeExists = false;
        let engagedExists = false;

        let summary = {
          missed: 0,
          cancelled: 0,
          attended: 0,
          ended: 0,
        };

        // Clear active calls container before appending
        activeContainer.innerHTML = '';

        // Create carousel container for active calls
        const carouselWrapper = document.createElement('div');
        carouselWrapper.className = 'carousel';
        const carouselInner = document.createElement('div');
        carouselInner.className = 'carousel-inner';
        carouselWrapper.appendChild(carouselInner);
        activeContainer.appendChild(carouselWrapper);

        // Create navigation arrows
        const btnLeft = document.createElement('button');
        btnLeft.className = 'carousel-nav left';
        btnLeft.innerHTML = '&#9664;'; // left arrow

        const btnRight = document.createElement('button');
        btnRight.className = 'carousel-nav right';
        btnRight.innerHTML = '&#9654;'; // right arrow

        carouselWrapper.appendChild(btnLeft);
        carouselWrapper.appendChild(btnRight);

        data.records.forEach((record) => {
          const booking = {
            bookingId: record.fields.booking_id,
            title: record.fields.title,
            start: record.fields.start_date,
            end: record.fields.end_date,
            location: record.fields.location,
            status: record.fields.status,
            name: record.fields.name,
            url: record.fields.cal_url,
          };

          if (booking.name && userNameSpan.innerText === 'My Bookings') {
            userNameSpan.innerText = `${booking.name}'s Bookings`;
          }

          const startDate = new Date(booking.start);
          const endDate = new Date(booking.end);

          const formattedStart = `${startDate.getDate()} ${startDate.toLocaleString('default', {
            month: 'short',
          })}, ${startDate.getFullYear()} ${startDate.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}`;

          const formattedEnd = endDate.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          });

          if (booking.status === 'ACCEPTED') {
            activeExists = true;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'carousel-item active';

            itemDiv.innerHTML = `
              <h3>${booking.title}</h3>
              <p><b>Timing :</b> ${formattedStart} - ${formattedEnd} </p>
              <p><b>Location :</b> ${booking.location}</p>
              <a href="${booking.url}" target="_blank" rel="noopener noreferrer">Click to Join call via • ${booking.location}</a><br><br>
              <button class="cancel" data-id="${booking.bookingId}" data-title="${booking.title}">Cancel</button>
              <button class="reschedule" data-id="${booking.bookingId}" data-title="${booking.title}">Reschedule</button>
            `;

            carouselInner.appendChild(itemDiv);
          } else {
            engagedExists = true;
            switch (booking.status.toLowerCase()) {
              case 'missed':
                summary.missed++;
                break;
              case 'cancelled':
                summary.cancelled++;
                break;
              case 'attended':
                summary.attended++;
                break;
              case 'ended':
                summary.ended++;
                break;
            }
          }
        });

        if (!activeExists) activeSection.style.display = 'none';

        if (!engagedExists) {
          engagedSection.style.display = 'none';
        } else {
          engagedContainer.innerHTML = `
            <p>Missed: ${summary.missed}</p>
            <p>Cancelled: ${summary.cancelled}</p>
            <p>Attended: ${summary.attended}</p>
          `;
        }

        // Button event listeners for Cancel and Reschedule
        container.querySelectorAll('button.cancel, button.reschedule').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.id;
            const action = e.target.classList.contains('cancel') ? 'cancel_intent' : 'reschedule_intent';

            window.voiceflow.chat.interact({
              type: 'intent',
              payload: {
                intent: action,
                entities: {
                  bookingId: bookingId,
                },
              },
            });
          });
        });

        // Book another appointment button
        const bookAnotherBtn = container.querySelector('.book-another');
        if (bookAnotherBtn) {
          bookAnotherBtn.addEventListener('click', () => {
            window.voiceflow.chat.interact({
              type: 'intent',
              payload: { name: 'book_consultation' },
            });
          });
        }

        // Left/right arrow scroll functionality
        btnLeft.addEventListener('click', () => {
          const scrollAmount = carouselInner.querySelector('.carousel-item').offsetWidth + 15;
          carouselWrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        btnRight.addEventListener('click', () => {
          const scrollAmount = carouselInner.querySelector('.carousel-item').offsetWidth + 15;
          carouselWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    }

    await fetchBookings();
  }
};





