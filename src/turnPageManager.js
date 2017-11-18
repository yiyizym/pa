import constant from './constant'
import pagePosition from './pagePosition'

var ticking = false;

export default {
    init(options) {

        this.prevPage = options.prevPage;
        this.currPage = options.currPage;
        this.nextPage = options.nextPage;

        pagePosition.init()

        this.currPage.addEventListener('scroll', pagePosition.detectPosition);

        this.setTurningPageCb()

        this.setTurnedPageCb()

    },
    setTurningPageCb() {
        var manager = this;
        document.addEventListener('touchmove', e => {
            if (!ticking) {
                window.requestAnimationFrame(function () {

                    pagePosition.logPosition(e)

                    if (pagePosition.turningPrev()) {
                        manager.prevPage.style.transform = 'translateY(' + Math.max(pagePosition.getAccumulatedDistance(), 0) + 'px)';
                    } else if (pagePosition.turningNext()) {
                        manager.currPage.style.transform = 'translateY(' + Math.min(pagePosition.getAccumulatedDistance(), 0) + 'px)';
                    }
                    pagePosition.updatePosition()
                    ticking = false;
                });
            }
            ticking = true;
        })
    },
    setTurnedPageCb() {
        var manager = this;
        document.addEventListener('touchend', e => {
            if (pagePosition.shouldTurnPrev()) {
                manager.setClazThen(manager.currPage, 'go_up', function () {
                    manager.turnToNextPage();
                })
            } else if (pagePosition.shouldTurnNext()) {
                manager.setClazThen(manager.prevPage, 'go_down', function () {
                    manager.turnToPrevPage();
                })
            } else {
                manager.currPage.style.transform = 'translateY(0%)';
            }
            pagePosition.reset()
        })
    },

    turnToNextPage() {
        this.currPage.classList.remove('go_up', 'turn_page');
        this.currPage.style.transform = '';

        this.currPage.removeEventListener('scroll', pagePosition.detectPosition);

        // currPage -> next_page, nextPage -> prev_page, prevPage -> current_page
        var tempRef = this.currPage;
        this.currPage = this.nextPage;
        this.nextPage = this.prevPage;
        this.prevPage = tempRef;

        pagePosition.setTop()

        this.currPage.addEventListener('scroll', pagePosition.detectPosition);
        this.prevPage.scrollTop = constant.MAX_HEIGHT;
        this.nextPage.scrollTop = 0;

        this.nextPage.classList.remove('prev_page')
        this.nextPage.classList.add('next_page');
        this.currPage.classList.remove('next_page')
        this.currPage.classList.add('current_page');
        this.prevPage.classList.remove('current_page')
        this.prevPage.classList.add('prev_page');

    },

    turnToPrevPage() {
        this.prevPage.classList.remove('go_down', 'turn_page')

        this.prevPage.style.transform = '';

        pagePosition.setBottom()

        this.currPage.removeEventListener('scroll', pagePosition.detectPosition);

        // currPage -> prev_page, prevPage -> next_page, nextPage -> current_page
        var tempRef = this.currPage;
        this.currPage = this.prevPage;
        this.prevPage = this.nextPage;
        this.nextPage = tempRef;

        this.currPage.addEventListener('scroll', pagePosition.detectPosition);
        this.prevPage.scrollTop = constant.MAX_HEIGHT;
        this.nextPage.scrollTop = 0;

        this.nextPage.classList.remove('current_page')
        this.nextPage.classList.add('next_page');
        this.currPage.classList.remove('prev_page')
        this.currPage.classList.add('current_page');
        this.prevPage.classList.remove('next_page')
        this.prevPage.classList.add('prev_page');

    },

    setClazThen: (function () {
        var latency = 300;
        return function (el, clz, cb) {
            el.classList.add(clz);
            setTimeout(function () {
                cb && cb(el);
            }, latency);
        }
    })()
}