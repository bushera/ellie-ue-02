
export const CalExtension = {
    name: 'CalEmbed',
    type: 'response',
    const userId = localStorage.getItem('User_ID') || 'UE_000',  // fallback if not found
    match: ({ trace }) =>
      trace.type === 'ext_cal' || trace.payload.name === 'ext_cal',
    render: ({ trace, element }) => {
      const { height, width } = trace.payload


      const iframe = document.createElement('iframe')
      iframe.src = 'https://cal.com/bushera/consultation-time?User_ID=userId',
      iframe.width = height || '280'
      iframe.height = width || '320'
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
  