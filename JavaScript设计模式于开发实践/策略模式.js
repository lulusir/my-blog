// bad1
var calculateBonus = function (performanceLevel, salary) {
    if (performanceLevel === "S") {
        return salary * 4
    }
    if (performanceLevel === "A") {
        return salary * 3
    }
    if (performanceLevel === "B") {
        return salary * 2
    }
}

// 传统面向对象策略类写法
// 定义策略类
// 定义环境类
class PreformanceS {
    calculate (salary) {
        return salary * 4
    }
}
class PreformanceA {
    calculate (salary) {
        return salary * 4
    }
}
class PreformanceB {
    calculate (salary) {
        return salary * 4
    }
}

class Bouns {
    constructor () {
        this.salary = null
        this.strategy = null
    }
    setSalary (salary) {
        this.salary = salary
    }
    setStrategy (strategy) {
        this.strategy = strategy
    }
    getBouns () {
        return this.strategy.calculate(this.salary)
    }
}

var boun = new Bouns()
bouns.setSalary(10000)
bouns.setStrategy(new PreformanceS)
console.log(bouns.getBouns)

// 策略模式实现缓动动画
const tween = {
    linear (t, b, c, d) {
        return c*t/d + b
    },
    easeIn (t, b, c, d) {
        return c * (t /= d) * t + b
    }
}

class Animate {
    constructor (dom) {
        this.dom = dom
        this.startTime = 0
        this.startPos = 0 // 起始位置
        this.endPos = 0
        this.propertyName = null // dom节点要改变的css属性名
        this.easing = null // 缓动动画
        this.duration = null
    }

    start (propertyName, endPos, duration, easing) {
        this.startTime = +new Date
        this.startPos = this.dom.getBoundingClientRect()[propertyName] // dom节点起始位置
        this.endPos = endPos
        this.propertyName = propertyName // dom节点要改变的css属性名
        this.easing = tween[easing] // 缓动动画
        this.duration = duration

        const timeId = setInterval(() => {
            if (this.step() === false) {
                clearInterval(timeId)
            }
        }, 19)
    }

    step () {
        const t = +new Date
        // 当前时间大于开始时间和动画持续时间，说明动画已结束
        if (t >= this.startTime + this.duration) {
            this.update(this.endPos) // 更新小球css属性
            return false
        }
        const pos = this.easing(t - this.startTime, this.startPos, 
            this.endPos - this.startPos, this.duration)
        this.update(pos) // 更新小球css属性
    }
    update () {
        this.dom.styls[this.propertyName] = pos + 'px'
    }
}