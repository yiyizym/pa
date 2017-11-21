import axios from 'axios'

var page = 0;
var maxPage = 0;
var pageSize = 10;
var total;

export default {
    init(option){
        this.url = option.url;
        this.dataMap = {};
    },

    fetchFirstPage(){
        return this.fetchNextPage().then((data)=> {
            this.increasePage();
            return data;
        });
    },

    fetchNextPage(){
        if(this.dataMap[page]){
            console.log('fetchNextPage, using cached data, current page: ', page)
            return Promise.resolve(this.dataMap[page]);
        }
        console.log('fetchNextPage, using server data, current page: ', page)
        return axios.get(this.url, {
            params: {
                page: page,
                pageSize: pageSize
            },
            transformResponse: [(data) => {
                data = JSON.parse(data);
                total = data.total;
                maxPage = Math.ceil(total / pageSize);
                this.dataMap[page] = data;
                return data;
            }]
        }).then((resp)=>{
            return resp.data;
        })
    },

    fetchPrevPage(){
        if (this.dataMap[page]) {
            console.log('fetchPrevPage, using cached data, current page: ', page)
            return Promise.resolve(this.dataMap[page]);
        }
        console.log('fetchPrevPage, using server data, current page: ', page)
        return axios.get(this.url, {
            params: {
                page: page,
                pageSize: pageSize
            },
            transformResponse: [(resp) => {
                if (resp.status == 200) {
                    total = resp.data.total;
                    maxPage = Math.ceil(total / pageSize);
                    this.dataMap[page] = data;
                    return resp.data;
                }
            }]
        }).then((resp) => {
            return resp.data;
        })
    },

    increasePage(){
        page = page >= maxPage ? page : page + 1;
    },
    decreasePage(){
        page = page <= 0 ? 0 : page - 1;
    }

}