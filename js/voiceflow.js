import { CalExtension, bkingrescheduleExtension} from './extensions.js';

let userId = 'UE_000';  // Default value for userId


(function(d, t) {
  const v = d.createElement(t), s = d.getElementsByTagName(t)[0];

  // Wait for userIdentified event before loading Voiceflow
  document.addEventListener('userIdentified', (e) => {
    const userId = e.detail.userId || 'UE_000';
    console.log('[voiceflow.js] Received userIdentified event with userId:', userId);

    window.voiceflow.chat.load({
      verify: { projectID: '683d791a0cdebc32467c4dc1' },
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
        extensions: [CalExtension, bkingrescheduleExtension],
      },
      voice: {
        url: 'https://runtime-api.voiceflow.com',
      },
    }).then(() => {
      if (window.location.href.includes('https://elliepod.netlify.app/')) {
        window.voiceflow.chat.proactive.clear();
        setTimer(2000, 'Ellie taking over the conversation right now !.......', 800);
      }
    });

    function setTimer(initialDelay, newMessage, finalDelay) {
      window.voiceflow.chat.proactive.push(
        { type: 'text', payload: { message: 'Ellie and other supports are online and ready to handle your request 🔥🔥' } },
        { type: 'text', payload: { message: 'Chat and book a session with one of our experts !' } }
      );
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
    }
  });

  v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"; v.type = "text/javascript"; s.parentNode.insertBefore(v, s);
})(document, 'script');