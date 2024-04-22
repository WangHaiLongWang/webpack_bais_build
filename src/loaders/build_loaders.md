#### github
https://github.com/WangHaiLongWang/webpack_basis_build

#### loaders 作用

loader 本质上是导出为函数的 JavaScript 模块。loader runner 会调用此函数，然后将上一个 loader 产生的结果或者资源文件传入进去。函数中的 this 作为上下文会被 webpack 填充，并且 loader runner 中包含一些实用的方法，比如可以使 loader 调用方式变为异步，或者获取 query 参数。
到这里就非常清楚了，loader的本质就是函数模块，既然是函数，我们关注这个函数的入参，出参，功能，即可。接下来我们搭建webpack的基础环境，给大家展示最基本的loader结构。

#### loaders 基础结构

从上述可知 loaders 是一个函数


```javascript 
/**
 * @param {string | Buffer} content 源文件内容
 * @param {object}  [map] 可以被 https://github.com/mozilla/source-map 使用的 SourceMap 数据
 * @param {any} [meta] meta数据，可以是任何内容
 * */ 

function webpackLoader(content, map, meta) {
    // webpack loader 代码
}

module.exports = webpackLoader;

```

#### loaders 执行顺序
每个loaders 都会获取到content， 进行处理完成后 都会return 出content 作为下一个loaders的入参

loader在执行顺序上分为以下4类，仅需有印象即可，后续会进行大量的演示。

pre：前置loader
normal：普通loader
inline：内联loader
post：后置loader

loader的执行顺序遵循以下原则：
默认的执行优先级为 pre，normal，inline，post
相同优先级的loader执行顺序为 从右往左，从下往上
了解loader的基本分类后，我们来看看它的示例。

```javascript 

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'loader1.js'
            },
            {
                test: /\.js$/,
                loader: 'loader2.js'
            },
            {
                test: /\.js$/,
                loader: 'loader3.js'
            },
        ]
    }
}
// 正确的执行顺序为
'loader3' , 'loader2' , 'loader1'

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'loader1.js'
                enforce: 'pre'
            },
            {
                test: /\.js$/,
                loader: 'loader2.js',
            },
            {
                test: /\.js$/,
                loader: 'loader3.js',
                enforce: 'post'
            }
        ]
    }
}
// 正确的执行顺序为
'loader1' , 'loader2' , 'loader3'
```

配置webpack resolveLoader 寻找定义的loader
```javascript 
module.exports = {
    entry: path.resolve(__dirname, './src/index.js'),
    output: path.resolve(__dirname, './dist'),
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'loader1',
                enforce: 'pre'
            },
            {
                test: /\.js$/,
                loader: 'loader2',
            },
            {
                test: /\.js/,
                loader: 'loader3',
                enforce: 'post'
            }
        ]
    },
    resolveLoader: {
        modules: [
            // 默认在 node_modules 与 src/loaders 的目录下寻找loader
            // 'node_modules',
            path.resolve(__dirname, './src/loader.js')
        ]
    }
}
```

#### 使用方式
loader在使用方式上分为 同步 loader，异步 loader，raw loader，pitch loader 这4类

1. 同步loader.js
```javascript 
const loader1 = function (content, map, meta) {
    /**
        param1：error 是否有错误
        param2：content 处理后的内容
        param3：source-map 信息可继续传递 source-map
        param4：meta 给下一个 loader 传递的参数
     * */ 
    this.callback(null, content, map, meta)
}
module.exports = loader1
```
2. 异步loader.js
异步loader并不是让渡当前loader的执行权力，给下一个loader先执行。而是卡住当前的执行进程，方便你在异步的时间里去进行一些额外的操作。待这些操作完成后，任务进程交给下一个loader。 接下来我们演示异步loader，为了演示方便，先去除配置文件中的 enforce 配置。

```javascript
const loader2 = function (content, map, meta) {
    console.log('loader2')
    const callback = this.async()
    setTimeout(() => {
        console.log('async loader2')
        callback(null, content, map, meta)
    },500)
}
module.exports = loader2

```

3. raw loader
raw loader 一般用于处理 Buffer 数据流的文件。在处理图片，字体图标等经常会使用它，这里为了演示方便，我们用它处理js。

```javascript
const rawLoader = function (content) {
    console.log(content);
    return content;
}
rawLoader.raw = true;
module.exports = rawLoader
//webpack.config.js
module.exports = {
    ...,
    module: {
        rules: [
            test: /\.js$/,
            loader: 'raw-loader'
        ]
    }
}
// 打包测试，文件被打包成为buffer格式
```

4. pitch loader
loader模块中导出函数的 pitch 属性指向的函数就叫 pitch loader。它的使用场景是 当前loader依赖上个loader的输出结果，且该结果为js而非webpack处理后的资源。 此时loader的逻辑处理更适合放在pitch loader。记住它的使用场景，下一章节我们手写 style-loader 时会进行详细讲解。

```javascript
/** 
    * @remainingRequest 剩余请求 
    * @precedingRequest 前置请求 
    * @data 数据对象 
*/ 
function (remainingRequest, precedingRequest, data) { 
  // code
};

```

