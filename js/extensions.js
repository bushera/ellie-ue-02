export const CalExtension = {
    name: 'CalEmbed',
    type: 'response',
    match: ({ trace }) =>
      trace.type === 'ext_cal' || trace.payload.name === 'ext_cal',
  
    render: ({ trace, element }) => {
      const { CalUrl, height, width } = trace.payload;
  
      // Create iframe element
      const iframe = document.createElement('iframe');
      iframe.src = CalUrl || 'https://cal.com/bushera/consultation-time';
      iframe.width = width || '320';   // Corrected width and height assignments
      iframe.height = height || '280';
      iframe.style.border = '0';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      iframe.id = 'cal-iframe';
  
      // Track Voiceflow readiness
      let isVoiceflowReady = false;
  
      // Wait for Voiceflow to initialize
      setTimeout(() => {
        if (window.voiceflow?.chat?.interact) {
          isVoiceflowReady = true;
          console.log('✅ Voiceflow widget is ready');
        } else {
          console.warn('⚠️ Voiceflow widget not yet ready');
        }
      }, 500);
  
      // Listen for Cal.com "booking completed" postMessage
      window.addEventListener('message', function (event) {
        if (
          typeof event.data === 'string' &&
          event.origin.includes('cal.com') &&
          event.data === 'cal.com:booking-success'
        ) {
          console.log('📩 Received booking success message from Cal.com');
  
          // Poll until Voiceflow is ready
          const interval = setInterval(() => {
            if (isVoiceflowReady && window.voiceflow?.chat?.interact) {
              clearInterval(interval);
  
              // Send interaction to Voiceflow
              window.voiceflow.chat.interact({
                type: 'complete',
                payload: { message: 'Booking completed' },
              });
  
              console.log('✅ Sent interaction to Voiceflow');
  
              // Remove the Cal.com iframe
              const calIframe = document.querySelector('iframe[src*="cal.com"]');
              if (calIframe) {
                calIframe.remove();
                console.log('🧹 Removed Cal.com iframe');
              }
            }
          }, 300);
        }
      });
  
      // Append iframe to the target element
      element.appendChild(iframe);
    },
  };
  