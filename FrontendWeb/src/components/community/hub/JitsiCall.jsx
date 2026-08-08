import { useRef, useEffect } from 'react';

const JitsiCall = ({ room, type, user, onClose }) => {
  const containerRef = useRef(null);
  const monId = user?._id || user?.id;

  useEffect(() => {
    const domain = "meet.element.io";
    const options = {
      roomName: room,
      width: "100%",
      height: "100%",
      parentNode: containerRef.current,
      configOverwrite: {
        prejoinPageEnabled: false,
        prejoinConfig: { enabled: false }, // Nouvelle syntaxe pour forcer la désactivation
        startWithAudioMuted: false,
        startWithVideoMuted: type === 'AUDIO',
        startAudioOnly: type === 'AUDIO', // Optimisation pour les appels audio
        disableDeepLinking: true,
        requireDisplayName: false,
        resolution: 360, // Baisse la résolution pour alléger la charge
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'fullscreen', 'hangup', 'chat', 'settings', 'tileview'
        ],
        SHOW_JITSI_WATERMARK: false,
      },
      userInfo: {
        displayName: `${user?.prenom} ${user?.nom}`
      }
    };

    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.JitsiMeetExternalAPI) return resolve();
        const script = document.createElement("script");
        script.src = `https://${domain}/external_api.js`;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => {
          // Fallback au cas où l'instance bloque le script
          const fbScript = document.createElement("script");
          fbScript.src = "https://meet.jit.si/external_api.js";
          fbScript.onload = resolve;
          document.head.appendChild(fbScript);
        };
        document.head.appendChild(script);
      });
    };

    loadScript().then(() => {
      if (!containerRef.current) return;
      window.jitsiAPI = new window.JitsiMeetExternalAPI(domain, options);
      window.jitsiAPI.addEventListener("videoConferenceLeft", () => {
        onClose();
      });
    });

    return () => {
      if (window.jitsiAPI) {
        window.jitsiAPI.dispose();
        window.jitsiAPI = null;
      }
    };
  }, [room, type, monId, onClose]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default JitsiCall;
