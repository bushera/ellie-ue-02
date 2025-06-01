
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

export const bkingcancelExtension = {
  name: 'CalCancelEmbed',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'bking_cancel' || trace.payload?.name === 'bking_cancel',
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
          type: 'cancelled'
        })
      }
    });

    element.appendChild(iframe)
  },
}

export const bkingrescheduleExtension = {
  name: 'CalRescheduleEmbed',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'bking_reschedule' || trace.payload?.name === 'bking_reschedule',
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
          type: 'rescheduled'
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
            Id: record.fields.booking_id,
            Uid: record.fields.Uid,
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
              <button class="cancel" data-uid="${booking.Uid}" data-id="${booking.Id}" data-title="${booking.title}">Cancel</button>
              <button class="reschedule" data-uid="${booking.Uid}" data-id="${booking.Id}" data-title="${booking.title}">Reschedule</button>
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
            const bookingUId = e.target.dataset.uid;
            const bookingTitle = e.target.dataset.title;
            const action = btn.classList.contains('cancel') ? 'bking_cancel' : 'bking_reschedule';

            window.voiceflow.chat.interact({
              type: action,
              payload: {id: bookingId, uid: bookingUId, title: bookingTitle},
             
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


export const QuoteFormExtension = {
  name: 'QuoteForm',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'quote_form' || trace.payload?.name === 'quote_form',

  render: async ({ element }) => {
    const container = document.createElement('div');
    container.id = 'quote-form-container';
    container.style.width = '100%';

    container.innerHTML = `
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
    }

    .swiper-slide {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      height: 100%;
    }

    .card-header {
      font-weight: bold;
      margin-bottom: 12px;
      font-size: 1.1rem;
      color: #222;
    }

    .card-content p {
      margin: 6px 0;
      color: #444;
      font-size: 0.95rem;
    }

    .start-button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 14px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      margin-top: 15px;
      align-self: flex-start;
      transition: background-color 0.3s ease;
    }

    .start-button:hover {
      background-color: #0056b3;
    }

    .swiper-button-next,
    .swiper-button-prev {
      color: #007bff;
      top: 40%;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.7);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      z-index: 10;
      display: none;
    }

    .swiper-button-next:hover,
    .swiper-button-prev:hover {
      background-color: #e0e0e0;
      color: #0056b3;
    }

    @media (max-width: 480px) {
      .start-button {
        width: 90%;
        padding: 10px 12px;
        font-size: 1rem;
      }
    }

    .section-container {
      margin-top: 1rem;
      margin-bottom: 3%; /* Changed from fixed to 5% as requested */
    }

    .todo-swiper{
      margin-bottom: 5%;
    }

    .active-swiper{
      margin-bottom: 5%;
    }


    .done-swiper{
      margin-bottom: 5%;
    }


    .decline-swiper{
      margin-bottom: 5%;
    }


 
  </style>

      <div class="container">
        <div class="progress-bar">
          <div class="progress-bar-fill" id="progressFill"></div>
        </div>
        <div class="progress-label" id="progressText"></div>

        <form id="quoteForm">
          <!-- Steps: Project Type, Company, Timeline, Budget, Extra -->
          <!-- Paste all your HTML form steps here -->
        </form>

        <div id="successMessage">
          <h2>Thank you! Your quote is on its way. </br> </br> Follow up via mail for response</h2></br></br>
          <button id="newSubmissionBtn">Add Another Project</button>
        </div>
      </div>
    `;

    element.appendChild(container);

    const steps = container.querySelectorAll('.step');
    const progressFill = container.querySelector('#progressFill');
    const progressText = container.querySelector('#progressText');
    const prevBtn = container.querySelector('#prevBtn');
    const nextBtn = container.querySelector('#nextBtn');
    const submitBtn = container.querySelector('#submitBtn');
    const form = container.querySelector('#quoteForm');
    const successMessage = container.querySelector('#successMessage');
    const newSubmissionBtn = container.querySelector('#newSubmissionBtn');
    const projectType = container.querySelector('#projectType');
    const customProjectType = container.querySelector('#customProjectType');
    const emailInput = container.querySelector('#email');
    const phoneInput = container.querySelector('#phone');

    let currentStep = 0;

    projectType.addEventListener('change', () => {
      if (projectType.value === 'other') {
        customProjectType.style.display = 'block';
        customProjectType.setAttribute('required', 'required');
      } else {
        customProjectType.style.display = 'none';
        customProjectType.removeAttribute('required');
      }
    });

    emailInput.addEventListener('input', () => {
      const value = emailInput.value;
      emailInput.setCustomValidity((value.includes('@') && value.includes('.') && value.includes('com')) ? '' : 'Enter a valid email with @, ., and com');
    });

    function validateStep() {
      const activeStep = steps[currentStep];
      const inputs = activeStep.querySelectorAll('input, select, textarea');
      for (let input of inputs) {
        if (!input.checkValidity()) return false;
      }
      return true;
    }

    function updateForm() {
      steps.forEach((step, index) => {
        step.classList.toggle('active', index === currentStep);
      });

      const progress = ((currentStep + 1) / steps.length) * 100;
      progressFill.style.width = progress + '%';

      prevBtn.disabled = currentStep === 0;
      nextBtn.style.display = currentStep < steps.length - 1 ? 'inline-block' : 'none';
      submitBtn.style.display = currentStep === steps.length - 1 ? 'inline-block' : 'none';

      nextBtn.disabled = !validateStep();
    }

    form.addEventListener('input', () => {
      nextBtn.disabled = !validateStep();
    });

    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        updateForm();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (validateStep() && currentStep < steps.length - 1) {
        currentStep++;
        updateForm();
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        projectType: projectType.value === 'other' ? customProjectType.value : projectType.value,
        companyName: container.querySelector('#companyName').value,
        email: emailInput.value,
        phone: phoneInput.value,
        timeline: container.querySelector('#timeline').value,
        budget: container.querySelector('#budget').value,
        extraDetails: container.querySelector('#extraDetails').value,
        User_ID: user_id,
      };

      try {
        await fetch('https://api.airtable.com/v0/appAtnhxiXYiC9Can/Projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer patT2ZtryQSA2JzpX.75d12024b136349527032e8fc46f45c3c79635c651891d34bd9fbe8047c85448'
          },
          body: JSON.stringify({ fields: data })
        });

        form.style.display = 'none';
        successMessage.style.display = 'block';
      } catch (error) {
        alert('There was an error submitting the form.');
        console.error(error);
      }
    });

    newSubmissionBtn.addEventListener('click', () => {
      form.reset();
      form.style.display = 'block';
      successMessage.style.display = 'none';
      customProjectType.style.display = 'none';
      currentStep = 0;
      updateForm();
    });

    updateForm();
  }
};



