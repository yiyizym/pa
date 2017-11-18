import 'whatwg-fetch'
import constant from './constant'
import turnPageManager from './turnPageManager'

const Pa = function (selector, url) {
    if (!(this instanceof Pa)) {
        return new Pa(selector, url)
    }
    this.container = document.querySelector(selector) || document.createElement('div')
    this.container.classList.add('pa_container')
    this.url = url

    this.fetch(url).then(resp => {
        return resp.json()
    }).then((data) => {
        this.buildPage(data);
        turnPageManager.init({
            prevPage: this.prevPage,
            currPage: this.currPage,
            nextPage: this.nextPage
        })
    })
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
    this.prevPage.scrollTop = constant.MAX_HEIGHT;
    this.container.appendChild(currPage)
    this.container.appendChild(nextPage)
    this.nextPage.scrollTop = 0;
}

export default Pa
