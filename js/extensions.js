
export const CalExtension = {
  name: 'CalEmbed',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_cal' || trace.payload.name === 'ext_cal',
  render: ({ trace, element }) => {
    const { CalUrl } = trace.payload

    // Create a wrapper div for Cal inline embed
  const calDiv = document.createElement('div');
  calDiv.id = 'my-cal-inline';
  calDiv.style.width = '100%';
  calDiv.style.height = '100%';
  calDiv.style.overflow = 'scroll';

  element.appendChild(calDiv);

  // Load Cal.com embed script
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://app.cal.com/embed/embed.js';

  script.onload = () => {
    // Init Cal embed after script is loaded
    window.Cal('init', 'consultation-time', {
      origin: 'https://cal.com'
    });

    window.Cal.ns['consultation-time']('inline', {
      elementOrSelector: '#my-cal-inline',
      config: { layout: 'month_view' },
      calLink: CalUrl,
    });

    window.Cal.ns['consultation-time']('ui', {
      hideEventTypeDetails: false,
      layout: 'month_view'
    });

    // Listen for booking success message
    window.addEventListener('message', async function (event) {
      const messageData = event.data;

      const isBookingSuccess =
        messageData === 'cal.com:booking-success' ||
        (typeof messageData === 'object' && messageData.type === 'cal.com:booking-success');

      if (isBookingSuccess) {
        console.log('[Cal.com] Booking success event received');

        // Remove Cal embed div
        document.getElementById('my-cal-inline')?.remove();

        // Update Voiceflow user and variables
        window.voiceflow.chat.setUser({ name, email });
        await window.voiceflow.chat.updateVariables({ user_name: name, user_email: email });

        // Continue Voiceflow
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: { message: 'Booking completed' }
        });
      }
    });
  };


    /*const iframe = document.createElement('iframe')
    iframe.src = CalUrl || 'https://cal.com/bushera/consultation-time',
    iframe.height = height || '280'
    iframe.width = width || '320'
    iframe.style.border = '0'
    iframe.allowFullscreen = true
    iframe.loading = 'lazy'
    iframe.id = 'cal-iframe'


    window.addEventListener('message', async function (event) {
      // Validate origin (be strict for security)
      const allowedOrigins = ['https://cal.com', 'https://embed.cal.com'];
      if (!allowedOrigins.includes(event.origin)) return;
    
      // Cal may send a string or object—handle both
      const messageData = event.data;
    
      const isBookingSuccess =
        messageData === 'cal.com:booking-success' || // legacy format
        (typeof messageData === 'object' &&
          messageData.type === 'cal.com:booking-success');
    
      if (isBookingSuccess) {
        // Remove iframe
        const calIframe = document.getElementById('cal-iframe');
        if (calIframe) calIframe.remove();
    
      
        // Trigger 'complete'
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: { message: 'Booking completed' }
        });
      }
    });*/

    
    /*window.addEventListener('message', function (event) {
      if (
        event.origin.includes('cal.com') &&
        event.data === 'cal.com:booking-success'
      ) {
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: { message: 'Booking completed' },
        })
      }
    })*/

    element.appendChild(iframe)
  },
}
