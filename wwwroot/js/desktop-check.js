(function () {
    var blocker = document.getElementById('desktop-blocker');
    var retryBtn = document.getElementById('desktop-blocker-retry');

    function isRealMobileDevice() {
        // Check if it's a real mobile user agent
        var isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Silk/i.test(navigator.userAgent);

        // Check for touch capabilities
        var hasTouchScreen = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

        // Check if viewport width is mobile-like (narrow screen)
        var isNarrow = window.innerWidth < 1024;

        // Check device pixel ratio - mobile devices typically have higher DPR
        var hasHighDPR = (window.devicePixelRatio || 1) > 1.5;

        // Mobile detection: if it's a mobile UA AND (has touch OR narrow screen) OR (mobile UA AND hasHighDPR)
        // This catches real mobile devices and mobile emulation
        return isMobileUA && (hasTouchScreen || isNarrow || hasHighDPR);
    }

    function check() {
        if (isRealMobileDevice()) {
            blocker.classList.remove('hidden');
            // Prevent scrolling on the body when blocker is active
            document.body.style.overflow = 'hidden';
        } else {
            blocker.classList.add('hidden');
            // Allow scrolling when blocker is hidden
            document.body.style.overflow = 'auto';
        }
    }

    // Initial check
    check();

    if (retryBtn) {
        retryBtn.addEventListener('click', function () {
            check(); // Re-check instead of just reloading
        });
    }

    // Debounced resize check to avoid excessive calls
    var resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(check, 250);
    });

    // Also check on orientation change
    window.addEventListener('orientationchange', check);
})();