// 添加给打包文件添加注释

const schema = require("./schema.json")

const bannerLoader = function (content, map, meta) {
    console.log('loader', 'banner-loader')
    const option = this.getOptions(schema);

    const prefix = `/*
    *
    * Author: ${option.author}
    * Age: ${option.age}
    */`
    
    return prefix + content
}

module.exports = bannerLoader