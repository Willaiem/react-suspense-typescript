// 🚨 This should NOT be copy/pasted for production code and is only here
// for experimentation purposes. The API for suspense (currently throwing a
// promise) is likely to change before suspense is officially released.
// This was strongly inspired by work done in the React Docs by Dan Abramov
function createResource<T>(promise: Promise<T>) {
  let status: 'pending' | 'success' | 'error' = 'pending'

  let result = promise.then(
    resolved => {
      status = 'success'
      result = resolved
      return result
    },
    rejected => {
      status = 'error'
      result = rejected
    },
  ) as T


  return {
    read() {
      if (status === 'pending') throw result
      if (status === 'error') throw result
      if (status === 'success') return result
      throw new Error('This should be impossible')
    },
  }
}

function preloadImage(src: string) {
  return new Promise<string>(resolve => {
    const img = document.createElement('img')
    img.src = src
    img.onload = () => resolve(src)
  })
}

export { createResource, preloadImage }
