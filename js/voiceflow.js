import { CalExtension, bkingrescheduleExtension, BookingDashboardExtension, BookingDashboardByEmailExtension, QuoteFormExtension, ProjectDashboardExtension} from './extensions.js';

let userId = 'UE_000';  // Default value for userId


(function(d, t) {
  const v = d.createElement(t), s = d.getElementsByTagName(t)[0];

   function setProactive(initialDelay, newMessage, finalDelay) {
  
      setTimeout(() => {
        window.voiceflow.chat.proactive.clear();
        window.voiceflow.chat.proactive.push({
          type: 'text', payload: { message: newMessage },
        });
        setTimeout(() => {
          window.voiceflow.chat.proactive.clear();
          window.voiceflow.chat.open();

        }, finalDelay);
      }, initialDelay);
    };

  // Wait for userIdentified event before loading Voiceflow

    v.onload = function() {

      document.addEventListener('userIdentified', (e) => {
    const userId = e.detail.userId || 'UE_000';
    console.log('[voiceflow.js] Received userIdentified event with userId:', userId);

    window.voiceflow.chat.load({
      verify: { projectID: '6889e804b92be7fab05fdbc8' },
      url: 'https://general-runtime.voiceflow.com',
      versionID: 'production',
      userID: userId,
      user: {
        name: 'UE_Guest_01',
        image: 'https://ik.imagekit.io/bushera/profile%20images/02.png?updatedAt=1746351651791',
      },
      render: { mode: 'overlay' },
      autostart: true,
      allowDangerousHTML: true,
      assistant: {
        persistence: 'localStorage',
        extensions: [CalExtension, bkingrescheduleExtension, BookingDashboardExtension, BookingDashboardByEmailExtension, QuoteFormExtension, ProjectDashboardExtension],
      },
      voice: {
        url: 'https://runtime-api.voiceflow.com',
      },
    }).then(() => {
      if (window.location.href.includes('https://elliepod.netlify.app/')) {
        window.voiceflow.chat.proactive.clear();
        setProactive(100, 'Toronto’s top digital agency, delivering up to 8X conversions—guaranteed.', 4000);
      }

      document.getElementById('openChat').addEventListener('click', () => {
          // Open the chat widget
          window.voiceflow.chat.open();

          // Send the 'Open Chat' event to Voiceflow
          window.voiceflow.chat.interact({
            type: 'event',
              payload: {
                event: {name: 'open_chat'}
              }
          });
        });

    });

  });

  }
  v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"; v.type = "text/javascript"; s.parentNode.insertBefore(v, s);
})(document, 'script');