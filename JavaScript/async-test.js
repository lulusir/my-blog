function fetchName (err) {
  return new Promise((resolve, reject) => {
    if (err) {
      reject('fetchName wrong')
    }
    setTimeout(() => {
      resolve('lujs')
    }, 3000)
  })
}

function fetchAvatar (err) {
  return new Promise((resolve, reject) => {
    if (err) {
      reject('fetchAvatar wrong')
    }
    setTimeout(() => {
      resolve('https://avatars3.githubusercontent.com/u/16317354?s=88&v=4')
    }, 4000)
  })
}

function fetchList (id, err) {
  return new Promise((resolve, reject) => {
    if (err) {
      reject('fetchList wrong')
    }
    setTimeout(() => {
      resolve(`id is : ${id}`)
    }, 5000)
  })
}

async function fetchUser (err) {
  const name = await fetchName(err)
  const avatar = await fetchAvatar(err)
  return {
    name,
    avatar
  }
}

async function fetchUserParallel () {
  const namePromise = fetchName()
  const avatarPromise = fetchAvatar()
  return {
    name: await namePromise,
    avatar: await avatarPromise 
  }
}

async function getListWrong () {
  const ary = [1, 2, 3, 4]
  const list = ary.map(
    async (id) => await fetchList(id))
  return list
}

async function getList () {
  const ary = [1, 2, 3, 4]
  const list = await Promise.all(
    ary.map(
      (id) => fetchList(id)))
  return list
}

/**
 * 包装promise, 使其返回统一的错误格式
 * @param {Promise} promise 
 */
function to (promise) {
  return promise.then(res => [null, res]).catch(err => [err])
}

(async function () {
  // 请求一个接着一个执行
  console.time('should be 7s ')
  const user = await fetchUser()
  console.log(user)
  console.timeEnd('should be 7s ')

  // 两个请求并发
  console.time('should be 4s ')
  const user2 = await fetchUserParallel()
  console.log(user2)
  console.timeEnd('should be 4s ')

  // 使用promise并发请求
  // 这个例子不能返回正确的结果
  console.time('should be 5s ')
  const listWrong = await getListWrong()
  console.log('listWrong: ', listWrong)
  console.timeEnd('should be 5s ')

  // 使用Promise.all获取正确的结果
  console.time('should be 5s ')
  const list = await getList()
  console.log(list)
  console.timeEnd('should be 5s ')

  // try...catch
  try {
    const user3 = await fetchUser(true)
  } catch (err) {
    console.error('user3 error:', err)
  }

  // 包装promise, 使其返回统一的错误格式
  const [err, res] = await to(fetchUser(true))
  if (err) {
    console.error('touser err:', err)
  }

  // 因为async 返回的promise对象，所以可以使用catch
  const user4 = await fetchUser(true).catch(err => {
    console.error('user4 error:', err)
  })
})()