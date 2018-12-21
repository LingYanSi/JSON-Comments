import { ast, tokenizer } from './parser'
import { getComments } from './util'

// 测试是否所有字段都有注释
export function testComments(str, option) {
    function isSetComment(ast) {
        return getComments(ast).replace(/\s+/g).length > 0
    }
    function run(ast, key = '', chainKey = '') {
        switch (ast.type) {
            case 'array': {
                if (ast.children.length == 0) {
                    throw new Error(`${key}数组不能为空`)
                }
                return ast.children.every(item => {
                    return run(item.value, '', chainKey + '[0]')
                })
            }
            case 'object': {
                // 处理特殊的
                if (
                    ast.children.length == 0
                    && option.testEmptyObject
                    && option.testEmptyObject(chainKey) // 校验是否允许对象为空
                ) {
                    return true;
                }

                if (ast.children.length == 0) {
                    throw new Error(`${key}对象不能为空`)
                }

                return ast.children.every(item => {
                    const nextChain = [chainKey, item.key.value].filter(i => i).join('.')
                    if (isSetComment(item)) {
                        return run(item.value, item.key.value, nextChain)
                    }
                    throw new Error(`${nextChain} 还没有添加注释呢`)
                })
            }
            default: {
                return true
            }
        }
    }

    const tokens = tokenizer(str)
    const astResult = ast(tokens)
    return run(astResult)
}
