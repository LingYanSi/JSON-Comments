
// 获取节点上的注释
export const getComments = (item) => item.comments.map(i => i.value).join('\n')

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
