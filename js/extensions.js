
export const CalExtension = {
  name: 'CalEmbed',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_cal' || trace.payload.name === 'ext_cal',
  render: ({ trace, element }) => {
    const { CalUrl, height, width } = trace.payload


    const iframe = document.createElement('iframe')
    iframe.src = CalUrl || 'https://cal.com/bushera/consultation-time',
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
          font-family: sans-serif;
          padding: 10px;
          width : 320;
          font-size: 10px;
        }
        .user-header {
          display: flex;
          align-items: center;
          gap: 10px;
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
          border-left: 5px solid gray;
        }
        button {
          margin: 5px;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
        }
        button.cancel {
          background-color:rgb(0, 0, 0);
          color: white;
        }
        button.reschedule {
          background-color: #27ae60;
          color: white;
        }
        .book-another {
          width: 1000%;
          margin: 10px auto 0;
          display: block;
          padding: 12px;
          background-color:rgb(65, 23, 189);
          color: white;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
        }
      </style>

      <div class="user-header">
        <img src="https://ik.imagekit.io/bushera/profile%20images/02.png?updatedAt=1746351651791" alt="Avatar" />
        <span>Stanley</span>
      </div>

      <h2>Active Calls</h2>
      <div id="active-calls"></div>

      <h2>Calls You've Engaged</h2>
      <div id="engaged-calls"></div>

      <button class="book-another">Book Another Appointment</button>
    `;

    async function fetchBookings() {
      const AIRTABLE_API_KEY = 'patT2ZtryQSA2JzpX.75d12024b136349527032e8fc46f45c3c79635c651891d34bd9fbe8047c85448';
      const BASE_ID = 'appAtnhxiXYiC9Can';
      const TABLE_NAME = 'Booking_Consultation';

      const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
      });
      const data = await res.json();

      const activeContainer = container.querySelector('#active-calls');
      const engagedContainer = container.querySelector('#engaged-calls');

      data.records.forEach(record => {
        const booking = {
          bookingId: record.fields.booking_id,
          title: record.fields.title,
          start: record.fields.Start,
          location: record.fields.location,
          status: record.fields.status,
        };

        const div = document.createElement('div');
        div.className = `call ${booking.status}`;
        div.innerHTML = `
          <h3>${booking.title}</h3>
          <p>${booking.start} • ${booking.location}</p>
          ${booking.status === 'ACCEPTED' ? `
            <button class="cancel" data-id="${booking.bookingId}" data-title="${booking.title}">Cancel</button>
            <button class="reschedule" data-id="${booking.bookingId}" data-title="${booking.title}">Reschedule</button>
          ` : ''}
        `;

        if (booking.status === 'ACCEPTED') {
          activeContainer.appendChild(div);
        } else if (booking.status === 'engaged') {
          engagedContainer.appendChild(div);
        }
      });

      container.querySelectorAll('button.cancel, button.reschedule').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.target.classList.contains('cancel') ? 'cancel' : 'reschedule';
          const payload = {
            type: 'intent',
            payload: {
              query: `${action}_intent`,
              data: {
                callTitle: e.target.dataset.title,
                bookingId: e.target.dataset.id,
              },
            },
          };
          window.voiceflow.chat.interact(payload);
        });
      });
    }

    const bookAnotherBtn = container.querySelector('.book-another');
    bookAnotherBtn.addEventListener('click', () => {
      window.voiceflow.chat.interact({
        type: 'intent',
        payload: {
          query: 'Book consultation'
        }
      });
    });

    await fetchBookings();
    element.appendChild(container);
  },
};

