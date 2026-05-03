// Detect mobile device and apply desktop mode only on mobile
(function() {
  function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for common mobile user agents
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    return mobileRegex.test(userAgent.toLowerCase());
  }

  function isTabletDevice() {
    const userAgent = navigator.userAgent;
    return /ipad|android(?!.*mobi)/i.test(userAgent.toLowerCase());
  }

  // Only apply desktop mode on actual mobile/tablet devices
  if (isMobileDevice() || isTabletDevice()) {
    // Update viewport for mobile only
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=1366, initial-scale=0.3, maximum-scale=5, user-scalable=yes');
    }

    // Calculate zoom for different mobile screen sizes
    function applyDesktopZoom() {
      const screenWidth = window.innerWidth;
      const desktopWidth = 1366;
      const zoomLevel = (screenWidth / desktopWidth);

      // Apply zoom with transform-origin at top-left to prevent layout shift
      document.documentElement.style.zoom = zoomLevel;
    }

    // Apply on load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyDesktopZoom);
    } else {
      applyDesktopZoom();
    }

    // Recalculate on resize/orientation change
    window.addEventListener('resize', applyDesktopZoom);
    window.addEventListener('orientationchange', function() {
      setTimeout(applyDesktopZoom, 100);
    });
  }
  // Desktop browsers: no changes, use normal responsive design
})();
