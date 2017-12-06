一个类似虎扑 iOS 客户端翻页效果的 WEB 端实现

**使用**

```html
<div id="app"></div>
```

```javascript
import Pa from 'Pa';

Pa({
    selector:'#app', // 分页容器
    url: 'http://localhost:3001/' //获取分页数据的接口
})
```

TODO

- 让它变得更易用