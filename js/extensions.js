export const CalExtension = {
    name: 'CalEmbed',
    type: 'response',
    match: ({ trace }) =>
      trace.type === 'ext_cal' || trace.payload.name === 'ext_cal',
    render: ({ trace, element }) => {
      const { calUrl, height, width } = trace.payload
  
      const iframe = document.createElement('iframe')
      iframe.src = calUrl || 'https://cal.com/bushera/consultation-time'
      iframe.width = '340' || '800'
      iframe.height = '440' || '600'
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
  