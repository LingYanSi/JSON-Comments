const { toJSON, testComments, format } = require('../dist/');

// console.log('测试注释')
// console.log(
//     JSON.stringify(
// toJSON(`
// {
//     "num": 1,
//     "isLove": false,
//     "info": null,
//     "obj": [ //
//         "111" // [[random]] 随机字符串
//     ],
//     // 神经了吗？
//     "list": [ // [[11]] 指定数组长度
//         {
//             "tiny": 1.222, // [[random|100]] 随机数值
//             "id": "", // [[?]] [[id]]
//             "img": "", // [[img]] 随机图片
//             "num": 10, // [[+]] 自增数值，也可以用来做number类型的id
//         }
//     ]
// }
// `), null, 4))

// console.log('测试注释',
// testComments(`
// {
//     "data": 0, // is right
//     "data1": 0, // is right
//     "list": [ // how to say
//         {
//             "name": 111, // for you
//         }
//     ],
//     "empty": {// 11
//         "111": 7
//     },
// }
// `))

console.log(format(`
{ "data": 0, // is right
    "data1": 0, // is right
    "list": [ // how to say
        {
            /* 我这么知道呢
            * 算了吧
            * 真的不知道
            */
            "name"/*不太懂你的罗*/: 111, // for you
            "xx": 234,
            "bb": {
                "1": 2344
            }
        },
        {
            /* 我这么知道呢
                算了吧
            */
            "name"/*不太懂你的罗*/: 111, // for you
        },
    ],
    "ages": [ // 哈哈哈哈哈
        "111
        sdfsdf",// zmlene
        223333, // wubuzhida
    ]
}
`))