```javascript
// loader1
const loader1 = function (content, map, meta) {
  console.log('loader1')
  /* 
    param1：error 是否有错误
    param2：content 处理后的内容
    param3：source-map 信息可继续传递 source-map
    param4：meta 给下一个 loader 传递的参数
  */
  this.callback(null, content, map, meta)
}

const pitch1 = function() {
  console.log('pitch loader1')
}

module.exports = loader1
module.exports.pitch = pitch1

// loader2
const loader2 = function (content, map, meta) {
  console.log('loader2')
  // this.async 告诉 loader-runner 这个 loader 将会异步地回调。返回 this.callback。
  const callback = this.async()
  setTimeout(() => {
    console.log('async loader2')
    // 调用 callback 后，才会执行下一个 loader
    callback(null, content, map, meta)
  },500)
}

const pitch2 = function() {
  console.log('pitch loader2')
}

module.exports = loader2
module.exports.pitch = pitch2

// webpack.config.js
module.exports = {
  // ...
  module:{
    rules:[{
      test: /\.js$/,
      loader: 'loader1',
      enforce: 'pre'
    },{
      // 无enforce属性，默认为 normal loader
      test: /\.js$/,
      loader: 'loader2',
    },{
      test: /\.js$/,
      loader: 'loader3',
      enforce: 'post'
    }]
    /* rules:[{
      test: /\.js$/,
      loader: 'raw-loader',
    }] */
  },
  // ...
}




// 运行结果为
pitch loader2
pitch loader1
loader1
loader2
async loader2
loader3
```

5. 熔断机制

![image](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8227322415be4ab6be461bc5fc92b705~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.webp)


执行到 loader2 时由于 pitch loader2 有返回值，导致后面所有的loader都不再执行，转而回到上一个loader的 normal loader。执行顺序如下图，这就是loader执行的熔断机制

```javascript
const pitch2 = function() {
  console.log('pitch loader2')
  return 'cengfan'
}
```
。

#### 练习
##### clean-log-loader
```javascript 
/*去除所有的console.log*/
const cleanLogLoader = function (content) {
    return content.replaceAll(/console\.log\(.*\);?/g, '')
}
module.exports = cleanLogLoader

// 使用正则将 content 文件中所有不带 '@' 的 console 语句替换成空
const cleanLogLoader = function(content) {
    return content.replace(/console\.log\([^@]*\);?/g,'')
}

module.exports = cleanLogLoader
```

##### banner-loader
添加给打包文件添加注释

初始化 /banner-loader/schema.json 的内容，本 json 文件用于验证从 webpack.config.js 获取的 options 配置是否合法。 type,properties 用于定义接收的 options 参数类型。additionalProperties 定义是否能追加参数，如果为false，增加参数会报错

```javascript
// schema
{
    "type": "object",
    "properties": {
        "author": {
            "type": "string"
        },
        "age": {
            "type": "number"
        }
    },
    "additionalProperties": true
}

// bannerLoader
const schema = require("./schema.json")

const bannerLoader = function (content, map, meta) {
    const option = this.getOptions(schema);

    const prefix = `/*
    *
    * Author: ${option.author}
    * Age: ${option.age}
    */`

    return prefix + content
}

module.exports = bannerLoader
```

##### bable-loader
本loader用于将 ES next 转换为 ES5，babel-loader 之前的文章已经列举过它的详细作用，这里我们通过引入官方的预设，分步手写一个 babel-loader。

下载@babel/core核心
npm install @babel/core

```javascript
// schema.json
{
    "type": "object",
    "properties": {
        "presets": {
            "type": "array"
        }
    }
    "additionalProperties": true
}


// babel-loader
const { transform } = require('@babel/core');
const schema = require('./schema.json');

const babelLoader = function(content, map, meta) { 
    const options = this.options(schema);
    const callback = this.async();

    transform(content, options, function (err, result) {
        // { code, map, ast} = result;
        if (err) {
            return callback(err);
        } else {
            return callback(null, result.code)
        }
    })
}

module.exports = babelLoader

```


##### style-loader
// 本loader会动态创建 style 标签，将处理好的样式插入到 head 标签中。
在 normal loader 中 返回的content 是一个进行编译运行的js代码，所以我们不能直接使用content，要对其进行处理，一下是两种处理方式，我们选中第二种
 * 
 * 1.在style loader的 normal 阶段实现能执行js的逻辑，并获取 css loader 返回的样式内容；
 * 2. 将style loader的逻辑放在 pitch 阶段，通过 pitch loader 函数的 remainingRequest 参数，获取 css loader 的相对路径，把它作为模块引入style loader中，然后让webpack通过 import 语句递归执行引入模块的运算结果。最后输出样式内容。

 * */

style-loader
```javascript
const schame = require('./schame.json');

const styleLoader = function (content, map, meta) {
    return content
}

const styleLoaderPitch = function (remainingRequest, precedingRequest) {    
    /* 
      将绝对路径：
        C:\Front End\projects\webpack-loader-plugin\node_modules\css-loader\dist\cjs.js!C:\Front End\projects\webpack-loader-plugin\src\css\index.css
      转换为相对路径：
        ../../node_modules/css-loader/dist/cjs.js!./index.css
    */
    const resolvePath = remainingRequest.split('!').map(absolutePath => {
        return this.utils.contextify(this.context, absolutePath);
    }).join('!')

    // 创建 style 标签，将 css-loader 处理后的内容插入到 html 中
    // '!!' 在 inline loader内跳过 pre，normal，post loader的执行，这里跳过引入的 css loader 后续阶段的自动执行
    const script = `
        import style from "!!`${resolvePath}`"
        const styleEl = document.createElement("style");
        styleEl.innerHTML = style
        document.head.appendChild(styleEl);
    `
    return script
}

module.exports = styleLoader;
module.exports.pitch = styleLoaderPitch

```

在webpack.config.js 中
```javascript

{
    ..., 
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    }
                ]
            }
        ]
    }

}

```