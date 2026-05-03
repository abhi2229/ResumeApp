// Force desktop mode on mobile devices
(function() {
  // Set viewport to desktop width
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=1366, initial-scale=0.5, user-scalable=yes');
  }

  // Force desktop dimensions
  const html = document.documentElement;
  html.style.width = '1366px';
  html.style.minWidth = '1366px';

  const body = document.body;
  body.style.width = '1366px';
  body.style.minWidth = '1366px';
  body.style.minHeight = '100vh';

  // Override touch events to work like desktop
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Prevent pinch zoom if not desired
  document.addEventListener('touchmove', function(event) {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }, { passive: false });
})();
