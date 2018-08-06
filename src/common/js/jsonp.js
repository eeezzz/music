import originJsonp from 'jsonp'

export default function jsonp(url, data, option) {
  // 參數結構一開始？，後面＆
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  console.log('url', url)
  return new Promise((resolve, reject) => {
    originJsonp(url, option, (err, data) => {
      if (!err) {
        resolve(data)
        // console.log(data)
      } else {
        reject(err)
      }
    })
  })
}

export function param(data) {
  let url = ''
  for (var k in data) {
    // console.log(k, data[k])
    let value = data[k] !== undefined ? data[k] : ''
    url += '&' + k + '=' + encodeURIComponent(value)
  }
  // url 不為空時，要將第一個＆刪到
  return url ? url.substring(1) : ''
}
