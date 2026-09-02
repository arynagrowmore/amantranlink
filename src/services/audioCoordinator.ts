/**
 * 👑 Universal Audio Coordinator (AmantranLink)
 * Enforces that only ONE template audio can ever play at a time across
 * the Studio Live Preview Canvas, Template Preview Modals, and all 7 Template Iframes.
 */

export const stopAllIframesAudio = (exceptIframe?: HTMLIFrameElement | null) => {
  try {
    // 1. Pause any audio in the top-level window
    document.querySelectorAll('audio').forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {}
    });

    // 2. Iterate through all iframes and pause their audio
    document.querySelectorAll('iframe').forEach((iframe) => {
      if (exceptIframe && iframe === exceptIframe) return;

      try {
        // Send universal pause message to iframe content window
        iframe.contentWindow?.postMessage({ type: 'PAUSE_AUDIO' }, '*');
        iframe.contentWindow?.postMessage({ type: 'STOP_AUDIO' }, '*');

        // Direct DOM access fallback (if same-origin)
        if (iframe.contentDocument) {
          iframe.contentDocument.querySelectorAll('audio').forEach((audio) => {
            try {
              audio.pause();
              audio.currentTime = 0;
            } catch (e) {}
          });
          iframe.contentDocument
            .querySelectorAll('.rjm-music-btn, #rjm-music-toggle, .music-btn, .audio-toggle')
            .forEach((btn) => {
              btn.classList.remove('is-playing', 'playing');
            });
        }
      } catch (e) {
        // Ignore cross-origin iframe security restrictions if any
      }
    });
  } catch (e) {
    console.warn('[AudioCoordinator] Error stopping iframes audio:', e);
  }
};

/**
 * Initialize a global window listener so whenever any iframe reports that
 * audio has started, all other iframes are immediately paused.
 */
export const initGlobalAudioCoordinator = () => {
  if (typeof window === 'undefined') return () => {};

  const handleMessage = (event: MessageEvent) => {
    if (!event.data) return;
    if (event.data.type === 'AUDIO_STARTED_IN_IFRAME') {
      // Find the source iframe if possible
      let sourceIframe: HTMLIFrameElement | null = null;
      document.querySelectorAll('iframe').forEach((iframe) => {
        if (iframe.contentWindow === event.source) {
          sourceIframe = iframe;
        }
      });
      stopAllIframesAudio(sourceIframe);
    }
  };

  window.addEventListener('message', handleMessage);
  return () => {
    window.removeEventListener('message', handleMessage);
  };
};
