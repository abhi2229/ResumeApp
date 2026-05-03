(function () {
    var blocker = document.getElementById('desktop-blocker');
    var retryBtn = document.getElementById('desktop-blocker-retry');

    function isRealMobileDevice() {
        var hasTouchScreen = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        var isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        var isNarrow = window.innerWidth < 1024;
        return hasTouchScreen && isMobileUA && isNarrow;
    }

    function check() {
        if (isRealMobileDevice()) {
            blocker.classList.remove('hidden');
        } else {
            blocker.classList.add('hidden');
        }
    }

    check();

    if (retryBtn) {
        retryBtn.addEventListener('click', function () {
            window.location.reload();
        });
    }

    window.addEventListener('resize', check);
})();