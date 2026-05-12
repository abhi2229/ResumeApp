(function() {
  var overlay = document.getElementById('mobile-blocker-overlay');
  var retryBtn = document.getElementById('mobile-blocker-retry');
  var html = document.documentElement;

  function isRealMobileDevice() {
    var ua = navigator.userAgent.toLowerCase();
    var isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|silk|windows phone|mobile|tablet/.test(ua);
    var hasTouchScreen = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    var isNarrowScreen = window.innerWidth < 1024;
    var isSmallHeight = window.innerHeight < 700;

    return isMobileUA && (hasTouchScreen || isNarrowScreen || isSmallHeight);
  }

  function check() {
    if (isRealMobileDevice()) {
      html.classList.add('mobile-detected');
      if (overlay) overlay.style.display = 'flex';
    } else {
      html.classList.remove('mobile-detected');
      if (overlay) overlay.style.display = 'none';
    }
  }

  // Initial check after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', check);
  } else {
    check();
  }

  // Retry button with feedback
  if (retryBtn) {
    retryBtn.addEventListener('click', function() {
      retryBtn.textContent = '⟳ Checking...';
      retryBtn.style.opacity = '0.7';
      retryBtn.style.pointerEvents = 'none';

      setTimeout(function() {
        check();
        retryBtn.textContent = '✓ I\'ve Enabled It - Check Again';
        retryBtn.style.opacity = '1';
        retryBtn.style.pointerEvents = 'auto';
      }, 500);
    });
  }

  // Check on resize (debounced)
  var resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(check, 300);
  });

  // Check on orientation change
  window.addEventListener('orientationchange', function() {
    setTimeout(check, 500);
  });
})();
