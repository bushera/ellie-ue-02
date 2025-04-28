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
        if (window.location.href.includes('file:///C:/Users/user/Desktop/Ellie_ue_pod/index.html')) {
          window.voiceflow.chat.proactive.clear();
          window.voiceflow.chat.proactive.push(
            { type: 'text', payload: { message: 'Ellie and one other support are online now 🔥🔥' } },
            { type: 'text', payload: { message: 'Chat us to know more!' } }
          );
        }
      });
    };
    v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"; v.type = "text/javascript"; s.parentNode.insertBefore(v, s);
  })(document, 'script');

 