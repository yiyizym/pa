var http = require('http')
var url = require('url')

var total = 38;

http.createServer((req, res)=>{
    var params = url.parse(req.url, true).query;

    var page = +params.page;
    var pageSize = +params.pageSize;

    var list = [];

    for (var i = 0; i < pageSize && (page + i) < total; i++){
        list.push({
            value: page + i,
            id: page + i
        })
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
        list: list,
        total: total
    }));
}).listen(3001);