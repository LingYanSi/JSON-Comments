import { ast, tokenizer, getMatchResult } from './parser'
import { getType, getComments, getValue } from './util'

function uuid(len = 8) {
    const S = 'qwertyuioopasdfghjklzxcvbnmQWERTYUIOOPASDFGHJKLZXCVBNM0123456789';
    const LEN = S.length - 1;
    return ' '.repeat(len).split('').map(() => S[Math.round(Math.random() * LEN)]).join('');
}

// 字符串转JSON
export function toJSON(str) {
    function isNum(any) {
        return /^\d+$/.test(any)
    }

    function run(ast, keyValueNode) {
        const comment = getComments(keyValueNode || ast)
        const [,,tiaojian = ''] = getMatchResult(comment, '[[', ']]')
        const conditions = tiaojian.trim() ? tiaojian.split('|').map(i => i.trim()) : []

        switch (ast.type) {
            case 'null': {
                return null
            }
            case 'string': {
                let [type] = conditions
                if (type === 'random') {
                    const repeat = Math.round(Math.random() * 30 + 1)
                    return '我是随机string'.repeat(repeat)
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
                return Number(ast.value.raw)
            }
            case 'bool': {
                return ast.value.raw === 'false' ? false : true
            }
            case 'array': {
                const [type, maxNum] = conditions

                if (!ast.children.length) {
                    return []
                }

                if (type === 'random' && isNum(maxNum)) {
                    const repeatNum = Math.round(Number(maxNum) * Math.random())

                    return Array.from({ length: repeatNum })
                        .fill(ast.children[0])
                        .map(item => run(item.value))
                }

                if (isNum(type)) {
                    return Array.from({ length: Number(type) })
                        .fill(ast.children[0])
                        .map(item => run(item.value))
                }

                return ast.children.map(item => run(item.value))
            }
            case 'object': {
                const obj = {}
                ast.children.map(item => {
                    obj[item.key.value] = run(item.value, item)
                })

                return obj
            }
        }
    }

    const tokens = tokenizer(str)
    const astResult = ast(tokens)
    return run(astResult)
}
