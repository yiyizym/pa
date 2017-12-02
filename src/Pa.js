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
    this.container.classList.add('pa_container');

    this.prevPage = document.createElement('ul')
    this.prevPage.classList.add('prev_page')
    this.container.appendChild(this.prevPage)

    this.currPage = document.createElement('ul')
    this.currPage.classList.add('current_page', 'loading');
    this.container.appendChild(this.currPage)

    this.nextPage = document.createElement('ul')
    this.nextPage.classList.add('next_page')
    this.container.appendChild(this.nextPage)


    dataManager.init({
        url: this.options.url
    });

    dataManager.fetchFirstPage().then((data) => {
        this.buildPage(this.currPage, data);
        turnPageManager.init({
            paginator: this,
            dataManager: dataManager
        })
    });

}

Pa.prototype.buildPage = function(page, data){
    page.classList.remove('loading');
    page.innerHTML = '';

    data = this.options.dataAdapter(data);
    data['list'].forEach(item => {
        let li = document.createElement('li');
        li.appendChild(this.options.itemAdapter(item));
        page.appendChild(li);
    })
}

export default Pa
