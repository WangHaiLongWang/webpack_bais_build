import "./styles/index.css"

console.log('whl111')

let b = () => {
    console.log('233')
}

let proxyObject = {
    name: 'foo',
    value: '111'
}

let a = new Proxy(proxyObject, {
    get: function (target, key, receiver) {
        return Reflect.get(target, key, receiver)
    },

    set: function (target, key, value, receiver) {
        return Reflect.set(target, key, value, receiver);
    }
})