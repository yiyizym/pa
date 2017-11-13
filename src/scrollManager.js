export default {
  // left: 37, up: 38, right: 39, down: 40,
  // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
  keys: {37: 1, 38: 1, 39: 1, 40: 1},
  preventDefault: function (e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
  },
  preventDefaultForScrollKeys: function (e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
  },
  disableScroll: function (el) {
    if (el.addEventListener){ // older FF
      el.addEventListener('DOMMouseScroll', this.preventDefault, false);
    }
    el.onwheel = this.preventDefault; // modern standard
    el.onmousewheel = el.onmousewheel = this.preventDefault; // older browsers, IE
    el.ontouchmove  = this.preventDefault; // mobile
    el.onkeydown  = this.preventDefaultForScrollKeys;
  },

  enableScroll: function (el) {
    if (el.removeEventListener){
      el.removeEventListener('DOMMouseScroll', this.preventDefault, false);
    }
    el.onmousewheel = el.onmousewheel = null;
    el.onwheel = null;
    el.ontouchmove = null;
    el.onkeydown = null;
  },

  scrollBy: function (el, num) {
    console.log('>>>> scrollTop: ', num)
    el.scrollTop = num
  }
}