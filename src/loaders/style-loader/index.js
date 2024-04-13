

// 本loader会动态创建 style 标签，将处理好的样式插入到 head 标签中。全体注意！本loader会充分体现 pitch loader 的使用场景。接下来我们分步实现它。
/**
 * 
 * 在style loader的 normal 阶段实现能执行js的逻辑，并获取 css loader 返回的样式内容；
 * 将style loader的逻辑放在 pitch 阶段，通过 pitch loader 函数的 remainingRequest 参数，获取 css loader 的相对路径，把它作为模块引入style loader中，然后让webpack通过 import 语句递归执行引入模块的运算结果。最后输出样式内容。

 * */
const styleLoader = function (content) {
    console.log('loader', 'style-loader')
    return content
}

const styleLoaderPitch = function (remainingRequest, precedingRequest) {
    console.log('loader-pitch', 'style-loader')
    /* 
      将绝对路径：
        C:\Front End\projects\webpack-loader-plugin\node_modules\css-loader\dist\cjs.js!C:\Front End\projects\webpack-loader-plugin\src\css\index.css
      转换为相对路径：
        ../../node_modules/css-loader/dist/cjs.js!./index.css
    */
    const resolvePath = remainingRequest.split('!').map(absolutePath => {
        // 通过本 loader 所在的上下文环境和绝对路径，返回一个相对路径
        return this.utils.contextify(this.context,absolutePath)
    }).join('!')
    // 创建 style 标签，将 css-loader 处理后的内容插入到 html 中
    // '!!' 在 inline loader内跳过 pre，normal，post loader的执行，这里跳过引入的 css loader 后续阶段的自动执行
    const script = `
        import style from '!!${resolvePath}'
        const styleEle = document.createElement("style");
        styleEle.innerHTML = style
        document.head.appendChild(styleEle);
    `
    // 进行熔断操作，将 后续的pitch loader终止 直接进入到 上一个 normal loader
    return script

}

module.exports = styleLoader
module.exports.pitch = styleLoaderPitch

