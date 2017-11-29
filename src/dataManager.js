import axios from 'axios'

var page = -1;
var maxPage = null;
var pageSize = 10;
var total;
var fetchingNextPage, fetchingPrevPage;

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
        console.log('fetchNextPage, currentPage: ', page);
        if(maxPage !== null && page >= maxPage){
            console.log('reach max page, will not fetch next page');
            return Promise.resolve({});
        }
        var nextPageCount = page + 1;
        if (this.dataMap[nextPageCount]){
            console.log('fetchNextPage: ' + nextPageCount + ', using cached data.')
            return Promise.resolve(this.dataMap[nextPageCount]);
        }
        console.log('fetchNextPage: ' + nextPageCount + ', using server data.')
        fetchingNextPage = true;
        return axios.get(this.url, {
            params: {
                page: nextPageCount,
                pageSize: pageSize
            },
            transformResponse: [(data) => {
                data = JSON.parse(data);
                total = data.total;
                maxPage = Math.ceil(total / pageSize) - 1;
                this.dataMap[nextPageCount] = data;
                return data;
            }]
        }).then((resp)=>{
            fetchingNextPage = false;
            console.log('got next page data.');
            return resp.data;
        })
    },

    fetchPrevPage(){
        console.log('fetchNextPage, currentPage: ', page);
        if (page == 0) {
            console.log('reach first page, will not fetch previous page');
            return Promise.resolve({});
        }
        var nextPageCount = page - 1;
        if (this.dataMap[nextPageCount]) {
            console.log('fetchPrevPage: ' + nextPageCount + ', using cached data.')
            return Promise.resolve(this.dataMap[nextPageCount]);
        }
        console.log('fetchPrevPage: ' + nextPageCount + ', using server data.')
        fetchingPrevPage = true;
        return axios.get(this.url, {
            params: {
                page: nextPageCount,
                pageSize: pageSize
            },
            transformResponse: [(resp) => {
                if (resp.status == 200) {
                    total = resp.data.total;
                    maxPage = Math.ceil(total / pageSize) - 1;
                    this.dataMap[nextPageCount] = data;
                    return resp.data;
                }
            }]
        }).then((resp) => {
            fetchingPrevPage = false;
            console.log('got prev page data.');
            return resp.data;
        })
    },

    increasePage(){
        page = page >= maxPage ? page : page + 1;
    },
    decreasePage(){
        page = page <= 0 ? 0 : page - 1;
    },

    isFirstPage(){
        return page == 0;
    },

    isLastPage(){
        console.log('isLastPage: ', page, maxPage);
        return page == maxPage;
    },

    getCurrPage(){
        return page;
    },

    isFetchingPrevPage(){
        return fetchingPrevPage;
    },
    isFetchingNextPage() {
        return fetchingNextPage;
    }

}