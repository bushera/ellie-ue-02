
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
    });    
  
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
