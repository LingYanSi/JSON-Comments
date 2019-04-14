import { ast, tokenizer, getMatchResult } from './parser'
import { getType, getComments, getValue } from './util'

/**
 * 返回随机字符串
 * @param {number} [len=8]
 * @returns {string}
 */
function uuid(len = 8) {
    const S = 'qwertyuioopasdfghjklzxcvbnmQWERTYUIOOPASDFGHJKLZXCVBNM0123456789';
    const LEN = S.length;
    return ' '.repeat(len).split('').map(() => S[Math.floor(Math.random() * LEN)]).join('');
}

/**
 * 判断是不是纯数字
 * @param {*} any
 * @returns
 */
function isNum(any) {
    return /^\d+$/.test(any)
}

/**
 * 获取非undefined值
 * @param {*} values
 * @returns
 */
function realValue(...values) {
    return values.find(i => i !== undefined)
}

/**
 * 默认注释语法处理
 * @param {object} ast
 * @param {array} conditions
 * @param {number} currentIndex
 * @returns
 */
function defaultPlugin(ast, conditions, currentIndex) {
    const [type, ...option] = conditions
    switch (ast.type) {
        case 'string': {
            if (type === 'random') {
                const repeat = Math.round(Math.random() * 30 + 1)
                return '我是随机string1234'.repeat(repeat)
            }
            if (type === 'img') {
                return '/xxx/xxx/xxxxxx'
            }
            if (type === '+' && currentIndex !== undefined) {
                let initNum = realValue(option[0], ast.value.value)
                return `${currentIndex + (Number(initNum) || 0)}`
            }
            if (type === 'id') {
                return uuid()
            }
            break;
        }

        case 'number': {
            const [maxNum] = option
            if (type === 'random' && isNum(maxNum)) {
                return Math.round(Number(maxNum) * Math.random())
            }

            if (['+', 'id'].includes(type) && currentIndex !== undefined) {
                let initNum = realValue(option[0], ast.value.value)
                return currentIndex + (Number(initNum) || 0)
            }
        }

        case 'bool': {
            if (type === 'random') {
                return Math.random() > .5 ? false : true
            }
        }

        case 'array': {
            const [maxNum] = option

            if (type === 'random' && isNum(maxNum)) {
                const repeatNum = Math.round(Number(maxNum) * Math.random())

                return Array.from({ length: repeatNum }).fill(ast.children[0])
            } else if (isNum(type)) {
                return Array.from({ length: Number(type) }).fill(ast.children[0])
            }
        }

        default:
            break;
    }
}

// 处理注释，也方便添加plugin
function handleCommentSyntax(plugins = [], ast, conditions, currentIndex) {
    let value

    // 如果某个plugin返回了值，就不会继续往下执行
    plugins.some(fn => {
        if (typeof fn === 'function') {
            value = fn(ast, conditions, currentIndex)
        }
        return value !== undefined
    })

    return value
}

// 字符串转JSON
export function toJSON(str, option = {}) {
    const plugins = [option.plugin, defaultPlugin];
    /**
     * @param {*} ast
     * @param {*} keyValueNode 指对象中的每个keyValue节点，对象上这个字段的注释应该从keyValueNode的comments上读取
     * @param {number} currentIndex 当前元素在数组中的位置
     * @returns
     */
    function run(ast, keyValueNode, currentIndex) {
        const comment = getComments(keyValueNode || ast)
        const [,tiaojian = ''] = comment.match(/\[{2}(.+)\]{2}/) || [] // 获取表达式
        const conditions = tiaojian.split('|').map(i => i.trim()).filter(i => i)

        const { type } = ast;
        switch (type) {
            case 'null': {
                return ast.value.value
            }
            case 'string': {
                return realValue(
                    handleCommentSyntax(plugins, ast, conditions, currentIndex),
                    ast.value.value
                )
            }
            case 'number': {
                return realValue(
                    handleCommentSyntax(plugins, ast, conditions, currentIndex),
                    ast.value.value
                )
            }
            case 'bool': {
                return realValue(
                    handleCommentSyntax(plugins, ast, conditions, currentIndex),
                    ast.value.value
                )
            }
            case 'array': {
                if (!ast.children.length) {
                    return []
                }

                // 数组元素也应当从 item上读取注释，而非item.value上读取
                return realValue(
                    handleCommentSyntax(plugins, ast, conditions, currentIndex),
                    ast.children
                ).map((item, index) => run(item.value, item, index))
            }
            case 'object': {
                const obj = {}
                ast.children.map(item => {
                    obj[item.key.value] = run(item.value, item, currentIndex)
                })

                return obj
            }
        }
    }

    const tokens = tokenizer(str)
    const astResult = ast(tokens)
    return run(astResult)
}
