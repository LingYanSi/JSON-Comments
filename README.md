# JSON-Comments

提供以下功能
- 带注释JSON -> JSON
- 带注释JSON -> readme
- 校验是否每个字段都含有注释

## use
```js
import { testComments, toJSON, toReadme } from 'JSON-comments'

testComments(jsonStr) // 返回true false 如果解析错误会报错
toJSON(jsonStr) // 返回json
toReadme(jsonStr) // 返回readme字符串
```
