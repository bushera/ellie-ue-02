
export const CalExtension = {
  name: 'CalEmbed',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_cal' || trace.payload?.name === 'ext_cal',
  render: ({ trace, element }) => {
    const { CalUrl, height, width } = trace.payload


    const iframe = document.createElement('iframe')
    iframe.src = CalUrl || 'https://cal.com/bushera/book-a-consultation',
    iframe.height = height || '320'
    iframe.width = width || '280'
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
          type: 'booked'
        })
      }
    });

    element.appendChild(iframe)
  },
}


let user_id = 'UE_000';

document.addEventListener('userIdentified', (e) => {
  user_id = e.detail.userId || 'UE_000';
  console.log('[extensions.js] Using the userIdentified event with userId:', user_id);
});




export const BookingDashboardExtension = {
  name: 'BookingDashboard',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'booking_dashboard' || trace.payload?.name === 'booking_dashboard',
  render: async ({ trace, element }) => {
    const container = document.createElement('div');
    container.id = 'booking-dashboard';
    container.style.width = '240';
   
 
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
            bookingUid: record.fields.Uid,
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
              <button class="cancel" data-id="${booking.bookingUid}" data-title="${booking.title}">Cancel</button>
              <button class="reschedule" data-id="${booking.bookingUid}" data-title="${booking.title}">Reschedule</button>
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
            <p>Ended: ${summary.ended}</p>
            <p>Cancelled: ${summary.cancelled}</p>
          `;
        }

        const actionButtons = container.querySelectorAll('button.cancel, button.reschedule');
        actionButtons.forEach((btn) => {
          btn.addEventListener('click', (e) => {
            container.style.display = 'none';
            const bookingId = e.target.dataset.id;
            const action = btn.classList.contains('cancel') ? 'bking_cancel' : 'bking_reschedule';

            window.voiceflow.chat.interact({
              type: action,
              payload: {name: 'stan'},
             
            });
          });
        });

        const bookAnotherBtn = container.querySelector('.book-another');
        if (bookAnotherBtn) {
          bookAnotherBtn.addEventListener('click', () => {
            container.style.display = 'none';
            window.voiceflow.chat.interact({
              type: 'booking'
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




