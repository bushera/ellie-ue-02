
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
      if (
        event.origin.includes('cal.com') &&
        event.data === 'cal.com:booking-success'
      ) {
        // Remove iframe
        document.getElementById('cal-iframe')?.remove(),
  

  
        // Trigger Voiceflow continuation
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: { message: 'Booking completed' }
        })
      }
    })
  
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
