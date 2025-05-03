
import {CalExtension} from '/js/extensions.js'


(function(d, t) {  
  var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
    v.onload = function() {

      const userId = localStorage.getItem('User_ID') || 'UE_000';  // fallback if not found



      window.voiceflow.chat.load({
        verify: { projectID: '66f143631c11d84702e2b3e3' },
        url: 'https://general-runtime.voiceflow.com',
        versionID: 'production',
        userID: userId || 'USER_000',
        user: {
          name: 'UE_Guest',
        },
        render: {
          mode: 'overlay',
        },
        autostart: false,
        allowDangerousHTML: true,
        assistant: {
          extensions: [CalExtension]
        },
        voice: {
          url: "https://runtime-api.voiceflow.com"
        }
      }).then(() => {
        if (window.location.href.includes('https://elliepod.netlify.app/')) {
          window.voiceflow.chat.proactive.clear();
          // Function to set a timer for clearing proactive messages and pushing new ones
function setTimer(initialDelay, newMessage, finalDelay) {
    // First, push initial proactive message
    window.voiceflow.chat.proactive.push(
      { type: 'text', payload: { message: 'Ellie and other supports are online and ready to handle your request 🔥🔥' } },
      { type: 'text', payload: { message: 'Chat and book a session with one of our experts !' } }
    );
  
    // Set the first timer to clear and push new messages after the initial delay
    setTimeout(() => {
      window.voiceflow.chat.proactive.clear();  // Clear current proactive message
  
      // Push the new message after the initial delay
      window.voiceflow.chat.proactive.push(
        { type: 'text', payload: { message: newMessage } }
      );
  
      // Set the second timer to clear all proactive messages after the final delay
      setTimeout(() => {
        window.voiceflow.chat.proactive.clear();  // Clear all proactive messages
        window.voiceflow.chat.open();
      }, finalDelay);  // Final delay (in milliseconds)
      
    }, initialDelay);  // Initial delay (in milliseconds)
  }
  
  // Call the setTimer function with a 10-second initial delay, a new message, and a final 5-second delay before clearing all
  setTimer(12000, 'Ellie taking over the conversation right now !........', 3000);
  
        }
      });
    };
    v.src = "https://cdn.voiceflow.com/widget/bundle.mjs"; v.type = "module"; s.parentNode.insertBefore(v, s);
  })(document, 'script');

 