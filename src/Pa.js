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

    let ul = this.ul = document.createElement('ul')
    ul.classList.add('pa_current_page')
    data['list'].forEach(item => {
        let li = document.createElement('li')
        li.textContent = item.value
        li.setAttribute('id', item.id)
        ul.appendChild(li)
    })

    let otherul = this.otherul = document.createElement('ul')
    otherul.classList.add('pa_other_page')
    data['list'].forEach(item => {
        let li = document.createElement('li')
        li.textContent = Number(item.value) + 10
        li.setAttribute('id', Number(item.id) + 10)
        otherul.appendChild(li)
    })



    this.container.appendChild(ul)
    //   this.container.appendChild(otherul)
    //   scrollManager.scrollBy(otherul, 1000)
    //   scrollManager.disableScroll(otherul)
    this.monit(ul)
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

                if (determineDirection() == 'down' && context.down_pivot.classList.contains('pa_visible')) {
                    // down
                    console.log('show next page')
                } else if (determineDirection() == 'up' && context.up_pivot.classList.contains('pa_visible')) {
                    // up
                    console.log('show previous page')
                }
                document.querySelector('.pa_current_page').style.transform = 'translateY('+ getAccumulatedDistance() + 'px)';
                formerPosition = afterPosition;
                ticking = false;
            });
        }
        ticking = true;
    })

    document.addEventListener('touchend', e => {
        if (context.down_pivot.classList.contains('pa_visible') && (determineDirection() == 'down' || determineDirection() == 'equal') && getAccumulatedDistance() < -100) {
            setClazThen(context.ul, 'go_up',function(el){
                el.classList.remove('go_up');
                el.style.transform = 'translateY(100%)';
                resetAccumulatedDistance();
            })
        } else if (context.down_pivot.classList.contains('pa_visible') && (determineDirection() == 'down' || determineDirection() == 'equal') && getAccumulatedDistance() >= -100){
            setClazThen(context.ul, 'go_down', function (el) {
                el.classList.remove('go_down');
                el.style.transform = 'translateY(0%)';
                resetAccumulatedDistance();
            })
        }
    })

    function determineDirection(){
        var direction = formerPosition > afterPosition ? 'down' : formerPosition < afterPosition ? 'up' : 'equal';
        console.log('determineDirection: ', direction);
        return direction;
    }

    var accumulatedDistance = 0;
    var getAccumulatedDistance = function(){
        accumulatedDistance += afterPosition - formerPosition;
        console.log('accumulatedDistance: ', accumulatedDistance);
        return accumulatedDistance;
    }
    var resetAccumulatedDistance = function(){
        accumulatedDistance = 0;
    }

    var setClazThen = (function(){
        var latency = 300;
        return function(el, clz, cb){
            el.classList.add(clz);
            setTimeout(function(){
                cb && cb(el);
            }, latency);
        }
    })();

}




export default Pa
