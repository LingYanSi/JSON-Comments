
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

// 获取节点类型，如果数组是一个混合类型的数组呢？不考虑这种情况
export const getType = item => {
    if (item.type === 'array' && item.children[0]) {
        return `array: \\[${item.children[0].value.type}\\]`
    }
    return item.type
}

export function testOption(item) {
    // [[?]] [[$option]]
    const comments = getComments(item)
    return parseComment(comments).option
}

function parseComment(comments = []) {
    const allDirective = []
    let option = false
    let enums = []

    const comment = comments.join('\n').replace(/\[{2}([^\]\n]*)\]{2}/g, (_, $1) => {
        $1 = $1.trim()

        if (['?', '$option'].includes($1)) {
            option = true
        } else if (/^\$.+/.test($1)) {
            //
            allDirective.push($1.slice(1))
        } else {
            const someEnums = $1.split('|').map(i => i.trim()).filter(i => i)
            enums.push(...someEnums)
        }
        return ''
    })

    // [[$option]] [[$img]] [[11|222|333|333]] [["sdfsd","sdasdas"]]
    return {
        option, // 是不是可选的
        enums, // 枚举值
        comment, // 真实注释
        allDirective,
    }
}
