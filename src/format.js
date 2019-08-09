import { ast, tokenizer } from './parser'
import { getComments } from './util'

// 代码运行时，进行插入
// 代码行列位置，在ast上进行记录，代码生成完毕后，在指定位置插入

const IDENT = 4;
function addPrevSpace(deep, ...allStrs) {
    return ` `.repeat(deep * IDENT) + allStrs.filter(i => typeof i === 'string').join('')
}

function wrapCommentsInfo(node, deep, str) {
    const len = node.comments.length
    const allComments = node.comments.map(i => i.value)
        .map(i => i.trim())
        .join('\n')
        .split('\n')
        .map(i => i.trim())
        .join('\n' + addPrevSpace(deep))
    const lines = allComments.split('\n').length

    if (len == 0) {
        return str
    } else if (!['array', 'object'].includes(node.value.type) && len == 1 && lines == 1) {
        return str + ' // ' + allComments
    }
    return addPrevSpace(deep) + ['/* ', allComments, ' */'].join('') + '\n' + str
}

/**
 * 格式化 根据AST节点对缩进进行处理，核心意义在于保留注释
 * @param {*} ast
 */
export function format(str) {
    const tokens = tokenizer(str)
    const astResult = ast(tokens)

    const next = (node, deep = 0, option = {}) => {
        const { ident = true } = option;
        if (node.type == 'object') {
            const childrenStr = node.children.map((child, index) => {
                return next(child, deep + 1, {
                    needDot: index !== node.children.length - 1,
                })
            }).join('\n')

            return [
                addPrevSpace(ident ? deep : 0, '{'),
                '\n',
                childrenStr,
                '\n',
                addPrevSpace(deep, '}'),
            ].join('') + (option.needDot ? ',' : '')
        } else if (node.type == 'array') {
            const childrenStr = node.children.map((child, index) => {
                return next(child.value, deep + 1, {
                    needDot: index !== node.children.length - 1,
                })
            }).join('\n')

            return [
                addPrevSpace(ident ? deep : 0, '['),
                '\n',
                childrenStr,
                '\n',
                addPrevSpace(deep, ']'),
            ].join('') + (option.needDot ? ',' : '')
        } else if (node.key) {
            const newDeep = ['object', 'array'].includes(node.value.type) ? deep : (deep + 1)
            // 次元素不要ident
            const item = [`"${node.key.value}"`, next(node.value, newDeep, { ident: false })].join(': ')

            // 首先有看有几条注释，如果只有一条注释的话，就放在末尾，其他都放在顶部
            // 如果对应值是对象 或者 数组，放在顶部
            return wrapCommentsInfo(node, deep, addPrevSpace(deep, item, option.needDot && ','))
        } else {
            let { value } = node.value;
            if (node.type == 'string') {
                value = `"${value}"`
            }

            const newDeep = ident ? deep : 0;
            return wrapCommentsInfo(node, newDeep, addPrevSpace(newDeep, `${value}`, option.needDot && ','))
        }
    }
    return next(astResult)
}
