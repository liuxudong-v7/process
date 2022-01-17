import { constantRoutes } from '@/router'
import { asyncRoutes } from '@/static_config/permsRouterJson'
import store from '@/store'

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 * @param path
 */
function hasPermission(roles, path) {
  if (roles.perms) {
    return Object.keys(roles.perms).some(role => role.split('/').includes(path.replace('/', '').trim()))
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param routes constantRoutes
 * @param roles
 * @param pathKey parentPath + childPath
 */
function filterAsyncRoute(routes, roles) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, route.path)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoute(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  GenerateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes = asyncRoutes
      if (store.getters.level === 1) { // 超级用户不做权限处理
        accessedRoutes = asyncRoutes
      } else {
        Object.keys(roles.perms).some(role => {
          if (!roles.perms[role].includes('query')) {
            delete roles.perms[role]
          }
        })
        accessedRoutes = filterAsyncRoute(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
