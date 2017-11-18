import 'whatwg-fetch'
import scrollManager from './scrollManager'

const MAX_HEIGHT = 1e5;

const Pa = function (selector, url) {
    if (!(this instanceof Pa)) {
        return new Pa(selector, url)
    }
    this.container = document.querySelector(selector) || document.createElement('div')
    this.container.classList.add('pa_container')
    this.url = url

    this.fetch(url).then(resp => {
        return resp.json()
    }).then(this.buildPage.bind(this))
}

Pa.prototype.fetch = function (url) {
    return fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
}

Pa.prototype.buildPage = function (data) {

    let prevPage = this.prevPage = document.createElement('ul')
    prevPage.classList.add('prev_page')
    data['list'].forEach(item => {
        let li = document.createElement('li')
        li.textContent = item.value
        li.setAttribute('id', item.id)
        prevPage.appendChild(li)
    })


    let currPage = this.currPage = document.createElement('ul')
    currPage.classList.add('current_page')
    data['list'].forEach(item => {
        let li = document.createElement('li')
        li.textContent = Number(item.value) + 10
        li.setAttribute('id', Number(item.id) + 10)
        currPage.appendChild(li)
    })

    let nextPage = this.nextPage = document.createElement('ul')
    nextPage.classList.add('next_page')
    data['list'].forEach(item => {
        let li = document.createElement('li')
        li.textContent = Number(item.value) + 20
        li.setAttribute('id', Number(item.id) + 20)
        nextPage.appendChild(li)
    })



    this.container.appendChild(prevPage)
    scrollManager.scrollBy(this.prevPage, MAX_HEIGHT)
    this.container.appendChild(currPage)
    this.container.appendChild(nextPage)
    scrollManager.scrollBy(this.nextPage, 0)

    this.monit(currPage)
}

