'use strict';

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * 获取指定起始符与结束符间的字符串
 * @param {string} str
 * @param {string} startTag
 * @param {string} endTag
 */

function getMatchResult() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var startTag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '[';
  var endTag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ']';
  var index = 0;
  var startIndex = -1;
  var openMatch = 0;

  var isEqual = function isEqual(match) {
    return str.slice(index, index + match.length) === match;
  };

  while (index < str.length) {
    var current = str[index];

    if (!openMatch) {
      if (!current.trim()) {
        index += 1;
        continue;
      } else if (isEqual(startTag)) {
        startIndex = index;
        openMatch += 1;
        index += startTag.length;
        continue;
      } else {
        return [undefined, str, undefined];
      }
    }

    if (isEqual(endTag)) {
      openMatch -= 1;
      index += endTag.length;
    } else if (isEqual(startTag)) {
      openMatch += 1;
      index += startTag.length;
    } else {
      index += 1;
    } // 如果index结束的话


    if (!openMatch) {
      return [str.slice(0, index), index, str.slice(startIndex + startTag.length, index - endTag.length)];
    }
  }

  return [undefined, 0, undefined];
}
/**
 * 获取字符串""，处理\"的特殊情况
 * @param {string} [str='']
 * @returns
 */


function matchStr() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var index = 0;
  var isStart = false;

  while (index < str.length) {
    var token = str[index];

    if (index === 0) {
      if (token === '"') {
        isStart = true;
        index += 1;
        continue;
      }

      break;
    }

    if (isStart) {
      if (token == '"') {
        if (str[index - 1] === '\\' && str[index - 2] !== '\\') {
          index += 1;
          continue;
        }

        var all = str.slice(0, index + 1);
        return [all, all.slice(1, -1)];
      }
    }

    index += 1;
  }

  return [];
}

var Reg = {
  // 字符串
  get string() {
    return /^"([^"]*)"/;
  },

  // Bool类型
  get bool() {
    return /^false|^true/;
  },

  // 单行注释
  get lineComment() {
    return /^\n?\s*\/\/([^\n]*)/;
  },

  get number() {
    return /^(\-)?\d+(\.\d+)?/;
  },

  get null() {
    return /^null/;
  }

};
/**
 * JSON字符串转[]token
 * @export
 * @param {string} [str='']
 * @returns {array}
 */

