var CreateDiv = (function () {
    var instance
    var CreateDiv = function (html) {
        if (instance) {
            return instance
        }
        this.html = html
        this.init()
        return instance = this
    }
    CreateDiv.prototype.init = function () {
        var div = document.createElement('div')
        div.innerHTML = this.html
        document.body.appendChild(div)
    }
    return CreateDiv
})
// ---------------------分隔符

// 抽象出单利函数 惰性单例 只有getSingleCreateDiv调用的时候才返回
var getSingle = function (fn) {
    var obj
    return function () {
        return obj || (obj = fn.apply(this, arguments))
    }
}

var CreateDiv = function (html) {
    this.html = html
    this.init()
}
CreateDiv.prototype.init = function () {
    var div = document.createElement('div')
    div.innerHTML = this.html
    document.body.appendChild(div)
}

var getSingleCreateDiv = getSingle(CreateDiv) 
var instance = getSingleCreateDiv()


class Singleton {
    constructor (name) {
        this.name = name
        this.instance = null
    }
    getName () {
        return name
    }
    getInstance () {
        if (!this.instance) {
            this.instance = new Singleton
        }
        return this.instance
    }
}

// 因为esm输出的是值的引用，直接就是单例模式了
export let createDiv = new CreateDiv()
