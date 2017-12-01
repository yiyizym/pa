import constant from './constant'
import pagePosition from './pagePosition'
import pubSub from './simplePubsub'

var ticking = false;

export default {
    init(options) {

        this.dataManager = options.dataManager;
        this.itemAdapter = options.itemAdapter;
        this.dataAdapter = options.dataAdapter;

        this.prevPage = options.prevPage;
        this.currPage = options.currPage;
        this.nextPage = options.nextPage;

        pubSub.subscribe('position', (_, pos) => {
            console.log('page position: ', pos)
            var currentPage;
            var targetPage;
            switch (pos) {
                case 'top':
                    if (this.dataManager.isFetchingPrevPage()) {
                        console.log('fetching prev page.')
                        return;
                    }
                    currentPage = this.dataManager.getCurrPage();
                    this.dataManager.fetchPrevPage().then((data) => {
                        if (!data['list']) {
                            return;
                        }
                        if (currentPage == this.dataManager.getCurrPage()) {
                            targetPage = this.prevPage;
                        } else if (currentPage == this.dataManager.getCurrPage() + 1) {
                            targetPage = this.currPage;
                        }
                        targetPage.classList.remove('loading');
                        targetPage.innerHTML = '';
                        data['list'].forEach(item => {
                            let li = document.createElement('li')
                            li.appendChild(this.itemAdapter(item))
                            targetPage.appendChild(li)
                        })
                    })
                    break;
                case 'bottom':
                    if (this.dataManager.isFetchingNextPage()){
                        console.log('fetching next page.')
                        return;
                    }
                    currentPage = this.dataManager.getCurrPage();
                    this.dataManager.fetchNextPage().then((data) => {
                        if (!data['list']){
                            return;
                        }

                        if(currentPage == this.dataManager.getCurrPage()){
                            targetPage = this.nextPage;
                        } else if (currentPage == this.dataManager.getCurrPage() - 1){
                            targetPage = this.currPage;
                        }
                        targetPage.classList.remove('loading');
                        targetPage.innerHTML = '';
                        data['list'].forEach(item => {
                            let li = document.createElement('li')
                            li.appendChild(this.itemAdapter(item))
                            targetPage.appendChild(li)
                        })
                    })
                    break;

                default:
                    break;
            }
        })

        pagePosition.init(pubSub)

        this.currPage.addEventListener('scroll', pagePosition.detectPosition);

        this.setTurningPageCb()

        this.setTurnedPageCb()

    },
    setTurningPageCb() {
        var manager = this,
            opacity, distance;
        document.addEventListener('touchmove', e => {
            if (!ticking) {
                window.requestAnimationFrame(function () {

                    ticking = false;

                    // 有时候这个回调会在 touchend 之后再被调用，所以要有个标记位区分一下
                    if (pagePosition.isReseted()){
                        console.log('pagePosition isReseted, not handle touchmove')
                        return;
                    }
                    console.log('touchmove')
                    pagePosition.logPosition(e)

                    distance = pagePosition.getAccumulatedDistance();
                    if (pagePosition.turningPrev() && !manager.dataManager.isFirstPage()) {
                        manager.prevPage.style.transform = 'translateY(' + Math.max(distance, 0) + 'px)';
                        opacity = Math.min(Math.abs(distance / 200), 0.8);
                        manager.setPageHint('prev', opacity)
                    } else if (pagePosition.turningNext() && !manager.dataManager.isLastPage()) {
                        manager.currPage.style.transform = 'translateY(' + Math.min(distance, 0) + 'px)';
                        opacity = Math.max(1 - Math.abs(distance / 200), 0.2);
                        manager.setPageHint('next', opacity)
                    }
                    pagePosition.updatePosition()
                });
            }
            ticking = true;
        })
    },
    setTurnedPageCb() {
        var manager = this;
        document.addEventListener('touchend', e => {
            console.log('touchend');
            if (pagePosition.shouldTurnPrev() && !manager.dataManager.isFirstPage()) {
                manager.setClazThen(manager.prevPage, 'go_down', function () {
                    manager.turnToPrevPage();
                })
            } else if (pagePosition.shouldTurnNext() && !manager.dataManager.isLastPage()) {
                manager.setClazThen(manager.currPage, 'go_up', function () {
                    manager.turnToNextPage();
                })
            } else if(pagePosition.turningPrev()){
                manager.setClazThen(manager.prevPage, 'reset_up', function () {
                    manager.prevPage.classList.remove('reset_up');
                    manager.prevPage.style.transform = 'translateY(0%)';
                })
            } else if (pagePosition.turningNext()){
                manager.setClazThen(manager.currPage, 'reset_down', function () {
                    manager.currPage.classList.remove('reset_down');
                    manager.currPage.style.transform = 'translateY(0%)';
                })
            }
            manager.resetPageHint();
            pagePosition.reset();
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

        pagePosition.setTop();
        this.dataManager.increasePage();

        this.currPage.addEventListener('scroll', pagePosition.detectPosition);
        this.setLoading();
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

        pagePosition.setBottom();
        this.dataManager.decreasePage();

        this.currPage.removeEventListener('scroll', pagePosition.detectPosition);

        // currPage -> prev_page, prevPage -> next_page, nextPage -> current_page
        var tempRef = this.currPage;
        this.currPage = this.prevPage;
        this.prevPage = this.nextPage;
        this.nextPage = tempRef;

        this.currPage.addEventListener('scroll', pagePosition.detectPosition);
        this.setLoading();
        this.prevPage.scrollTop = constant.MAX_HEIGHT;
        this.nextPage.scrollTop = 0;


        this.nextPage.classList.remove('current_page')
        this.nextPage.classList.add('next_page');
        this.currPage.classList.remove('prev_page')
        this.currPage.classList.add('current_page');
        this.prevPage.classList.remove('next_page')
        this.prevPage.classList.add('prev_page');

    },

    setLoading(){
        if (this.dataManager.isFetchingPrevPage() || this.dataManager.isFetchingNextPage()){
            this.currPage.classList.add('loading');
        }
    },

    setClazThen: (function () {
        var latency = 300;
        return function (el, clz, cb) {
            el.classList.add(clz);
            setTimeout(function () {
                cb && cb(el);
            }, latency);
        }
    })(),

    setPageHint(to, opacity){
        console.log('setPageHint')
        switch (to) {
            case 'next':
                setPageHint(this.nextPage, `下翻至 ${this.dataManager.getCurrPage() + 2} 页`);
                break;
            case 'prev':
                setPageHint(this.currPage, `上翻至 ${this.dataManager.getCurrPage()} 页`);
                break;
            default:
                break;
        }

        function setPageHint(el, hint){
            el.classList.add('show_page_hint');
            el.dataset.hint = hint;
            el.style.opacity = opacity;
        }
    },

    resetPageHint(){
        console.log('resetPageHint');
        [this.currPage, this.prevPage, this.nextPage].map(el => {
            el.classList.remove('show_page_hint');
            delete el.dataset.hint;
            el.style.opacity = 1;
        })
    }
}