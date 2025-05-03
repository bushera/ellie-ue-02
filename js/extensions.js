export const CalExtension = {
    name: 'CalEmbed',
    type: 'response',
    match: ({ trace }) =>
      trace.type === 'ext_cal' || trace.payload.name === 'ext_cal',
  
    render: ({ trace, element }) => {
      const { CalUrl, height, width } = trace.payload;
  
      // Create the Cal.com iframe
      const iframe = document.createElement('iframe');
      iframe.src = CalUrl || 'https://cal.com/bushera/consultation-time';
      iframe.width = width || '320';
      iframe.height = height || '280';
      iframe.style.border = '0';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      iframe.id = 'cal-iframe';
  
      element.appendChild(iframe);
      console.log('📎 Cal.com iframe appended');
  
      // Wait for Voiceflow to be ready
      const waitForVoiceflow = (callback) => {
        const interval = setInterval(() => {
          if (window.voiceflow?.chat?.interact) {
            clearInterval(interval);
            console.log('✅ Voiceflow ready');
            callback();
          }
        }, 300);
      };
  
      // Listen for booking event from Cal.com
      window.addEventListener('message', function (event) {
        try {
          const data = event.data;
  
          // Check if message comes from cal.com and contains a booking with status 'ACCEPTED'
          const isCalBooking =
            event.origin.includes('https://cal.com') &&
            data &&
            typeof data === 'object' &&
            data.status === 'ACCEPTED' &&
            data.title &&
            data.startTime;
  
          if (isCalBooking) {
            console.log('📩 Booking confirmed from Cal.com:', data);
  
            waitForVoiceflow(() => {
              // Send interaction to Voiceflow
              window.voiceflow.chat.interact({
                type: 'complete',
                payload: {
                  message: 'Booking completed',
                  bookingInfo: {
                    title: data.title,
                    time: data.startTime,
                    email: data.responses?.email,
                  },
                },
              });
  
              console.log('🗣️ Interaction sent to Voiceflow');
  
              // Remove the iframe
              const calIframe = document.getElementById('cal-iframe');
              if (calIframe) {
                calIframe.remove();
                console.log('🧹 Cal.com iframe removed');
              } else {
                console.warn('⚠️ Could not find Cal.com iframe to remove');
              }
            });
          }
        } catch (err) {
          console.error('❌ Error processing Cal.com event', err);
        }
      });
    },
  };
  