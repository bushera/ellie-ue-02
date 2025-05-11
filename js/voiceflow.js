import { CalExtension, BookingDashboardExtension } from './extensions.js';

(function(d, t) {
  const v = d.createElement(t), s = d.getElementsByTagName(t)[0];
  
  v.onload = function() {
    document.addEventListener('userIdentified', (e) => {
      const userId = e.detail.userId || 'UE_000';

      window.voiceflow.chat.load({
        verify: { projectID: '66f143631c11d84702e2b3e3' },
        url: 'https://general-runtime.voiceflow.com',
        versionID: 'production',
        userID: userId,
        user: {
          name: 'UE_Guest_01',
          image: 'https://ik.imagekit.io/bushera/profile%20images/01.png?updatedAt=1746351651791',
        },
        render: { mode: 'overlay' },
        autostart: true,
        allowDangerousHTML: true,
        assistant: {
          persistence: 'none',
          extensions: [CalExtension, BookingDashboardExtension],
        },
        voice: {
          url: "https://runtime-api.voiceflow.com"
        },
      }).then(() => {
        if (window.location.href.includes('https://elliepod.netlify.app/')) {
          window.voiceflow.chat.proactive.clear();
          setTimer(1000, 'Ellie taking over the conversation right now !.......', 300);
        }
      });

      function setTimer(initialDelay, newMessage, finalDelay) {
        window.voiceflow.chat.proactive.push(
          { type: 'text', payload: { message: 'Ellie and other supports are online and ready to handle your request 🔥🔥' } },
          { type: 'text', payload: { message: 'Chat and book a session with one of our experts !' } }
        );
        setTimeout(() => {
          window.voiceflow.chat.proactive.clear();
          window.voiceflow.chat.proactive.push(
            { type: 'text', payload: { message: newMessage } }
          );
          setTimeout(() => {
            window.voiceflow.chat.proactive.clear();
            window.voiceflow.chat.open();
          }, finalDelay);
        }, initialDelay);
      }
    });
  };

  v.src = "https://cdn.voiceflow.com/widget/bundle.mjs"; v.type = "module"; s.parentNode.insertBefore(v, s);
  })(document, 'script');
