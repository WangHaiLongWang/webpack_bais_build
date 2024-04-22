#### github
https://github.com/WangHaiLongWang/webpack_basis_build

#### wepback plugins作用
在 webpack 编译时期，会为不同的编译对象初始化很多不同的 Hook，开发者们可以在编写的插件中监听，也就是用（tap，tapAsync，tapPromise）注册这些钩子，在打包的不同时期，触发（call）这些钩子，就可以在编译的过程中注入特定的逻辑，修改编译的结果来满足开发的需要。



webpack的plugin的工作机制，说通俗一点就类似于框架里面的生命周期机制，它具有很多的生命周期钩子，比如enterOption、run、watchRun、compile等，具体的同学们可以去查阅 官方文档，他能够提供模块/流程中所需要功能的处理的功能。



#### plugins 基础结构
1. 我们在webpack.config.js 使用plugins是通过new的方式来使用的所以，plugin 是一个 JavaScript 命名函数或 JavaScript 类。
2. 在插件函数的 prototype 上定义一个 apply 方法。 ：webpack调用apply方法的时候会传入compiler参数
3. 指定一个绑定到 webpack 自身的事件钩子。 : 在 apply 方法中，通过 compiler 注册指定的事件钩子
4. 处理 webpack 内部实例的特定数据。 : 在回调函数中拿到 compilation 对象，使用 compilation 修改编译后的数据
5. 功能完成后调用 webpack 提供的回调。


```javascript
class WebpackPlugin {    
    constructor() {

    }
    // webpack启动的时候会调用apply方法
    apply (compiler) {

    }
}
module.exports = WebpackPlugin;
```



#### compiler 

compiler 对象在 webpack 启动时就已经被实例化，它和 compilation 实例不同，它是全局唯一的，在它的实例对象中，可以得到所有的配置信息，包括所有注册的 plugins 和 loaders

整个`Compiler`完整地展现了 Webpack 的构建流程：

- **准备阶段**：`make`之前做的事情都属于准备阶段，这阶段的`calback`入参以`compiler`为主；
- **编译阶段**：这阶段以`compilation`的钩子为主，`calback`入参以`compilation`为主；
- **产出阶段**：这阶段从`compilation`开始，最后回到`Compiler`钩子上，`calback`传入参数是跟结果相关的数据，包括`stats`、`error`。

#### compilation
每当文件发生变动时，都会有新的 compilation 实例被创建，它能够访问到所有的模块和依赖，我们可以通过一系列的钩子来访问或者修改打包的 module，assets，chunks。

| 钩子         | 调用时机                                                     | 参数                           | 类型            |
| ------------ | ------------------------------------------------------------ | ------------------------------ | --------------- |
| afterPlugins | 在初始化内部插件集合完成设置之后调用                         | compiler                       | SyncHook        |
| run          | 在开始读取 [`records`](https://link.juejin.cn/?target=https%3A%2F%2Fwww.webpackjs.com%2Fconfiguration%2Fother-options%2F%23recordspath) 之前调用 | compiler                       | AsyncSeriesHook |
| compile      | 在创建一个新的 compilation 创建之前                          | compilationParams              | SyncHook        |
| compilation  | compilation 创建之后执行                                     | compilation, compilationParams | SyncHook        |
| emit         | 输出 asset 到 output 目录之前执行                            | compilation                    | AsyncSeriesHook |
| afterEmit    | 输出 asset 到 output 目录之后执行                            | compilation                    | AsyncSeriesHook |
| done         | 在 compilation 完成时执行                                    | stats                          | AsyncSeriesHook |
|              |                                                              |                                |                 |
|              |                                                              |                                |                 |

#### log-webpack-plugin 
在webpack的执行周期中进行打印操作

```javascript
module.exports = {
    ...,
    plugins: [
        new LogWebpackPlugin({
            emitCallback: () => { console.log('emitCallback') },
            compilationCallback: () => { console.log('compilationCallback') },
            doneCallback: () => { console.log('doneCallback') },
        })
    ]
}

class LogWebpackPlugin {
    constructor(options) {
        this.options = options
    }
    apply(compiler) {
        compiler.hooks.emit.tap.('LogWebpackPlugin', () => {
            this.options.emitCallback();
        })
        compiler.hooks.compileCallback.tap("LogWebpackPlugin", () => {
            this.options.compilationCallback();
        })
        compiler.hooks.done.tap("LogWebpackPlugin", () => {
            this.options.doneCallback();
        })
    }
}

```


#### copy-rename-webpack-plugin
copy 打包后处理的文件，到指定的目录下

```javascript
module.exports = {
    ...,
    plugins: [
        new CopyWebpackPlugin({
            entry: 'main.js',
            output: {
                '../copy/main1.js',
                '../copy/main2.js',
            }
        })
    ]
}


// 
class CopyWebpackPlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        const pluginName = CopyWebpackPlugin.name;
        const { entry, output } = this.options;
        let fileContent = null;
        
        compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) => {
            const assets = compilation.getAssets();
            assets.forEach( { name, source } => {
                if (entry === name) {
                    fileContent = source
                }
            })
            output.forEach( (dir) => {
                compilaction.emitAsset(dir, fileContent);
            })
            fileContent = null;
            callback()
        })
    }
}

// 
class CopyWebpackPluginAgain { 
    constructor(options) {
        this.options = options || {};
    }
    apply(compiler) {
        const pluginName = CopyWebpackPlugin.name;
        const {entry, output} = this.options;
        let fileContent = null;

        const { webpack } = compiler;
        const { Compilation } = webpack;

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            compilation.hooks.processAsset.tap({
                name: pluginName,
                stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
            }, 
            (assets) => {
                Object.entries(assets).forEach([name, source] => {
                    if (entry !== name) return;
                    fileContent = source;
                })
                output.forEach( dir => {
                    compilation.emitAsset(dir, fileContent);
                })
            }
            )
        })
    }
}


```