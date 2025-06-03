import { CalExtension} from './extensions.js';

let userId = 'UE_000';  // Default value for userId


(function(d, t) {
  const v = d.createElement(t), s = d.getElementsByTagName(t)[0];

  // Wait for userIdentified event before loading Voiceflow
  document.addEventListener('userIdentified', (e) => {
    const userId = e.detail.userId || 'UE_000';
    console.log('[voiceflow.js] Received userIdentified event with userId:', userId);
    v.onload = function() {
    window.voiceflow.chat.load({
      verify: { projectID: '683d791adebc0c32467c4dc1' },
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
        extensions: [CalExtension],
      },
      voice: {
        url: 'https://runtime-api.voiceflow.com',
      },
    });

  }
  });
  v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"; v.type = "text/javascript"; s.parentNode.insertBefore(v, s);
})(document, 'script');