Pa.prototype.monit = function (element) {
    var context = this;
    var currentPageAtTop = true, currentPageAtBottom = false;
    
    context.currPage.addEventListener('scroll', determinePosition);

    var formerPosition, afterPosition;
    document.addEventListener('touchstart', e => {
        formerPosition = e.touches[0].clientY
    })

    var ticking = false, direction;
    document.addEventListener('touchmove', e => {
        if (!ticking) {
            window.requestAnimationFrame(function () {

                afterPosition = e.changedTouches[0].clientY

                setTurnPage();

                if (currentPageAtTop && isTurnPage) {
                    if (determineDirection() == 'down') {
                        console.log('show previous page')
                    } else if (determineDirection() == 'up') {
                        console.log('resume')
                    }
                    context.prevPage.style.transform = 'translateY(' + Math.max(getAccumulatedDistance(), 0) + 'px)';
                } else if (currentPageAtBottom && isTurnPage) {
                    if (determineDirection() == 'up') {
                        console.log('show next page')
                    } else if (determineDirection() == 'down') {
                        console.log('resume')
                    }
                    context.currPage.style.transform = 'translateY(' + Math.min(getAccumulatedDistance(), 0) + 'px)';
                }
                formerPosition = afterPosition;
                ticking = false;
            });
        }
        ticking = true;
    })

    document.addEventListener('touchend', e => {
        if (currentPageAtBottom && isTurnPage && getAccumulatedDistance() < -100) {
            setClazThen(context.currPage, 'go_up', function (el) {
                turnToNextPage();
                resetAccumulatedDistance();
            })
        } else if (currentPageAtTop && isTurnPage && getAccumulatedDistance() >= 100) {
            setClazThen(context.prevPage, 'go_down', function (el) {
                turnToPrevPage();
                resetAccumulatedDistance();
            })
        } else {
            resetAccumulatedDistance();
            context.currPage.style.transform = 'translateY(0%)';
        }
        resetTurnPage();
    })

    function determineDirection() {
        //由旧位置到新位置，如果线径是向上走的，就是 up
        //由旧位置到新位置，如果线径是向下走的，就是 down
        var direction = formerPosition > afterPosition ? 'up' : formerPosition < afterPosition ? 'down' : 'equal';
        console.log('determineDirection: ', direction);
        return direction;
    }

    var accumulatedDistance = 0;
    var getAccumulatedDistance = function () {
        console.log('former accumulatedDistance: ', accumulatedDistance);
        //新位置在旧位置的上方，会是负数
        //新位置在旧位置的下方，会是正数
        accumulatedDistance += afterPosition - formerPosition;
        console.log('after accumulatedDistance: ', accumulatedDistance);
        return accumulatedDistance;
    }
    var resetAccumulatedDistance = function () {
        console.log('resetAccumulatedDistance')
        accumulatedDistance = 0;
    }

    var setClazThen = (function () {
        var latency = 300;
        return function (el, clz, cb) {
            el.classList.add(clz);
            setTimeout(function () {
                cb && cb(el);
            }, latency);
        }
    })();

    var isTurnPage = false, turnPageSetted = false;
    var setTurnPage = function () {
        if (turnPageSetted) {
            console.log('turnPage setted, return')
            return;
        }
        if ((currentPageAtBottom && determineDirection() == 'up') ||
            (currentPageAtTop && determineDirection() == 'down')) {
            turnPageSetted = true;
            isTurnPage = true;
            document.querySelector('.current_page').classList.add('turn_page')
        }
        console.log('isTurnPage: ', isTurnPage);
    }

    var resetTurnPage = function () {
        console.log('resetTurnPage')
        isTurnPage = false;
        turnPageSetted = false;
        document.querySelector('.current_page').classList.remove('turn_page')
    }


    function turnToNextPage() {
        context.currPage.classList.remove('go_up', 'turn_page');
        context.currPage.style.transform = '';

        context.currPage.removeEventListener('scroll', determinePosition);;
        
        // currPage -> next_page, nextPage -> prev_page, prevPage -> current_page
        var tempRef = context.currPage;
        context.currPage = context.nextPage;
        context.nextPage = context.prevPage;
        context.prevPage = tempRef;

        currentPageAtTop = true;
        currentPageAtBottom = false;

        context.currPage.addEventListener('scroll', determinePosition);
        scrollManager.scrollBy(context.prevPage, MAX_HEIGHT);
        scrollManager.scrollBy(context.nextPage, 0);

        context.nextPage.classList.remove('prev_page')
        context.nextPage.classList.add('next_page');
        context.currPage.classList.remove('next_page')
        context.currPage.classList.add('current_page');
        context.prevPage.classList.remove('current_page')
        context.prevPage.classList.add('prev_page');
        
    }

    function turnToPrevPage() {
        context.prevPage.classList.remove('go_down', 'turn_page')

        context.prevPage.style.transform = '';

        currentPageAtTop = false;
        currentPageAtBottom = true;

        context.currPage.removeEventListener('scroll', determinePosition);

        // currPage -> prev_page, prevPage -> next_page, nextPage -> current_page
        var tempRef = context.currPage;
        context.currPage = context.prevPage;
        context.prevPage = context.nextPage;
        context.nextPage = tempRef;

        context.currPage.addEventListener('scroll', determinePosition);
        scrollManager.scrollBy(context.prevPage, MAX_HEIGHT);
        scrollManager.scrollBy(context.nextPage, 0);

        context.nextPage.classList.remove('current_page')
        context.nextPage.classList.add('next_page');
        context.currPage.classList.remove('prev_page')
        context.currPage.classList.add('current_page');
        context.prevPage.classList.remove('next_page')
        context.prevPage.classList.add('prev_page');

    }

    var scrollTicking = false;
    function determinePosition(e){
        var _el = this;
        if(!scrollTicking){
            window.requestAnimationFrame(function () {
                var scrollTop = _el.scrollTop, scrollBottom = _el.scrollHeight - _el.offsetHeight;
                currentPageAtTop = scrollTop == 0;
                currentPageAtBottom = scrollTop == scrollBottom;
                console.log('currentPageAtTop: ' + currentPageAtTop + ' currentPageAtBottom: ' + currentPageAtBottom);
                scrollTicking = false;
            })
        }
        scrollTicking = true;
    }

}




export default Pa
