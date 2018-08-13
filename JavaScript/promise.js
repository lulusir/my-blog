//定义三种状态
const PENDING = "pending"
const FULFILLED = "fulfilled"
const REJECTED = "rejected"

function MyPromise(fn) {
  let self = this
  self.value = null
  self.error = null
  self.status = PENDING
  self.onFulfilledCallbacks = []
  self.onRejectedCallbacks = []

  function resolve(value) {
    if (self.status === PENDING) {
      setTimeout(() => {
        self.value = value
        self.status = FULFILLED
        self.onFulfilledCallbacks.forEach(fn => {
          fn && fn(self.value)
        })
        // self.onFulfilled && self.onFulfilled(self.value)
      })
    }
  }

  function reject(error) {
    if (self.status === PENDING) {
      setTimeout(() => {
        self.error = error
        self.status = REJECTED
        self.onRejectedCallbacks.forEach(fn => {
          fn && fn(self.error)
        })
        // self.onRejected && self.onRejected(self.error)
      })
    }
  }

  fn(resolve, reject)
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  const self = this
  let bridgePromise;
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => {}
  onRejected = typeof onRejected === 'function' ? onRejected : error => {
    throw error
  }
  if (this.status === PENDING) {
    return bridgePromise = new MyPromise((resolve, reject) => {
      self.onFulfilledCallbacks.push((value) => {
        try {
          let x = onFulfilled(value);
          resolvePromise(bridgePromise, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      })
      self.onRejectedCallbacks.push((error) => {
        try {
          let x = onRejected(error);
          resolvePromise(bridgePromise, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      })
    })
    // this.onRejected = onRejected
  } else if (this.status === FULFILLED) {
    return bridgePromise = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = onFulfilled(self.value)
          resolvePromise(bridgePromise, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    })
  } else if (this.status === REJECTED) {
    return bridgePromise = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = onRejected(self.value)
          resolvePromise(bridgePromise, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    })
  }
  //用来解析回调函数的返回值x，x可能是普通值也可能是个promise对象
  function resolvePromise(bridgePromise, x, resolve, reject) {
    //如果x是一个promise
    if (x instanceof MyPromise) {
      //如果这个promise是pending状态，就在它的then方法里继续执行resolvePromise解析它的结果，直到返回值不是一个pending状态的promise为止
      if (x.status === PENDING) {
        x.then(y => {
          resolvePromise(bridgePromise, y, resolve, reject);
        }, error => {
          reject(error);
        });
      } else {
        x.then(resolve, reject);
      }
      //如果x是一个普通值，就让bridgePromise的状态fulfilled，并把这个值传递下去
    } else {
      resolve(x);
    }
  }
}
// catch 只是语法糖
MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
}


let promise = new MyPromise((resolve, reject) => {
  reject("同步任务执行")
})

promise.then((res) => {
  console.log(res)
}, (err) => {
  console.log(err)
}).then((res) => {
  console.log(res)
}, (err) => {
  console.log(err)
})