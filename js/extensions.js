
export const CalExtension = {
  name: 'CalEmbed',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_cal' || trace.payload?.name === 'ext_cal',
  render: ({ trace, element }) => {
    const { CalUrl, height, width } = trace.payload


    const iframe = document.createElement('iframe')
    iframe.src = CalUrl || 'https://cal.com/unlimitedexposure/book-a-consultation',
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
    iframe.src = CalUrl || 'https://cal.com/unlimitedexposure/book-a-consultation',
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
    iframe.src = CalUrl || 'https://cal.com/unlimitedexposure/book-a-consultation',
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
            <p>No. of sessions ended: ${summary.ended}</p>
            <p>No. of cancelled sessions: ${summary.cancelled}</p>
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


export const BookingDashboardByEmailExtension = {
  name: 'BookingDashboardByEmail',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'booking_dashboard_email' || trace.payload?.name === 'booking_dashboard_email',
  render: async ({ trace, element }) => {
    const { email } = trace.payload;
    const container = document.createElement('div');
    container.id = 'booking-dashboard-email';
    container.style.width = '240';
   
 
    container.innerHTML = `
      <style>
        #booking-dashboard-email {
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
      if (!email) {
        console.error("email is missing");
        return;
      }

      try {
        const res = await fetch(`/.netlify/functions/get-booking-email?email=${email}`);
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
            <p>No. of sessions ended: ${summary.ended}</p>
            <p>No. of cancelled sessions: ${summary.cancelled}</p>
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



/**export const QuoteFormExtension = {
  name: 'QuoteForm',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'quote_form' || trace.payload?.name === 'quote_form',

  render: async ({ element }) => {
  
    const container = document.createElement('div');
    container.className = 'quote-form-container';

    container.innerHTML = `
    <style >
        .quote-form-container {
          font-family: 'Trebuchet MS', sans-serif;
          background: #f4f4f4;
          display: flex;
          justify-content: center;
          padding: 5px;
          font-size: 14px;
        }

        .quote-form-wrapper {
          background: #fff;
          padding: 10px;
          border-radius: 12px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          box-sizing: border-box;
        }

        .progress-bar {
          height: 4px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .progress-bar-fill {
          height: 100%;
          background: #000;
          width: 0%;
          transition: width 0.3s ease;
        }

        .step { display: none; }
        .step.active { display: block; border: none; }

        .buttons {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 20px;
        }

        #prevBtn, #nextBtn, #submitBtn, #newSubmissionBtn {
          padding: 10px 20px;
          border: none;
          background: #3300ff;
          color: white;
          border-radius: 5px;
          cursor: pointer;
          flex: 1;
          min-width: 120px;
        }

        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .progress-label {
          text-align: right;
          font-size: 12px;
          color: #666;
        }

        #quoteForm input,
        #quoteForm select,
        #quoteForm textarea{
          width: 100%;
          padding: 10px;
          margin-top: 8px;
          margin-bottom: 16px;
          border: 1px solid #ccc;
          border-radius: 5px;
          box-sizing: border-box;
          font-size: 14px;
        }

        #successMessage {
          display: none;
          text-align: center;
        }

        #successMessage h2 {
          color: #151515;
          font-size: 16px;
        }

        #newSubmissionBtn {
          width: 90%;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .quote-form-wrapper { padding: 20px; }
          .buttons { flex-direction: column; align-items: stretch; }
        }

        @media (max-width: 480px) {
          .quote-form-wrapper { padding: 15px; }
          input, select, textarea { font-size: 13px; }
          .progress-label { font-size: 11px; }
          #successMessage h2 { font-size: 14px; }
        }
    </style>
      <div class="quote-form-wrapper">
        <div class="progress-bar"><div class="progress-bar-fill" id="progressFill"></div></div>
        <div class="progress-label" id="progressText"></div>

        <form id="quoteForm">
          <div class="step active">
            <h2>Project Type</h2>
            <label>What type of project?</label>
            <select id="projectType" required>
              <option value="">Select a project type</option>
              <option value="seo">SEO</option>
              <option value="local_seo">Local SEO</option>
              <option value="mobile_app_dev">Mobile App Development</option>
              <option value="web_dev">Web Development</option>
              <option value="content_marketing">Content Marketing</option>
              <option value="influencer_marketing">Influencer Marketing</option>
              <option value="video_marketing">Video Marketing</option>
              <option value="inbound_marketing">Inbound Marketing</option>
              <option value="internet_marketing">Internet Marketing</option>
              <option value="branding">Branding</option>
              <option value="ecommerce">E-commerce</option>
              <option value="social_media_optimization">Social Media Optimization</option>
              <option value="crm">CRM</option>
              <option value="gpt_ai_chatbot">GPT & AI Chatbot</option>
              <option value="google_ads">Google Ads</option>
              <option value="other">Other</option>
            </select>
            <input type="text" id="customProjectType" placeholder="Please specify" style="display:none;" />
          </div>

          <div class="step">
            <h2>Company Details</h2>
            <input type="text" id="companyName" placeholder="Company/Business Name" required />
            <input type="email" id="email" placeholder="Email Address" required />
            <label>Phone Number (Optional)</label>
            <input type="tel" id="phone" placeholder="+1234567890" />
          </div>

          <div class="step">
            <h2>Project Timeline</h2>
            <label>When would you want this project delivered?</label>
            <select id="timeline" required>
              <option value="">Select a time</option>
              <option value="yesterday">Yesterday</option>
              <option value="lessThan_30_days">Less than 30 days</option>
              <option value="Next_30_days">Next 30 days</option>
              <option value="Next_60_days">Next 60 days</option>
              <option value="unsure">Not yet sure</option>
            </select>
          </div>

          <div class="step">
            <h2>Budget</h2>
            <label>What is your budget?</label>
            <select id="budget" required>
              <option value="">Select a budget</option>
              <option value="lessThan_$2k">Less than $2k</option>
              <option value="$2k_$5k">$2k - $5k</option>
              <option value="$5k_$10k">$5k - $10k</option>
              <option value="$10k_plus">$10k+</option>
              <option value="undefined">Not defined</option>
            </select>
          </div>

          <div class="step">
            <h2>Extra Details (Optional)</h2>
            <textarea id="extraDetails" placeholder="Any extra information you'd like us to know?"></textarea>
          </div>

          <div class="buttons">
            <button type="button" id="prevBtn" disabled>Back</button>
            <button type="button" id="nextBtn">Next</button>
            <button type="submit" id="submitBtn" style="display:none;">Submit</button>
          </div>
        </form>

        <div id="successMessage">
          <h2>Thank you! Your quote is on its way.<br><br>Follow up via email for a response.</h2>
          <button id="newSubmissionBtn">Add Another Project</button>
        </div>
      </div>
    `;

    element.appendChild(container);

    // Element references
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

    // Toggle custom project type
    projectType.addEventListener('change', () => {
      if (projectType.value === 'other') {
        customProjectType.style.display = 'block';
        customProjectType.setAttribute('required', 'required');
      } else {
        customProjectType.style.display = 'none';
        customProjectType.removeAttribute('required');
      }
    });

    // Basic email validation
    emailInput.addEventListener('input', () => {
      const value = emailInput.value;
      emailInput.setCustomValidity(
        value.includes('@') && value.includes('.') && value.includes('com')
          ? ''
          : 'Enter a valid email with @, ., and com'
      );
    });

    const validateStep = () => {
      const activeStep = steps[currentStep];
      const inputs = activeStep.querySelectorAll('input, select, textarea');
      return Array.from(inputs).every(input => input.checkValidity());
    };

    const updateForm = () => {
      steps.forEach((step, idx) => step.classList.toggle('active', idx === currentStep));
      progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
      prevBtn.disabled = currentStep === 0;
      nextBtn.style.display = currentStep < steps.length - 1 ? 'inline-block' : 'none';
      submitBtn.style.display = currentStep === steps.length - 1 ? 'inline-block' : 'none';
      nextBtn.disabled = !validateStep();
    };

    form.addEventListener('input', () => {
      nextBtn.disabled = !validateStep();
    });

    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) currentStep--;
      updateForm();
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
        User_ID: user_id,
        projectType: projectType.value === 'other' ? customProjectType.value : projectType.value,
        companyName: container.querySelector('#companyName').value,
        email: emailInput.value,
        phone: phoneInput.value,
        timeline: container.querySelector('#timeline').value,
        budget: container.querySelector('#budget').value,
        extraDetails: container.querySelector('#extraDetails').value,
      };

      container.style.display = 'none';

      window.voiceflow.chat.interact({
              type: 'projctCreated',
              payload: {projectType: data.projectType, companyName: data.companyName, timeline: data.timeline, budget:data.budget},
             
            });


      try {
        await fetch('https://api.airtable.com/v0/appAtnhxiXYiC9Can/Projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer patT2ZtryQSA2JzpX.75d12024b136349527032e8fc46f45c3c79635c651891d34bd9fbe8047c85448'
          },
          body: JSON.stringify({ fields: data })
        });     
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
};**/


export const QuoteFormExtension = {
  name: 'QuoteForm',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'quote_form' || trace.payload?.name === 'quote_form',

  render: async ({ element }) => {
  
    const container = document.createElement('div');
    container.className = 'quote-form-container';

    container.innerHTML = `
    <style >
        .quote-form-container {
          font-family: 'Trebuchet MS', sans-serif;
          background: #f4f4f4;
          display: flex;
          justify-content: center;
          padding: 5px;
          font-size: 14px;
        }

        .quote-form-wrapper {
          background: #fff;
          padding: 10px;
          border-radius: 12px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          box-sizing: border-box;
        }

        .progress-bar {
          height: 4px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .progress-bar-fill {
          height: 100%;
          background: #000;
          width: 0%;
          transition: width 0.3s ease;
        }

        .step { display: none; }
        .step.active { display: block; border: none; }

        .buttons {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 20px;
        }

        #prevBtn, #nextBtn, #submitBtn, #newSubmissionBtn {
          padding: 10px 20px;
          border: none;
          background: #3300ff;
          color: white;
          border-radius: 5px;
          cursor: pointer;
          flex: 1;
          min-width: 120px;
        }

        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .progress-label {
          text-align: right;
          font-size: 12px;
          color: #666;
        }

        #quoteForm input,
        #quoteForm select,
        #quoteForm textarea{
          width: 100%;
          padding: 10px;
          margin-top: 8px;
          margin-bottom: 16px;
          border: 1px solid #ccc;
          border-radius: 5px;
          box-sizing: border-box;
          font-size: 14px;
        }

        #successMessage {
          display: none;
          text-align: center;
        }

        #successMessage h2 {
          color: #151515;
          font-size: 16px;
        }

        #newSubmissionBtn {
          width: 90%;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .quote-form-wrapper { padding: 20px; }
          .buttons { flex-direction: column; align-items: stretch; }
        }

        @media (max-width: 480px) {
          .quote-form-wrapper { padding: 15px; }
          input, select, textarea { font-size: 13px; }
          .progress-label { font-size: 11px; }
          #successMessage h2 { font-size: 14px; }
        }
    </style>
      <div class="quote-form-wrapper">
        <div class="progress-bar"><div class="progress-bar-fill" id="progressFill"></div></div>
        <div class="progress-label" id="progressText"></div>

        <form id="quoteForm">
          <div class="step active">
            <h2>Project Type</h2>
            <label>What type of project?</label>
            <select id="projectType" required>
              <option value="">Select a project type</option>
              <option value="seo">SEO</option>
              <option value="local_seo">Local SEO</option>
              <option value="mobile_app_dev">Mobile App Development</option>
              <option value="web_dev">Web Development</option>
              <option value="content_marketing">Content Marketing</option>
              <option value="influencer_marketing">Influencer Marketing</option>
              <option value="video_marketing">Video Marketing</option>
              <option value="inbound_marketing">Inbound Marketing</option>
              <option value="internet_marketing">Internet Marketing</option>
              <option value="branding">Branding</option>
              <option value="ecommerce">E-commerce</option>
              <option value="social_media_optimization">Social Media Optimization</option>
              <option value="crm">CRM</option>
              <option value="gpt_ai_chatbot">GPT & AI Chatbot</option>
              <option value="google_ads">Google Ads</option>
              <option value="other">Other</option>
            </select>
            <input type="text" id="customProjectType" placeholder="Please specify" style="display:none;" />
          </div>

          <div class="step">
            <h2>Company Details</h2>
            <input type="text" id="companyName" placeholder="Company/Business Name" required />
            <input type="email" id="email" placeholder="Email Address" required />
            <label>Phone Number (Optional)</label>
            <input type="tel" id="phone" placeholder="+1234567890" />
          </div>

          <div class="step">
            <h2>Project Timeline</h2>
            <label>When would you want this project delivered?</label>
            <select id="timeline" required>
              <option value="">Select a time</option>
              <option value="yesterday">Yesterday</option>
              <option value="lessThan_30_days">Less than 30 days</option>
              <option value="Next_30_days">Next 30 days</option>
              <option value="Next_60_days">Next 60 days</option>
              <option value="unsure">Not yet sure</option>
            </select>
          </div>

          <div class="step">
            <h2>Budget</h2>
            <label>What is your budget?</label>
            <select id="budget" required>
              <option value="">Select a budget</option>
              <option value="lessThan_$2k">Less than $2k</option>
              <option value="$2k_$5k">$2k - $5k</option>
              <option value="$5k_$10k">$5k - $10k</option>
              <option value="$10k_plus">$10k+</option>
              <option value="undefined">Not defined</option>
            </select>
          </div>

          <div class="step">
            <h2>Extra Details (Optional)</h2>
            <textarea id="extraDetails" placeholder="Any extra information you'd like us to know?"></textarea>
          </div>

          <div class="buttons">
            <button type="button" id="prevBtn" disabled>Back</button>
            <button type="button" id="nextBtn">Next</button>
            <button type="submit" id="submitBtn" style="display:none;">Submit</button>
          </div>
        </form>

        <div id="successMessage">
          <h2>Thank you! Your quote is on its way.<br><br>Follow up via email for a response.</h2>
          <button id="newSubmissionBtn">Add Another Project</button>
        </div>
      </div>
    `;

    element.appendChild(container);

    // Element references
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

    // Toggle custom project type
    projectType.addEventListener('change', () => {
      if (projectType.value === 'other') {
        customProjectType.style.display = 'block';
        customProjectType.setAttribute('required', 'required');
      } else {
        customProjectType.style.display = 'none';
        customProjectType.removeAttribute('required');
      }
    });

    // Basic email validation
    emailInput.addEventListener('input', () => {
      const value = emailInput.value;
      emailInput.setCustomValidity(
        value.includes('@') && value.includes('.') && value.includes('com')
          ? ''
          : 'Enter a valid email with @, ., and com'
      );
    });

    const validateStep = () => {
      const activeStep = steps[currentStep];
      const inputs = activeStep.querySelectorAll('input, select, textarea');
      return Array.from(inputs).every(input => input.checkValidity());
    };

    const updateForm = () => {
      steps.forEach((step, idx) => step.classList.toggle('active', idx === currentStep));
      progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
      prevBtn.disabled = currentStep === 0;
      nextBtn.style.display = currentStep < steps.length - 1 ? 'inline-block' : 'none';
      submitBtn.style.display = currentStep === steps.length - 1 ? 'inline-block' : 'none';
      nextBtn.disabled = !validateStep();
    };

    form.addEventListener('input', () => {
      nextBtn.disabled = !validateStep();
    });

    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) currentStep--;
      updateForm();
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
        User_ID: user_id,
        projectType: projectType.value === 'other' ? customProjectType.value : projectType.value,
        companyName: container.querySelector('#companyName').value,
        email: emailInput.value,
        phone: phoneInput.value,
        timeline: container.querySelector('#timeline').value,
        budget: container.querySelector('#budget').value,
        extraDetails: container.querySelector('#extraDetails').value,
      };


      container.style.display = 'none';
      window.voiceflow.chat.interact({
              type: 'projctCreated',
              payload: {projectType: data.projectType, companyName: data.companyName, timeline: data.timeline, budget:data.budget},
             
            });


      try {
    const res = await fetch('/.netlify/functions/create-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Function error ${res.status}`);

    
  } catch (err) {
    alert('There was an error submitting the form.');
    console.error(err);
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


export const ProjectDashboardExtension = {
  name: 'ProjectDashboard',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'project_dashboard' || trace.payload?.name === 'project_dashboard',

  render: async ({ element }) => {
    const container = document.createElement('div');
    container.id = 'project-dashboard';

  
    container.innerHTML = `
      <style>
    { box-sizing: border-box; }

       body {
        font-family: Arial, sans-serif;
        background: #f5f5f5;
        font-size: 10px;
        margin: 0;
        padding: 0;
      }

      .container {
        width: 90%;
        max-width: 1200px;
        margin: 1rem auto;
      }

      .section-container-primary {
        background: #fff;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 1rem;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        border-left: 3px solid #007bff;
      }

      .section-container-warning { 
        background: #fff;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 1rem;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        border-left: 3px solid #ffc107; }

      .section-container-success { 
        background: #fff;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 1rem;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        border-left: 3px solid #28a745; }

      .section-container-danger { 
        background: #fff;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 1rem;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        border-left: 3px solid #dc3545; }

      h2 {
        font-size: .95rem;
        margin-bottom: 15px;
      }

      .swiper-slide {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        margin-right: 15px;
        margin-bottom: 12px;
      }

      .card-header {
        font-weight: bold;
        font-size: .75rem;
        margin-bottom: 10px;
        color: #222;
      }

      .card-content p {
        margin: 5px 0;
        font-size: 0.65rem;
        color: #444;
      }

      .btn {
        padding: 10px 16px;
        border-radius: 6px;
        font-size: .85rem;
        cursor: pointer;
        border: none;
        transition: background 0.3s ease;
        margin-top: 10px;
        width: 100%;
      }

      .btn-primary {
        background: #007bff;
        color: #fff;
      }

      .btn-primary:hover {
        background: #0056b3;
      }

      .btn-success {
        background: #28a745;
        color: #fff;
      }

      .btn-success:hover {
        background: #218838;
      }

      .text-center {
        text-align: center;
      }

      .swiper-button-next,
      .swiper-button-prev,
      .swiper-pagination {
        display: none;
      }

      @media (max-width: 480px) {
        .btn {
          width: 100%;
          font-size: 0.85rem;
        }
      }
  </style>
      <div class="container-fluid py-4 mychat">
        <div class="container">
          <!-- To Do -->
          <div class="row section-container-primary border-start border-primary border-5 ps-3 bg-white rounded shadow-sm">
            <div class="col-12">
              <h2 class="h4 h2-md mt-5 mb-4 mb-3 text-primary">Projects To Do</h2>
              <div class="swiper todo-swiper">
                <div class="swiper-wrapper" id="todo-carousel"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-pagination"></div>
              </div>
            </div>
          </div>

          <!-- Active -->
          <div class="row section-container-warning border-start border-warning border-5 ps-3 bg-white rounded shadow-sm">
            <div class="col-12">
              <h2 class="h4 h2-md mt-5 mb-4 text-warning">Active Projects</h2>
              <div class="swiper active-swiper">
                <div class="swiper-wrapper" id="active-carousel"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-pagination"></div>
              </div>
            </div>
          </div>

          <!-- Done -->
          <div class="row section-container-success border-start border-success border-5 ps-3 bg-white rounded shadow-sm">
            <div class="col-12">
              <h2 class="h4 h2-md mt-5 mb-4 text-success">Projects Done</h2>
              <div class="swiper done-swiper">
                <div class="swiper-wrapper" id="done-carousel"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-pagination"></div>
              </div>
            </div>
          </div>

          <!-- Declined -->
          <div class="row section-container-danger border-start border-danger border-5 ps-3 bg-white rounded shadow-sm">
            <div class="col-12">
              <h2 class="h4 h2-md mt-5 mb-4 text-danger">Declined Projects</h2>
              <div class="card bg-light border border-danger p-3 decline-swiper">
                <p class="mb-0"><strong>Declined Projects:</strong> <span id="declined-count">0</span></p>
              </div>
            </div>
          </div>

          <!-- New Project Button -->
          <div class="text-center">
            <button class="newProjectBtn btn btn-success btn-lg w-100 w-md-auto" id="newProjectBtn">+ New Project</button>
          </div>
        </div>
      </div>
    `;

    element.appendChild(container);



    // Add Bootstrap and Swiper styles correctly
const bootstrapLink = document.createElement('link');
bootstrapLink.rel = 'stylesheet';
bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
document.head.appendChild(bootstrapLink);

const swiperLink = document.createElement('link');
swiperLink.rel = 'stylesheet';
swiperLink.href = 'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css';
document.head.appendChild(swiperLink);

// Load Bootstrap JS properly
await new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
  script.onload = resolve;
  script.onerror = reject;
  document.body.appendChild(script);
});

// Load Swiper JS properly
await new Promise((resolve, reject) => {
  const script02 = document.createElement('script');
  script02.src = 'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js';
  script02.onload = resolve;
  script02.onerror = reject;
  document.body.appendChild(script02);
});
 



  

    async function fetchProjects() {
      try {
        const response = await fetch(`/.netlify/functions/get-projects?user_id=${user_id}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        const records = data.records || [];

        const to_do = [], active = [], done = [];
        let declined = 0;

        records.forEach(record => {
          const fields = record.fields;
          const status = fields.status ? fields.status.toLowerCase() : '';
          const p = {
            companyName: fields["companyName"] || 'N/A',
            quotePrice: fields["quotePrice"] || 'N/A',
            finalPrice: fields["finalPrice"] || 'N/A',
            type: fields["projectType"] || 'N/A',
            deliveryDate: fields["deliveryDate"] || '',
            deliveryStatus: fields["deliveryStatus"] || '',
            expectedDelivery: fields["timeline"] || ''
          };

          if (status === "quote received") to_do.push(p);
          else if (status === "project in progress") active.push(p);
          else if (status === "project delivered") done.push(p);
          else if (status === "project declined") declined++;
        });

        renderProjects(to_do, 'todo-carousel', 'todo');
        renderProjects(active, 'active-carousel', 'active');
        renderProjects(done, 'done-carousel', 'done');
        container.querySelector("#declined-count").textContent = declined;

        initSwiper('.todo-swiper');
        initSwiper('.active-swiper');
        initSwiper('.done-swiper');



        const newProject = container.querySelector('.newProjectBtn');
        if (newProject) {
          newProject.addEventListener('click', () => {
            container.style.display = 'none';
            window.voiceflow.chat.interact({
              type: 'newProjct'
            });
          });
        }


        const newBking = container.querySelector('.start-button');
        if (newBking) {
          newBking.addEventListener('click', () => {
            container.style.display = 'none';
            window.voiceflow.chat.interact({
              type: 'newBking'
            });
          });
        }

      } catch (error) {
        console.error('Fetch error:', error);
      }
    }

    function renderProjects(projects, containerId, category) {
      const containerEl = container.querySelector(`#${containerId}`);
      containerEl.innerHTML = '';

      if (!projects.length) {
        containerEl.innerHTML = '<p>No projects.</p>';
        return;
      }

      function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return isNaN(date) ? dateStr : date.toLocaleString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: 'numeric', minute: 'numeric', hour12: true
        });
      }

      projects.forEach(project => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `
          <div class="card-header pb-2 border-bottom">${project.companyName} - ${project.type}</div>
          <div class="card-content pt-2">
            ${category === 'todo' ? `
              <p><strong>Quote Price:</strong> $${project.quotePrice}</p>
              <p class="text-secondary mt-2">
                Hey! We've sent out the project quote. Before we kick things off, let's have a chat with our expert to nail down the details and pricing.
                <br><br><strong>Take a look at your email</strong> for more info or feel free to book a session with us below.
              </p>
              <button class="start-button btn btn-primary">+ Book a Session</button>
            ` : ''}
            ${category === 'active' ? `
              <p><strong>Expected Delivery:</strong> ${project.expectedDelivery}</p>
              <p><strong>Delivery Status:</strong> ${project.deliveryStatus}</p>
              <p><strong>Quote Price:</strong> $${project.quotePrice}</p>
              <p><strong>Final Price:</strong> $${project.finalPrice || 'Pending'}</p>
            ` : ''}
            ${category === 'done' ? `
              <p><strong>Final Price:</strong> $${project.finalPrice}</p>
              <p><strong>Delivered on:</strong> ${formatDate(project.deliveryDate)}</p>
            ` : ''}
          </div>
        `;
        containerEl.appendChild(slide);
      });
    }

    function initSwiper(selector) {
      new Swiper(selector, {
        slidesPerView: 1,
        spaceBetween: 15,
        navigation: {
          nextEl: `${selector} .swiper-button-next`,
          prevEl: `${selector} .swiper-button-prev`,
        },
        pagination: {
          el: `${selector} .swiper-pagination`,
          clickable: true,
        },
        grabCursor: true,
        breakpoints: {
          480: { slidesPerView: 1.5 },
          768: { slidesPerView: 2.2 },
          992: { slidesPerView: 3 },
        }
      });
    }

    await fetchProjects();
  }
};



