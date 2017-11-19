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
        return this.fetchNextPage()
    },

    fetchNextPage(){
        return axios.get(this.url, {
            params: {
                page: page,
                pageSize: pageSize
            },
            transformResponse: [(data) => {
                data = JSON.parse(data);
                total = data.total;
                maxPage = Math.ceil(total / pageSize);
                page = page >= maxPage ? page : page + 1;
                return data;
            }]
        }).then((resp)=>{
            return resp.data;
        })
    },

    fetchPrevPage(){
        // return axios.get(this.url, {
        //     params: {
        //         page: page,
        //         pageSize: pageSize
        //     },
        //     transformResponse: [(resp) => {
        //         if (resp.status == 200) {
        //             total = resp.data.total;
        //             maxPage = Math.ceil(total / pageSize);
        //             page = page >= maxPage ? page : page + 1;
        //             return resp.data;
        //         }
        //     }]
        // })
    }
}