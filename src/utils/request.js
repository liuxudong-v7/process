import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // baseURL: '/uihost',
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Auth-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    if (res.status) {
      if (res.status !== 0) {
        Message({
          message: res.message || 'Error',
          type: 'error',
          duration: 5 * 1000
        })
        // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
        return Promise.reject(new Error(res.message || 'Error'))
      } else {
        return res
      }
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    const data = error.response.data
    if (data && data.status === 401) {
      // Cookie丢失后处理,然后跳转到登录页
      MessageBox.confirm(data.error, '确认登出', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        store.dispatch('user/resetToken').then(() => {
          window.location.href = '/#/login'
        })
      })
      return
    } else {
      // Message({
      //   message: error.response.data.message,
      //   type: 'error',
      //   duration: 5 * 1000,
      //   offset: 200
      // })
      MessageBox.alert(error.response.data.message || error.response.data.error, '错误', {
        confirmButtonText: '确定',
        type: 'error'
      })
    }
    return Promise.reject(error)
  }
)

export default service