function tokenizer() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var index = 0;
  var tokens = [];

  while (index < str.length) {
    var current = str[index];

    if (current === '[') {
      tokens.push({
        type: 'arrayOpen',
        index: index,
        raw: current
      });
      index += 1;
      continue;
    }

    if (current === ']') {
      tokens.push({
        type: 'arrayClose',
        index: index,
        raw: current
      });
      index += 1;
      continue;
    }

    if (current === '{') {
      tokens.push({
        type: 'objectOpen',
        index: index,
        raw: current
      });
      index += 1;
      continue;
    }

    if (current === '}') {
      tokens.push({
        type: 'objectClose',
        index: index,
        raw: current
      });
      index += 1;
      continue;
    }

    if (current === ':') {
      tokens.push({
        type: 'colon',
        index: index,
        raw: current
      });
      index += 1;
      continue;
    }

    if (current === ',') {
      tokens.push({
        type: 'douhao',
        index: index,
        raw: current
      });
      index += 1;
      continue;
    }

    var extStr = str.slice(index);

    var _matchStr = matchStr(extStr),
        _matchStr2 = _slicedToArray(_matchStr, 2),
        _matchStr2$ = _matchStr2[0],
        stringResult = _matchStr2$ === void 0 ? '' : _matchStr2$,
        stringValue = _matchStr2[1];

    if (stringResult) {
      tokens.push({
        type: 'string',
        index: index,
        value: stringValue,
        raw: stringResult
      });
      index += stringResult.length;
      continue;
    }

    var _ref = extStr.match(Reg.null) || [],
        _ref2 = _slicedToArray(_ref, 1),
        _ref2$ = _ref2[0],
        nullResult = _ref2$ === void 0 ? '' : _ref2$;

    if (nullResult) {
      tokens.push({
        type: 'null',
        index: index,
        raw: nullResult
      });
      index += nullResult.length;
      continue;
    }

    var _ref3 = extStr.match(Reg.bool) || [],
        _ref4 = _slicedToArray(_ref3, 1),
        _ref4$ = _ref4[0],
        boolResult = _ref4$ === void 0 ? '' : _ref4$;

    if (boolResult) {
      tokens.push({
        type: 'bool',
        index: index,
        raw: boolResult
      });
      index += boolResult.length;
      continue;
    }

    var _ref5 = extStr.match(Reg.number) || [],
        _ref6 = _slicedToArray(_ref5, 1),
        _ref6$ = _ref6[0],
        numberResult = _ref6$ === void 0 ? '' : _ref6$;

    if (numberResult) {
      tokens.push({
        type: 'number',
        index: index,
        raw: numberResult
      });
      index += numberResult.length;
      continue;
    }

    var _ref7 = extStr.match(Reg.lineComment) || [],
        _ref8 = _slicedToArray(_ref7, 2),
        _ref8$ = _ref8[0],
        lineCommentResult = _ref8$ === void 0 ? '' : _ref8$,
        lineCommentValue = _ref8[1];

    if (lineCommentResult) {
      tokens.push({
        type: 'comment',
        multi: false,
        index: index,
        value: lineCommentValue,
        raw: lineCommentResult
      });
      index += lineCommentResult.length;
      continue;
    }

    var _getMatchResult = getMatchResult(extStr, '/*', '*/'),
        _getMatchResult2 = _slicedToArray(_getMatchResult, 3),
        _getMatchResult2$ = _getMatchResult2[0],
        multiCommentResult = _getMatchResult2$ === void 0 ? '' : _getMatchResult2$,
        newIndex = _getMatchResult2[1],
        multiCommentValue = _getMatchResult2[2];

    if (multiCommentResult) {
      tokens.push({
        type: 'comment',
        multi: true,
        index: index,
        value: multiCommentValue,
        raw: multiCommentResult
      });
      index += Number(newIndex);
      continue;
    }

    if (/\s/.test(current)) {
      index += 1;
    } else {
      throw new Error("parse error ".concat(index, " >>").concat(extStr));
    }
  } // 当前这一层的数据类型
  // Object key -> any
  // Array any
  // any Object、Array、Number、String、Bool、null
  // 分隔符 :
  // Comment // /* */


  return tokens;
}
/**
 * token数组转AST
 * @export
 * @param {*} [tokens=[]]
 * @returns
 */


