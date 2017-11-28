var formerPosition = 0,
    afterPosition = 0,
    currentPageAtTop = true,
    currentPageAtBottom = false,
    turnPageSetted = false,
    isTurnPage = false,
    scrollTicking = false,
    reseted = false,
    accumulatedDistance = 0;

export default {
    init(pubSub) {
        this.pubSub = pubSub;
        document.addEventListener('touchstart', e => {
            reseted = false;
            formerPosition = e.touches[0].clientY;
        })
        this.detectPosition = this._detectPosition.bind(this);
    },
    _detectPosition: function(e){
        var _el = e.target;
        var context = this;
        if (!scrollTicking) {
            window.requestAnimationFrame(function () {
                var scrollTop = _el.scrollTop, scrollBottom = _el.scrollHeight - _el.offsetHeight;
                currentPageAtTop = scrollTop == 0;
                currentPageAtBottom = scrollTop == scrollBottom;
                console.log('currentPageAtTop: ' + currentPageAtTop + ' currentPageAtBottom: ' + currentPageAtBottom);
                if (currentPageAtTop) {
                    context.pubSub.publish('position', 'top')
                }
                if (currentPageAtBottom) {
                    context.pubSub.publish('position', 'bottom')
                }
                scrollTicking = false;
            })
        }
        scrollTicking = true;
    },
    logPosition(e) {
        afterPosition = e.changedTouches[0].clientY;
        if ((currentPageAtBottom && this.determineDirection() == 'up') ||
            (currentPageAtTop && this.determineDirection() == 'down')) {
            isTurnPage = true;
        }
    },

    turningPrev() {
        return currentPageAtTop && isTurnPage;
    },

    turningNext() {
        return currentPageAtBottom && isTurnPage;
    },

    updatePosition() {
        formerPosition = afterPosition;
    },

    shouldTurnPrev() {
        return this.turningPrev() && this.getAccumulatedDistance() > 100;
    },

    shouldTurnNext() {
        return this.turningNext() && this.getAccumulatedDistance() < -100;
    },

    determineDirection() {
        //由旧位置到新位置，如果线径是向上走的，就是 up
        //由旧位置到新位置，如果线径是向下走的，就是 down
        var direction = formerPosition > afterPosition ? 'up' : formerPosition < afterPosition ? 'down' : 'equal';
        console.log('determineDirection: ', direction);
        return direction;
    },

    getAccumulatedDistance() {
        console.log('former accumulatedDistance: ', accumulatedDistance);
        //新位置在旧位置的上方，会是负数
        //新位置在旧位置的下方，会是正数
        accumulatedDistance += afterPosition - formerPosition;
        console.log('after accumulatedDistance: ', accumulatedDistance);
        return accumulatedDistance;
    },

    reset() {
        console.log('reset pagePosition')
        reseted = true;
        accumulatedDistance = 0;
        isTurnPage = false;
    },

    isReseted(){
        return reseted;
    },

    setBottom() {
        currentPageAtTop = false;
        currentPageAtBottom = true;
    },

    setTop() {
        currentPageAtTop = true;
        currentPageAtBottom = false;
    }
}