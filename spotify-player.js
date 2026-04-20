// === Clara Futura — Spotify Ambient Player ===
// Controls a hidden Spotify embed iframe via postMessage.
// User clicks the floating amber button to toggle play/pause.

(function() {
  'use strict';

  // Don't load in iframe mode (WordPress embed)
  try {
    if (window.self !== window.top) return;
  } catch(e) {
    return;
  }

  const btn = document.getElementById('ambientMusicBtn');
  const iframe = document.getElementById('spotifyEmbed');
  if (!btn || !iframe) return;

  let isPlaying = false;
  const playIcon = btn.querySelector('.ambient-icon-play');
  const pauseIcon = btn.querySelector('.ambient-icon-pause');

  function updateUI() {
    if (isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      btn.classList.add('is-playing');
      btn.setAttribute('aria-label', 'Pause ambient music');
      btn.setAttribute('title', 'Pause ambient music');
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      btn.classList.remove('is-playing');
      btn.setAttribute('aria-label', 'Play ambient music');
      btn.setAttribute('title', 'Play ambient music');
    }
  }

  // Toggle play/pause via postMessage to Spotify embed
  function togglePlayback() {
    if (!iframe.contentWindow) return;
    iframe.contentWindow.postMessage({ command: 'toggle' }, '*');
    isPlaying = !isPlaying;
    updateUI();
  }

  btn.addEventListener('click', togglePlayback);

  // Listen for messages back from Spotify embed to stay in sync
  window.addEventListener('message', function(e) {
    try {
      // Spotify sends back playback state updates
      if (e.data && typeof e.data === 'object') {
        if (e.data.type === 'playback_update' || e.data.type === 'player_state') {
          const paused = e.data.isPaused || e.data.paused;
          if (typeof paused === 'boolean') {
            isPlaying = !paused;
            updateUI();
          }
        }
      }
    } catch(err) {
      // Ignore cross-origin errors
    }
  });

  // Keyboard accessibility: Enter/Space
  btn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePlayback();
    }
  });
})();