function ast() {
  var tokens = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var index = 0;
  var zhen = [];

  function collectComment(trailComment) {
    while (index < tokens.length) {
      var token = tokens[index];

      if (token.type === 'comment') {
        if (trailComment) {
          var _ref9 = token.raw.match(/^(\s*)/) || [],
              _ref10 = _slicedToArray(_ref9, 2),
              _ref10$ = _ref10[1],
              space = _ref10$ === void 0 ? '' : _ref10$;

          if (space.includes('\n')) {
            return;
          }
        }

        zhen.length && zhen[zhen.length - 1].comments.push(token);
        index += 1;
        continue;
      }

      return;
    }
  }

  function setTmpCpmments(keyNode) {
    if (keyNode) {
      zhen.push(keyNode);
    } else {
      collectComment(true);
      zhen.pop();
    }
  }

  function astError() {
    var _console;

    for (var _len = arguments.length, msg = new Array(_len), _key = 0; _key < _len; _key++) {
      msg[_key] = arguments[_key];
    }

    (_console = console).log.apply(_console, [index, tokens[index], tokens].concat(msg));

    throw new Error('ast fail');
  }

  function getOffset() {
    var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    collectComment();
    return tokens[offset + index] || {};
  }

  function previewOffset() {
    var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var cacheIndex = index;
    var current = 0;

    while (cacheIndex < tokens.length) {
      var token = tokens[cacheIndex];

      if (token.type !== 'comment') {
        if (current === offset) {
          return token;
        }

        current += 1;
      }

      cacheIndex += 1;
    }

    return;
  }

  function getAny(keyNode) {
    var token = getOffset();

    if (['null', 'number', 'bool', 'string'].includes(token.type)) {
      index += 1;
      return {
        type: token.type,
        value: token,
        comments: []
      };
    }

    if (token.type === 'objectOpen') {
      index += 1;
      collectComment(true);
      return getObject();
    }

    if (token.type === 'arrayOpen') {
      index += 1;
      collectComment(true);
      return getArray();
    }

    throw new Error('ast fail');
  }

  function getObject() {
    var ele = {
      type: 'object',
      comments: [],
      children: [],
      isClose: false
    };

    while (index < tokens.length) {
      // 如果有注释，应该属属于object -> key的注释
      // 获取注释
      var item = {
        key: null,
        value: null,
        comments: []
      };
      setTmpCpmments(item);
      var token = getOffset();

      if (token.type === 'objectClose') {
        index += 1;
        ele.isClose = true;
        setTmpCpmments();
        return ele;
      }

      if (token.type === 'string') {
        item.key = token;
        index += 1;

        if (getOffset().type === 'colon') {
          index += 1;
          item.value = getAny(item);
          ele.children.push(item);
          var nextToken = previewOffset(0);

          if (nextToken.type === 'objectClose') {
            setTmpCpmments();
            getOffset();
            index += 1;
            return ele;
          } // if (nextToken.type === 'douhao' && previewOffset(1).type !== 'objectClose') {


          if (nextToken.type === 'douhao') {
            getOffset();
            index += 1;
            setTmpCpmments();
            continue;
          }
        }
      }

      astError('期望获取对象闭合标签，或者逗号', item);
    }

    astError();
  }

  function getArray() {
    var ele = {
      type: 'array',
      comments: [],
      // 数组与对象本身是都没有注释的，因为注释只能注解某个元素
      children: [],
      isClose: false
    };

    while (index < tokens.length) {
      var item = {
        comments: [],
        value: null
      };
      setTmpCpmments(item);

      if (getOffset().type === 'arrayClose') {
        index += 1;
        ele.isClose = true;
        setTmpCpmments();
        return ele;
      }

      item.value = getAny();
      ele.children.push(item);
      var nextToken = previewOffset();

      if (nextToken.type === 'arrayClose') {
        setTmpCpmments();
        getOffset();
        index += 1;
        return ele;
      } // if (nextToken.type === 'douhao' && previewOffset(1).type !== 'arrayClose') {


      if (nextToken.type === 'douhao') {
        getOffset();
        index += 1;
        setTmpCpmments();
        continue;
      }

      astError('期望获取逗号，数组闭合标签');
    }

    astError();
  }

  var astTree = getAny();
  return astTree;
} // 获取节点上的注释


var getComments = function getComments(item) {
  return item.comments.map(function (i) {
    return i.value.split('\n').filter(function (i) {
      return i.trim();
    }) // 过滤空白
    .map(function (item) {
      return '`' + item + '`';
    }) // 添加inline-code包裹，避免关键字
    .join('<br />'); // 换行转 <br>
  }).join('<br />');
}; // 获取当前节点的值


var getValue = function getValue(item) {
  if (!['object', 'array'].includes(item.type)) {
    var _item$value = item.value,
        raw = _item$value.raw,
        _item$value$value = _item$value.value,
        value = _item$value$value === void 0 ? raw : _item$value$value;
    return value;
  }

  return '';
}; // 获取节点类型


var getType = function getType(item) {
  if (item.type === 'array' && item.children[0]) {
    return "array: \\[".concat(item.children[0].value.type, "\\]");
  }

  return item.type;
};

function uuid() {
  var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8;
  var S = 'qwertyuioopasdfghjklzxcvbnmQWERTYUIOOPASDFGHJKLZXCVBNM0123456789';
  var LEN = S.length - 1;
  return ' '.repeat(len).split('').map(function () {
    return S[Math.round(Math.random() * LEN)];
  }).join('');
} // 字符串转JSON


