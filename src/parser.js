/**
 * 获取指定起始符与结束符间的字符串
 * @param {string} str
 * @param {string} startTag
 * @param {string} endTag
 */
export function getMatchResult(str = '', startTag = '[', endTag = ']') {
    let index = 0
    let startIndex = -1
    let openMatch = 0

    const isEqual = match => str.slice(index, index + match.length) === match

    while (index < str.length) {
        const current = str[index]
        if (!openMatch) {
            if (!current.trim()) {
                index += 1
                continue
            } else if (isEqual(startTag)) {
                startIndex = index
                openMatch += 1
                index += startTag.length
                continue
            } else {
                return [undefined, str, undefined]
            }
        }

        if (isEqual(endTag)) {
            openMatch -= 1
            index += endTag.length
        } else if (isEqual(startTag)) {
            openMatch += 1
            index += startTag.length
        } else {
            index += 1
        }

        // 如果index结束的话

        if (!openMatch) {
            return [
                str.slice(0, index),
                index,
                str.slice(startIndex + startTag.length, index - endTag.length)
            ]
        }
    }

    return [undefined, 0, undefined]
}

/**
 * 获取字符串""，处理\"的特殊情况
 * @param {string} [str='']
 * @returns
 */
function matchStr(str = '') {
    let index = 0
    let isStart = false
    while (index < str.length) {
        const token = str[index]
        if (index === 0) {
            if (token === '"') {
                isStart = true
                index += 1
                continue
            }
            break
        }

        if (isStart) {
            if (token == '"') {
                if (str[index - 1] === '\\' && str[index - 2] !== '\\') {
                    index += 1
                    continue
                }
                const all = str.slice(0, index + 1)
                return [all, all.slice(1, -1)]
            }
        }
        index += 1
    }
    return []
}

const Reg = {
    // 字符串
    get string() {
        return /^"([^"]*)"/
    },
    // Bool类型
    get bool() {
        return /^false|^true/
    },
    // 单行注释
    get lineComment() {
        return /^\n?\s*\/\/([^\n]*)/
    },
    get number() {
        return /^(\-)?\d+(\.\d+)?/
    },
    get null() {
        return /^null/
    },
}

/**
 * JSON字符串转[]token
 * @export
 * @param {string} [str='']
 * @returns {array}
 */
export function tokenizer(str = '') {
    let index = 0
    const tokens = []

    while (index < str.length) {
        const current = str[index]
        if (current === '[') {
            tokens.push({
                type: 'arrayOpen',
                index,
                raw: current,
            })
            index += 1
            continue
        }

        if (current === ']') {
            tokens.push({
                type: 'arrayClose',
                index,
                raw: current,
            })
            index += 1
            continue
        }

        if (current === '{') {
            tokens.push({
                type: 'objectOpen',
                index,
                raw: current,
            })
            index += 1
            continue
        }

        if (current === '}') {
            tokens.push({
                type: 'objectClose',
                index,
                raw: current,
            })
            index += 1
            continue
        }

        if (current === ':') {
            tokens.push({
                type: 'colon',
                index,
                raw: current,
            })
            index += 1
            continue
        }

        if (current === ',') {
            tokens.push({
                type: 'douhao',
                index,
                raw: current,
            })
            index += 1
            continue
        }

        const extStr = str.slice(index)

        const [stringResult = '', stringValue] = matchStr(extStr)
        if (stringResult) {
            tokens.push({
                type: 'string',
                index,
                value: stringValue,
                raw: stringResult,
            })
            index += stringResult.length
            continue
        }

        const [nullResult = ''] = extStr.match(Reg.null) || []
        if (nullResult) {
            tokens.push({
                type: 'null',
                index,
                raw: nullResult,
            })
            index += nullResult.length
            continue
        }

        const [boolResult = ''] = extStr.match(Reg.bool) || []
        if (boolResult) {
            tokens.push({
                type: 'bool',
                index,
                raw: boolResult,
            })
            index += boolResult.length
            continue
        }

        const [numberResult = ''] = extStr.match(Reg.number) || []
        if (numberResult) {
            tokens.push({
                type: 'number',
                index,
                raw: numberResult,
            })
            index += numberResult.length
            continue
        }

        const [lineCommentResult = '', lineCommentValue] = extStr.match(Reg.lineComment) || []
        if (lineCommentResult) {
            tokens.push({
                type: 'comment',
                multi: false,
                index,
                value: lineCommentValue,
                raw: lineCommentResult,
            })
            index += lineCommentResult.length
            continue
        }

        const [multiCommentResult = '', newIndex, multiCommentValue] = getMatchResult(extStr, '/*', '*/')
        if (multiCommentResult) {
            tokens.push({
                type: 'comment',
                multi: true,
                index,
                value: multiCommentValue,
                raw: multiCommentResult,
            })
            index += Number(newIndex)
            continue
        }

        if (/\s/.test(current)) {
            index += 1
        } else {
            throw new Error(`parse error ${index} >>${extStr}`)
        }
    }
    // 当前这一层的数据类型
    // Object key -> any
    // Array any
    // any Object、Array、Number、String、Bool、null

    // 分隔符 :
    // Comment // /* */
    return tokens
}

