
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
        }
        button.cancel {
          background-color: #e74c3c;
          color: white;
        }
        button.reschedule {
          background-color: #27ae60;
          color: white;
        }
      </style>

      <div class="user-header">
        <img src="https://via.placeholder.com/40" alt="Avatar" />
        <span>John Doe</span>
      </div>

      <h2>Active Calls</h2>
      <div id="active-calls"></div>

      <h2>Calls You've Engaged</h2>
      <div id="engaged-calls"></div>
    `;

    async function fetchBookings() {
      const AIRTABLE_API_KEY = 'YOUR_AIRTABLE_API_KEY';
      const BASE_ID = 'YOUR_BASE_ID';
      const TABLE_NAME = 'Bookings';

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
          date: record.fields.date,
          time: record.fields.time,
          location: record.fields.location,
          status: record.fields.status,
        };

        const div = document.createElement('div');
        div.className = `call ${booking.status}`;
        div.innerHTML = `
          <h3>${booking.title}</h3>
          <p>${booking.date} • ${booking.time} • ${booking.location}</p>
          ${booking.status === 'active' ? `
            <button class="cancel" data-id="${booking.bookingId}" data-title="${booking.title}">Cancel</button>
            <button class="reschedule" data-id="${booking.bookingId}" data-title="${booking.title}">Reschedule</button>
          ` : ''}
        `;

        if (booking.status === 'active') {
          activeContainer.appendChild(div);
        } else if (booking.status === 'engaged') {
          engagedContainer.appendChild(div);
        }
      });

      container.querySelectorAll('button.cancel, button.reschedule').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.target.classList.contains('cancel') ? 'cancel' : 'reschedule';
          const payload = {
            type: 'custom',
            payload: {
              event: `${action}_clicked`,
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

    await fetchBookings();
    element.appendChild(container);
  },
};

