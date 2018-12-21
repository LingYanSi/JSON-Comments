import { ast, tokenizer, getMatchResult } from './parser'
import { getType, getValue } from './util'

const getComments = (item) => item.comments.map(i => {
    return i.value
        .split('\n')
        .filter(i => i.trim()) // 过滤空白
        .map(item => '`' + item + '`') // 添加inline-code包裹，避免关键字
        .join('<br />') // 换行转 <br>
}).join('<br />')

export function toReadme(str, option) {
    function run(ast, add, indent = 0) {
        if (ast.type === 'object') {
            ast.children.forEach((item) => {
                add(`\n| ${"&nbsp".repeat(indent)}${item.key.value} | ${getType(item.value)} | \`${getValue(item.value) || ' '}\` | ${getComments(item)} |`)
                run(item.value, add, indent + 4)
            })
        }

        if (ast.type === 'array') {
            const item = ast.children[0]
            if (item) {
                const { value: node } = item
                const officialComment = 'Notice: 您只需要给数组的第一个元素添加注释'
                add(`\n|${'&nbsp'.repeat(indent)} 0 | ${node.type} | ${getValue(node)} | ${getComments(item) || officialComment}|`)
                run(node, add, indent + 4)
            }
        }
    }

    const tokens = tokenizer(str)
    const astResult = ast(tokens)
    let readmeStr = ''
    run(astResult, (str) => {
        readmeStr += str
    })
    return readmeStr
}