function toJSON(str) {
  function isNum(any) {
    return /^\d+$/.test(any);
  }

  function run(ast$$1, keyValueNode) {
    var comment = getComments(keyValueNode || ast$$1);

    var _getMatchResult3 = getMatchResult(comment, '[[', ']]'),
        _getMatchResult4 = _slicedToArray(_getMatchResult3, 3),
        _getMatchResult4$ = _getMatchResult4[2],
        tiaojian = _getMatchResult4$ === void 0 ? '' : _getMatchResult4$;

    var conditions = tiaojian.trim() ? tiaojian.split('|').map(function (i) {
      return i.trim();
    }) : [];

    switch (ast$$1.type) {
      case 'null':
        {
          return null;
        }

      case 'string':
        {
          var _conditions = _slicedToArray(conditions, 1),
              type = _conditions[0];

          if (type === 'random') {
            var repeat = Math.round(Math.random() * 30 + 1);
            return '我是随机string'.repeat(repeat);
          }

          if (type === 'id') {
            return uuid();
          }

          return ast$$1.value.value;
        }

      case 'number':
        {
          var _conditions2 = _slicedToArray(conditions, 2),
              _type = _conditions2[0],
              maxNum = _conditions2[1];

          if (_type === 'random' && isNum(maxNum)) {
            return Math.round(Number(maxNum) * Math.random());
          }

          return Number(ast$$1.value.raw);
        }

      case 'bool':
        {
          return ast$$1.value.raw === 'false' ? false : true;
        }

      case 'array':
        {
          var _conditions3 = _slicedToArray(conditions, 2),
              _type2 = _conditions3[0],
              _maxNum = _conditions3[1];

          if (!ast$$1.children.length) {
            return [];
          }

          if (_type2 === 'random' && isNum(_maxNum)) {
            var repeatNum = Math.round(Number(_maxNum) * Math.random());
            return Array.from({
              length: repeatNum
            }).fill(ast$$1.children[0]).map(function (item) {
              return run(item.value);
            });
          }

          if (isNum(_type2)) {
            return Array.from({
              length: Number(_type2)
            }).fill(ast$$1.children[0]).map(function (item) {
              return run(item.value);
            });
          }

          return ast$$1.children.map(function (item) {
            return run(item.value);
          });
        }

      case 'object':
        {
          var obj = {};
          ast$$1.children.map(function (item) {
            obj[item.key.value] = run(item.value, item);
          });
          return obj;
        }
    }
  }

  var tokens = tokenizer(str);
  var astResult = ast(tokens);
  return run(astResult);
}

function toReadme(str, option) {
  function run(ast$$1, add) {
    var indent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    if (ast$$1.type === 'object') {
      ast$$1.children.forEach(function (item) {
        add("\n| ".concat("&nbsp".repeat(indent)).concat(item.key.value, " | ").concat(getType(item.value), " | `").concat(getValue(item.value) || ' ', "` | ").concat(getComments(item), " |"));
        run(item.value, add, indent + 4);
      });
    }

    if (ast$$1.type === 'array') {
      var item = ast$$1.children[0];

      if (item) {
        var node = item.value;
        var officialComment = 'Notice: 您只需要给数组的第一个元素添加注释';
        add("\n|".concat('&nbsp'.repeat(indent), " 0 | ").concat(node.type, " | ").concat(getValue(node), " | ").concat(getComments(item) || officialComment, "|"));
        run(node, add, indent + 4);
      }
    }
  }

  var tokens = tokenizer(str);
  var astResult = ast(tokens);
  var readmeStr = '';
  run(astResult, function (str) {
    readmeStr += str;
  });
  return readmeStr;
} // 测试是否所有字段都有注释


function testComments(str, option) {
  function isSetComment(ast$$1) {
    return getComments(ast$$1).replace(/\s+/g).length > 0;
  }

  function run(ast$$1) {
    var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var chainKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    switch (ast$$1.type) {
      case 'array':
        {
          if (ast$$1.children.length == 0) {
            console.log(ast$$1);
            throw new Error("".concat(key, "\u6570\u7EC4\u4E0D\u80FD\u4E3A\u7A7A"));
          }

          return ast$$1.children.every(function (item) {
            return run(item.value, '', chainKey + '[0]');
          });
        }

      case 'object':
        {
          // 处理特殊的
          if (ast$$1.children.length == 0 && option.testEmptyObject && option.testEmptyObject(chainKey) // 校验是否允许对象为空
          ) {
              return true;
            }

          if (ast$$1.children.length == 0) {
            throw new Error("".concat(key, "\u5BF9\u8C61\u4E0D\u80FD\u4E3A\u7A7A"));
          }

          return ast$$1.children.every(function (item) {
            var nextChain = [chainKey, item.key.value].filter(function (i) {
              return i;
            }).join('.');

            if (isSetComment(item)) {
              return run(item.value, item.key.value, nextChain);
            }

            throw new Error("".concat(nextChain, " \u8FD8\u6CA1\u6709\u6DFB\u52A0\u6CE8\u91CA\u5462"));
          });
        }

      default:
        {
          return true;
        }
    }
  }

  var tokens = tokenizer(str);
  var astResult = ast(tokens);
  return run(astResult);
}

exports.toJSON = toJSON;
exports.toReadme = toReadme;
exports.testComments = testComments;