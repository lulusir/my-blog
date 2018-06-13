function MyPromise (fn) {
  let self = this
  self.value = null
  self.error = null
  self.onFulfilled = null
  self.onRejected = null

  function resolve (value) {
    self.value = value
    self.onFulfilled(self.value)
  }

  function reject (value) {
    self.value = value
    self.onFulfilled(self.value)
  }

  fn(resolve, reject)
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
  this.onFulfilled = onFulfilled
  this.onRejected = onRejected
}