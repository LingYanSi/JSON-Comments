const { toJSON, testComments } = require('../dist/');

console.log(toJSON)

console.log(
    toJSON(`
{
    "num": 1,
    "isLove": false,
    "info": null,
    "obj": {
        "flow": {

        }
    },
    // 神经了吗？
    "list": [ // [[10[[]]
        {
            "tiny": 1.222, // [[random|100]]
            "content": "", // [[random]]
            "age": 18,
        }
    ]
}
`))

console.log('测试注释',
testComments(`
{
    "data": 0, // is right
    "data1": 0, // is right
    "list": [ // how to say
        {
            "name": 111, // for you
        }
    ],
    "empty": {// 11
        "111": 7
    },
}
`))
