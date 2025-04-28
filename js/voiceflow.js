(function(d, t) {
    var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
    v.onload = function() {
      window.voiceflow.chat.load({
        verify: { projectID: '66f143631c11d84702e2b3e3' },
        url: 'https://general-runtime.voiceflow.com',
        versionID: 'production',
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
      { type: 'text', payload: { message: 'Ellie and one other support are online now 🔥🔥' } },
      { type: 'text', payload: { message: 'Chat us to know more!' } }
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
      }, finalDelay);  // Final delay (in milliseconds)
      
    }, initialDelay);  // Initial delay (in milliseconds)
  }
  
  // Call the setTimer function with a 10-second initial delay, a new message, and a final 5-second delay before clearing all
  setTimer(10000, 'We are still available! Reach out for help.', 5000);
  
        }
      });
    };
    v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"; v.type = "text/javascript"; s.parentNode.insertBefore(v, s);
  })(document, 'script');

 