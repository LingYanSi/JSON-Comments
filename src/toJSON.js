import { ast, tokenizer, getMatchResult } from './parser'
import { getType, getComments, getValue } from './util'

function uuid(len = 8) {
    const S = 'qwertyuioopasdfghjklzxcvbnmQWERTYUIOOPASDFGHJKLZXCVBNM0123456789';
    const LEN = S.length;
    return ' '.repeat(len).split('').map(() => S[Math.floor(Math.random() * LEN)]).join('');
}

// 字符串转JSON
export function toJSON(str) {
    function isNum(any) {
        return /^\d+$/.test(any)
    }

    /**
     * @param {*} ast
     * @param {*} keyValueNode 指对象中的每个keyValue节点，对象上这个字段的注释应该从keyValueNode的comments上读取
     * @param {number} currentIndex 当前元素在数组中的位置
     * @returns
     */
    function run(ast, keyValueNode, currentIndex) {
        const comment = getComments(keyValueNode || ast)
        const [,tiaojian = ''] = comment.match(/\[{2}(.+)\]{2}/) || [] // 获取表达式
        const conditions = tiaojian.trim() ? tiaojian.split('|').map(i => i.trim()) : []

        switch (ast.type) {
            case 'null': {
                return null
            }
            case 'string': {
                let [type] = conditions
                if (type === 'random') {
                    const repeat = Math.round(Math.random() * 30 + 1)
                    return '我是随机string1234'.repeat(repeat)
                }
                if (type === 'img') {
                    return uuid()
                }
                if (type === '+' && currentIndex !== undefined) {
                    return `${currentIndex}`
                }
                if (type === 'id') {
                    return uuid()
                }
                return ast.value.value
            }
            case 'number': {
                const [type, maxNum] = conditions
                if (type === 'random' && isNum(maxNum)) {
                    return Math.round(Number(maxNum) * Math.random())
                }
                if (type === '+' && currentIndex !== undefined) {
                    return currentIndex
                }
                return Number(ast.value.raw)
            }
            case 'bool': {
                const [type] = conditions
                if (type === 'random') {
                    return Math.random() > .5 ? false : true
                }
                return ast.value.raw === 'false' ? false : true
            }
            case 'array': {
                const [type, maxNum] = conditions

                if (!ast.children.length) {
                    return []
                }

                let arr = ast.children

                if (type === 'random' && isNum(maxNum)) {
                    const repeatNum = Math.round(Number(maxNum) * Math.random())

                    arr = Array.from({ length: repeatNum }).fill(ast.children[0])
                } else if (isNum(type)) {
                    arr = Array.from({ length: Number(type) }).fill(ast.children[0])
                }

                // 数组元素也应当从 item上读取注释，而非item.value上读取
                return arr.map((item, index) => run(item.value, item, index))
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
