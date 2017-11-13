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
  this.monit()
  this.container.appendChild(otherul)
  scrollManager.scrollBy(otherul, 1000)
  scrollManager.disableScroll(otherul)
}

Pa.prototype.monit = function () {
  var context = this
  var up_pivot = this.up_pivot = document.createElement('div')
  up_pivot.classList.add('pa_up_pivot')
  this.container.insertBefore(up_pivot, this.container.firstChild)

  var down_pivot = this.down_pivot = document.createElement('div')
  down_pivot.classList.add('pa_down_pivot')
  this.container.appendChild(down_pivot)

  let io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      console.log('see target! ', entry.target, entry.intersectionRatio)
      entry.target.classList.toggle('pa_visible', entry.intersectionRatio === 1)
    })
  }, {
      root: context.container,
      threshold: 1.0
    });

  io.observe(up_pivot)
  io.observe(down_pivot)

  var ts
  document.addEventListener('touchstart', e => {
    ts = e.touches[0].clientY
  })

  var ticking = false
  document.addEventListener('touchmove', e => {
    if(!ticking) {
      window.requestAnimationFrame(function(){

        var te = e.changedTouches[0].clientY
        if(ts > te && context.down_pivot.classList.contains('pa_visible')){
          // down
          let distance = ts - te;
          document.querySelector('.pa_current_page').style = `transform: translate3d(0,${-distance}px,0);`
          console.log('show next page')
        } else if(context.up_pivot.classList.contains('pa_visible')){
          //up
          console.log('show previous page')
        }
        ticking = false;
      });
    }
    ticking = true;
  })

  document.addEventListener('touchend', e => {
    if(/* direction == 'up' && threshold > 100 */ true){
      context.ul.classList.add('fly_up')
    }
  })

}




export default Pa
