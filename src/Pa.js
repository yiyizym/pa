import constant from './constant'
import turnPageManager from './turnPageManager'
import dataManager from './dataManager'
import _ from 'lodash'

require('./Pa.css')

const Pa = function (options) {
    if (!(this instanceof Pa)) {
        return new Pa(options)
    }
    this.options = _.extend({
        itemAdapter: function(item){
            var dom = document.createElement('div');
            dom.setAttribute('id', item.id);
            dom.textContent = item.value;
            return dom;
        },
        dataAdapter: function(data){
            return data;
        }
    },options);
    console.log(this.options);
    this.container = document.querySelector(this.options.selector) || document.createElement('div')
    this.container.classList.add('pa_container')

    dataManager.init({
        url: this.options.url
    });

    dataManager.fetchFirstPage().then((data) => {
        this.buildPage(this.options.dataAdapter(data));
        turnPageManager.init({
            itemAdapter: this.options.itemAdapter,
            dataAdapter: this.options.dataAdapter,
            dataManager: dataManager,
            prevPage: this.prevPage,
            currPage: this.currPage,
            nextPage: this.nextPage
        })
    });

}

Pa.prototype.buildPage = function (data) {

    let prevPage = this.prevPage = document.createElement('ul')
    prevPage.classList.add('prev_page')


    let currPage = this.currPage = document.createElement('ul')
    currPage.classList.add('current_page')
    data['list'].forEach(item => {
        let li = document.createElement('li')
        li.appendChild(this.options.itemAdapter(item));
        currPage.appendChild(li);
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
