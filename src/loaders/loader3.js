
function loader3(content, map, meta) {
    console.log(content, 'loader3')
    return content 
}
const pitch3 = function () {
    console.log('pitch loader3')
}

module.exports = loader3
module.exports.pitch = pitch3