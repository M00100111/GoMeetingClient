import axios from 'axios'
import { useAppStore, useUserInfoStore,useModalStore } from '@/store'

//使用接口合并为config添加自定义属性
declare module 'axios' {
  export interface AxiosRequestConfig {
    needToken?: boolean
  }
} 

// 自定义通用请求
export const baseRequest = axios.create(
  {
    //设置请求相对路径
    baseURL: import.meta.env.VITE_SERVER_URL+import.meta.env.VITE_API,
    //设置超时时间
    timeout: 12000,
  },
)
//引入自定义拦截器
baseRequest.interceptors.request.use(requestSuccess, requestFail)
baseRequest.interceptors.response.use(responseSuccess, responseFail)

// // 定义前台请求
// export const request = axios.create(
//   {
//     baseURL: `${import.meta.env.VITE_API}/web`,
//     timeout: 12000,
//   },
// )
// //引入自定义拦截器
// request.interceptors.request.use(requestSuccess, requestFail)
// request.interceptors.response.use(responseSuccess, responseFail)

/**
 * 发送请求前拦截
 * @param {import('axios').InternalAxiosRequestConfig} config
 */
function requestSuccess(config:any) {
  // 发送该请求需要token
  if (config.needToken) {
    // 获取token
    const { token } = useUserInfoStore()
    // 获取不到token
    if (!token) {
      //拒绝发送请求
      return Promise.reject(new axios.AxiosError('当前没有登录，请先登录！', '401'))
    }
    //需要使用token时使所有请求携带token
    config.headers.Authorization = config.headers.Authorization || `Bearer ${token}`
  }
  //请求放行
  return config
}

/**
 * 请求失败错误处理
 * @param {any} error
 */
function requestFail(error:any) {
  return Promise.reject(error)
}

/**
 * 响应成功拦截
 * @param {import('axios').AxiosResponse} response
 */
function responseSuccess(response:any) {
  const responseData = response.data
  const { code, message } = responseData
  if (code !== 200) { // 与后端约定业务状态码
    // 移出token的响应
    if (code === 1203) {
      // 移除 token
      const userInfoStore = useUserInfoStore()
      //初始化userInfoStore
      userInfoStore.resetLoginState()
    }
    //响应失败
    const modal = useModalStore()
    modal.Notice(message)
    return Promise.reject(responseData)
  }
  //响应成功
  return Promise.resolve(responseData)
}

/**
 * 响应失败拦截
 * @param {any} error
 */
function responseFail(error: any) {
  //解构对象
  const { code, message } = error
  //移除token
  if (code === 401) {
    const modal = useModalStore()
    modal.Notice(message)
    // 移除 token
    const userStore = useUserInfoStore()
    userStore.resetLoginState()
    // 登录弹框
    const appStore = useAppStore()
    // appStore.setLoginFlag(true)
  }
  return Promise.reject(error)
}