/**
 * token数组转AST
 * @export
 * @param {*} [tokens=[]]
 * @returns
 */
export function ast(tokens = []) {
    let index = 0

    const zhen = []
    function collectComment(trailComment) {
        while (index < tokens.length) {
            const token = tokens[index]
            if (token.type === 'comment') {
                if (trailComment) {
                    const [, space = ''] = token.raw.match(/^(\s*)/) || []
                    if (space.includes('\n')) {
                        return
                    }
                }
                zhen.length && zhen[zhen.length - 1].comments.push(token)
                index += 1
                continue
            }
            return
        }
    }

    function setTmpCpmments(keyNode) {
        if (keyNode) {
            zhen.push(keyNode)
        } else {
            collectComment(true)
            zhen.pop()
        }
    }

    function astError(...msg) {
        console.log(index, tokens[index], tokens, ...msg)
        throw new Error('ast fail')
    }

    function getOffset(offset = 0) {
        collectComment()
        return tokens[offset + index] || {}
    }

    function previewOffset(offset = 0) {
        let cacheIndex = index
        let current = 0
        while (cacheIndex < tokens.length) {
            const token = tokens[cacheIndex]
            if (token.type !== 'comment') {
                if (current === offset) {
                    return token
                }
                current += 1
            }
            cacheIndex += 1
        }
        return
    }

    function getAny(keyNode) {
        const token = getOffset()
        if (['null', 'number', 'bool', 'string'].includes(token.type)) {
            index += 1
            return {
                type: token.type,
                value: token,
                comments: [],
            }
        }

        if (token.type === 'objectOpen') {
            index += 1
            collectComment(true)
            return getObject()
        }

        if (token.type === 'arrayOpen') {
            index += 1
            collectComment(true)
            return getArray()
        }

        throw new Error('ast fail')
    }

    function getObject() {
        const ele = {
            type: 'object',
            comments: [],
            children: [],
            isClose: false,
        }

        while (index < tokens.length) {
            // 如果有注释，应该属属于object -> key的注释
            // 获取注释
            const item = {
                key: null,
                value: null,
                comments: [],
            }
            setTmpCpmments(item)
            const token = getOffset()

            if (token.type === 'objectClose') {
                index += 1
                ele.isClose = true
                setTmpCpmments()
                return ele
            }

            if (token.type === 'string') {
                item.key = token
                index += 1

                if (getOffset().type === 'colon') {
                    index += 1

                    item.value = getAny(item)
                    ele.children.push(item)

                    const nextToken = previewOffset(0)

                    if (nextToken.type === 'objectClose') {
                        setTmpCpmments()
                        getOffset()
                        index += 1
                        return ele
                    }

                    // if (nextToken.type === 'douhao' && previewOffset(1).type !== 'objectClose') {
                    if (nextToken.type === 'douhao') {
                        getOffset()
                        index += 1
                        setTmpCpmments()
                        continue
                    }
                }
            }

            astError('期望获取对象闭合标签，或者逗号', item)
        }

        astError()
    }

    function getArray() {
        const ele = {
            type: 'array',
            comments: [], // 数组与对象本身是都没有注释的，因为注释只能注解某个元素
            children: [],
            isClose: false,
        }

        while (index < tokens.length) {
            const item = {
                comments: [],
                value: null,
            }
            setTmpCpmments(item)

            if (getOffset().type === 'arrayClose') {
                index += 1
                ele.isClose = true
                setTmpCpmments()
                return ele
            }

            item.value = getAny()
            ele.children.push(item)

            const nextToken = previewOffset()

            if (nextToken.type === 'arrayClose') {
                setTmpCpmments()
                getOffset()
                index += 1
                return ele
            }

            // if (nextToken.type === 'douhao' && previewOffset(1).type !== 'arrayClose') {
            if (nextToken.type === 'douhao') {
                getOffset()
                index += 1
                setTmpCpmments()
                continue
            }

            astError('期望获取逗号，数组闭合标签')
        }
        astError()
    }

    const astTree = getAny()

    return astTree
}
