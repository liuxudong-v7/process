import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login/account',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/login/current',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'GET'
  })
}

export function fetchLoginTenant(data) {
  return request({
    url: '/login/tenant',
    method: 'post',
    data
  })
}
export function ssologout() {
  return request({
    url: '/sso/logout',
    method: 'get'
  })
}
export function ssologin(params) {
  return request({
    url: '/sso/validataLogin',
    method: 'GET',
    params
  })
}
