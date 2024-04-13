const babel = require("@babel/core");
const schema = require("./schema");

const babelLoader = function (content, map, meta) {
    console.log('loader', 'babel-loader')
    const callback = this.async();
    const options = this.getOptions(schema);
    /**
     * @param1 code 代码内容
     * @param2 options 代码内容
     * @param3 callbcak 为回调函数 其中 result 返回值为 { code, map, ast } 对象
     * */ 
    babel.transform(content, options, function(err, result) {
        // result 为 { code, map, ast }
        if (err) {
            return callback(err); 
        }
        else {
            return callback(null, result.code)
        }
    })
}

module.exports = babelLoader