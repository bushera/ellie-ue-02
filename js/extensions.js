
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

        
        .carousel {
          position: relative;
          width: 100%;
          overflow: hidden; 
          box-sizing: border-box;
          margin-bottom: 15px;
        }
        .carousel-inner {
          display: flex;
          gap: 15px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding-bottom: 10px;
          -webkit-overflow-scrolling: touch; 
        }
        .carousel-item {
          background: #f7f7f7;
          border-radius: 5px;
          padding: 10px;
          box-sizing: border-box;
          flex: 0 0 250px; 
          border: 1px solid #ddd;
          user-select: none; 
        }

        
        .carousel-inner::-webkit-scrollbar {
          display: none;
        }
        .carousel-inner {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        
        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(0,0,0,0.3);
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .carousel-nav:hover {
          background-color: rgba(0,0,0,0.6);
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

    element.appendChild(container);

    async function fetchBookings() {
      if (!user_id) {
        console.error("user_id is missing");
        return;
      }

      try {
        const res = await fetch(`/.netlify/functions/get-booking?user_id=${user_id}`);
        const data = await res.json();

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

        // Clear activeContainer and build carousel wrapper
        activeContainer.innerHTML = '';
        const carouselWrapper = document.createElement('div');
        carouselWrapper.className = 'carousel';

        // Navigation buttons
        const btnLeft = document.createElement('button');
        btnLeft.className = 'carousel-nav left';
        btnLeft.innerHTML = '&#9664;'; // left arrow
        const btnRight = document.createElement('button');
        btnRight.className = 'carousel-nav right';
        btnRight.innerHTML = '&#9654;'; // right arrow

        carouselWrapper.appendChild(btnLeft);
        carouselWrapper.appendChild(btnRight);

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

        // Carousel navigation handlers
        const scrollAmount = 270; // width of one item + gap (250 + 15 approx)

        btnLeft.addEventListener('click', () => {
          carouselInner.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        btnRight.addEventListener('click', () => {
          carouselInner.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        // Swipe support
        let isDown = false;
        let startX;
        let scrollLeft;

        carouselInner.addEventListener('mousedown', (e) => {
          isDown = true;
          carouselInner.classList.add('active');
          startX = e.pageX - carouselInner.offsetLeft;
          scrollLeft = carouselInner.scrollLeft;
          e.preventDefault();
        });
        carouselInner.addEventListener('mouseleave', () => {
          isDown = false;
          carouselInner.classList.remove('active');
        });
        carouselInner.addEventListener('mouseup', () => {
          isDown = false;
          carouselInner.classList.remove('active');
        });
        carouselInner.addEventListener('mousemove', (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - carouselInner.offsetLeft;
          const walk = (x - startX) * 1; //scroll-fast
          carouselInner.scrollLeft = scrollLeft - walk;
        });

        // Touch events for mobile swipe
        carouselInner.addEventListener('touchstart', (e) => {
          startX = e.touches[0].pageX - carouselInner.offsetLeft;
          scrollLeft = carouselInner.scrollLeft;
        });
        carouselInner.addEventListener('touchmove', (e) => {
          const x = e.touches[0].pageX - carouselInner.offsetLeft;
          const walk = (x - startX);
          carouselInner.scrollLeft = scrollLeft - walk;
        });

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
          border-left: 5px solid green;
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
          overflow: hidden;
          box-sizing: border-box;
          margin-bottom: 15px;
        }
        .carousel-inner {
          display: flex;
          gap: 15px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding-bottom: 10px;
          -webkit-overflow-scrolling: touch;
        }
        .carousel-item {
          background: #f7f7f7;
          border-radius: 5px;
          padding: 10px;
          box-sizing: border-box;
          flex: 0 0 250px;
          border: 1px solid #ddd;
          user-select: none;
        }
        .carousel-inner::-webkit-scrollbar {
          display: none;
        }
        .carousel-inner {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(0,0,0,0.3);
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .carousel-nav:hover {
          background-color: rgba(0,0,0,0.6);
        }
        .carousel-nav.left {
          left: 5px;
        }
        .carousel-nav.right {
          right: 5px;
        }

        #active-section {
          width: 100%;
          box-sizing: border-box;
          padding: 10px;
          border-left: 5px solid green;
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

    element.appendChild(container);

    async function fetchBookings() {
      if (!user_id) {
        console.error("user_id is missing");
        return;
      }

      try {
        const res = await fetch(`/.netlify/functions/get-booking?user_id=${user_id}`);
        const data = await res.json();

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

        activeContainer.innerHTML = '';
        const carouselWrapper = document.createElement('div');
        carouselWrapper.className = 'carousel';

        const btnLeft = document.createElement('button');
        btnLeft.className = 'carousel-nav left';
        btnLeft.innerHTML = '&#9664;';
        const btnRight = document.createElement('button');
        btnRight.className = 'carousel-nav right';
        btnRight.innerHTML = '&#9654;';

        carouselWrapper.appendChild(btnLeft);
        carouselWrapper.appendChild(btnRight);

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

        const scrollAmount = 270;
        btnLeft.addEventListener('click', () => {
          carouselInner.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        btnRight.addEventListener('click', () => {
          carouselInner.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        let isDown = false;
        let startX;
        let scrollLeft;

        carouselInner.addEventListener('mousedown', (e) => {
          isDown = true;
          startX = e.pageX - carouselInner.offsetLeft;
          scrollLeft = carouselInner.scrollLeft;
          e.preventDefault();
        });
        carouselInner.addEventListener('mouseleave', () => {
          isDown = false;
        });
        carouselInner.addEventListener('mouseup', () => {
          isDown = false;
        });
        carouselInner.addEventListener('mousemove', (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - carouselInner.offsetLeft;
          const walk = (x - startX);
          carouselInner.scrollLeft = scrollLeft - walk;
        });

        carouselInner.addEventListener('touchstart', (e) => {
          startX = e.touches[0].pageX - carouselInner.offsetLeft;
          scrollLeft = carouselInner.scrollLeft;
        });
        carouselInner.addEventListener('touchmove', (e) => {
          const x = e.touches[0].pageX - carouselInner.offsetLeft;
          const walk = (x - startX);
          carouselInner.scrollLeft = scrollLeft - walk;
        });

        container.querySelectorAll('button.cancel, button.reschedule').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.id;
            const action = e.target.classList.contains('cancel') ? 'cancel_intent' : 'reschedule_intent';

            window.voiceflow.chat.interact({
              type: 'intent',
              payload: {
                intent: action,
                entities: { bookingId }
              }
            });
          });
        });

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

    element.appendChild(container);

    async function fetchBookings() {
      if (!user_id) {
        console.error("user_id is missing");
        return;
      }

      try {
        const res = await fetch(`/.netlify/functions/get-booking?user_id=${user_id}`);
        const data = await res.json();

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

        activeContainer.innerHTML = '';

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
            itemDiv.className = 'call active';

            itemDiv.innerHTML = `
              <h3>${booking.title}</h3>
              <p><b>Timing :</b> ${formattedStart} - ${formattedEnd} </p>
              <p><b>Location :</b> ${booking.location}</p>
              <a href="${booking.url}" target="_blank" rel="noopener noreferrer">Click to Join call via • ${booking.location}</a><br><br>
              <button class="cancel" data-id="${booking.bookingId}" data-title="${booking.title}">Cancel</button>
              <button class="reschedule" data-id="${booking.bookingId}" data-title="${booking.title}">Reschedule</button>
            `;

            activeContainer.appendChild(itemDiv);
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
};




