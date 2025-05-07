
export const CalExtension = {
    name: 'CalEmbed',
    type: 'response',
    match: ({ trace }) =>
      trace.type === 'ext_cal' || trace.payload.name === 'ext_cal',
    render: ({ trace, element }) => {
      const { CalUrl, height, width } = trace.payload


      const iframe = document.createElement('iframe')
      iframe.src = CalUrl || 'https://cal.com/bushera/consultation-time',
      iframe.width = width || '280'
      iframe.height = height || '320'
      iframe.style.border = '0'
      iframe.allowFullscreen = true
      iframe.loading = 'lazy'
      iframe.id = 'cal-iframe'
  
      // Embed Cal widget setup
  window.Cal = window.Cal || {};
  window.Cal('ui', {
    version: '1.0',
    calLink: 'https://cal.com/bushera/consultation-time', // Replace with your actual Cal.com link
    onEventScheduled: (event) => {
      console.log('Booking Success:', event);

      const { name, email } = event.payload.invitee;

      // 1. Remove iframe
      const iframe = document.querySelector('#cal-iframe');
      if (iframe) {

        // Delay interact call until after iframe removal
        setTimeout(() => {
          // 2. Save name and email in Voiceflow (as user variable + user object)
          window.voiceflow.chat.setUserVariable('name', name);
          window.voiceflow.chat.setUserVariable('email', email);
          window.voiceflow.chat.setUser({ name, email });

          // 3. Trigger Voiceflow interaction
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: { message: 'Booking completed' },
          });
        }, 0);
      }
    },
  });
      element.appendChild(iframe)
    },
  }
  