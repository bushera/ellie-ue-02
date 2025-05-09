
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



  /*window.Cal = window.Cal || {};
  window.Cal('ui', {
    version: '1.0',
    calLink: 'CalUrl', // Replace with your actual Cal.com link
    onEventScheduled: (event) => {
      console.log('Booking Success:', event);

      const { name, email } = event.payload.invitee;

      // 1. Remove iframe
      const iframe = document.querySelector('#cal-iframe');
      if (iframe) iframe.remove();

      // 2. Save name and email in Voiceflow (as user variable + user object)
      window.voiceflow.chat.setUserVariable('name', name);
      window.voiceflow.chat.setUserVariable('email', email);
      window.voiceflow.chat.setUser({ name, email });

      // 3. Trigger Voiceflow interaction
      window.voiceflow.chat.interact({
        type: 'complete', // Maintaining type as requested
        payload: { message: 'Booking completed' },
      });
    },
  });*/

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
