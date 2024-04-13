/*去除所有的console.log*/

const cleanLogLoader = function (content) {
    console.log('loader', 'clean-log-loader')
    return content.replaceAll(/console\.log\(.*\);?/g, '')
}

module.exports = cleanLogLoader