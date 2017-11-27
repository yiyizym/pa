export default {
    preventChromePullRefresh: (function(){
        var lastY = 0;
        return function(){
            if (window.navigator.userAgent.indexOf('Chrome') != -1){
                window.addEventListener('touchmove', function (e) {
                    var scrolly = window.pageYOffset || window.scrollTop || 0;
                    var direction = e.changedTouches[0].pageY > lastY ? 1 : -1;
                    if (direction > 0 && scrolly === 0) {
                        e.preventDefault();
                        console.log('prevent pull to refresh');
                    }
                    lastY = e.changedTouches[0].pageY;
                }, { passive: false });
            }
        }
    }())
}