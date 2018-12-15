
// 获取节点上的注释
export const getComments = (item) => item.comments.map(i => {
    return i.value
        .split('\n')
        .filter(i => i.trim()) // 过滤空白
        .map(item => '`' + item + '`') // 添加inline-code包裹，避免关键字
        .join('<br />') // 换行转 <br>
}).join('<br />')

// 获取当前节点的值
export const getValue = item => {
    if (!['object', 'array'].includes(item.type)) {
        const { raw, value = raw } = item.value
        return value
    }
    return ''
}

// 获取节点类型
export const getType = item => {
    if (item.type === 'array' && item.children[0]) {
        return `array: \\[${item.children[0].value.type}\\]`
    }
    return item.type
}
