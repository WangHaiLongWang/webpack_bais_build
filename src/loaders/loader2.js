const loader2 = function (content, map, meta) {
    console.log('loader2')
    // this.async 告诉 loader-runner 这个 loader 将会异步地回调。返回 this.callback。
    const callback = this.async()
    setTimeout(() => {
        console.log('async loader2')
        // 调用 callback 后，才会执行下一个 loader
        callback(null, content, map, meta)
    }, 500)
}
const pitch2 = function () {
    console.log('pitch loader2')
    return 'cengfan'
}

module.exports = loader2
module.exports.pitch = pitch2