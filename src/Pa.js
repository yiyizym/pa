import constant from './constant'
import turnPageManager from './turnPageManager'
import dataManager from './dataManager'

const Pa = function (selector, url) {
    if (!(this instanceof Pa)) {
        return new Pa(selector, url)
    }
    this.container = document.querySelector(selector) || document.createElement('div')
    this.container.classList.add('pa_container')

    dataManager.init({
        url: url
    });

    dataManager.fetchFirstPage().then((data) => {
        this.buildPage(data);
        turnPageManager.init({
            dataManager: dataManager,
            prevPage: this.prevPage,
            currPage: this.currPage,
            nextPage: this.nextPage
        })
    })
}

Pa.prototype.buildPage = function (data) {

    let prevPage = this.prevPage = document.createElement('ul')
    prevPage.classList.add('prev_page')
    

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
    

    this.container.appendChild(prevPage)
    this.prevPage.scrollTop = constant.MAX_HEIGHT;
    this.container.appendChild(currPage)
    this.container.appendChild(nextPage)
    this.nextPage.scrollTop = 0;
}

export default Pa
