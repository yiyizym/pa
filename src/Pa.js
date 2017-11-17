import 'whatwg-fetch'
import scrollManager from './scrollManager'

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
    this.container.appendChild(currPage)
    this.container.appendChild(nextPage)
    this.monit(currPage)
}

Pa.prototype.monit = function (element) {
    var context = this
    var up_pivot = this.up_pivot = document.createElement('div')
    up_pivot.classList.add('pa_up_pivot')
    element.insertBefore(up_pivot, element.firstChild)

    var down_pivot = this.down_pivot = document.createElement('div')
    down_pivot.classList.add('pa_down_pivot')
    element.appendChild(down_pivot)

    let io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            console.log('see target! ', entry.target, entry.intersectionRatio)
            entry.target.classList.toggle('pa_visible', entry.intersectionRatio === 1)
        })
    }, {
            root: context.container,
            threshold: 1
        });

    io.observe(up_pivot)
    io.observe(down_pivot)

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

                if (context.up_pivot.classList.contains('pa_visible') && isTurnPage) {
                    if (determineDirection() == 'down') {
                        console.log('show previous page')
                    } else if (determineDirection() == 'up') {
                        console.log('resume')
                    }
                    context.prevPage.style.transform = 'translateY(' + Math.max(getAccumulatedDistance(), 0) + 'px)';
                } else if (context.down_pivot.classList.contains('pa_visible') && isTurnPage) {
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
        if (context.down_pivot.classList.contains('pa_visible') && isTurnPage && getAccumulatedDistance() < -100) {
            setClazThen(context.currPage, 'go_up', function (el) {
                turnToNextPage();
                resetAccumulatedDistance();
            })
        } else if (context.up_pivot.classList.contains('pa_visible') && isTurnPage && getAccumulatedDistance() >= 100) {
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
        if ((context.down_pivot.classList.contains('pa_visible') && determineDirection() == 'up') ||
            (context.up_pivot.classList.contains('pa_visible') && determineDirection() == 'down')) {
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
        // context.currPage.classList.add('hidden');

    }

    function turnToPrevPage() {
        context.prevPage.classList.remove('go_down', 'turn_page')
        // context.prevPage.classList.add('hidden');
    }

}




export default Pa
