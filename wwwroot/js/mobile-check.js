(function() {
  var overlay = document.getElementById('mobile-blocker-overlay');
  var retryBtn = document.getElementById('mobile-blocker-retry');

  function isRealMobileDevice() {
    var ua = navigator.userAgent;
    var isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Silk|Windows Phone|Mobile|Tablet/i.test(ua);
    var hasTouchScreen = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    var isNarrowScreen = window.innerWidth < 1024;
    var isSmallHeight = window.innerHeight < 700;

    return isMobileUA && (hasTouchScreen || isNarrowScreen || isSmallHeight);
  }

  function check() {
    if (isRealMobileDevice()) {
      document.documentElement.classList.add('mobile-detected');
      if (overlay) overlay.style.display = 'flex';
    } else {
      document.documentElement.classList.remove('mobile-detected');
      if (overlay) overlay.style.display = 'none';
    }
  }

  // Initial check
  check();

  // Retry button
  if (retryBtn) {
    retryBtn.addEventListener('click', function() {
      check();
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
    setTimeout(check, 100);
  });
})();
