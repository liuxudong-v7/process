import { login, logout, getInfo, fetchLoginTenant, ssologin, ssologout } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { enc } from '@/utils/index'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    level: 0,
    avatar: '',
    agentId: '',
    userId: '',
    rsrcList: [],
    perms: '',
    account: '',
    type: '',
    loginTip: null
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_PERMS: (state, perms) => {
    state.perms = perms
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_LEVEL: (state, level) => {
    state.level = level
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_TENANTID: (state, tenantId) => {
    state.tenantId = tenantId
  },
  SET_USERID: (state, userId) => {
    state.userId = userId
  },
  SET_RSRC_LIST: (state, data) => {
    state.rsrcList = data
  },
  SET_TYPE: (state, type) => {
    state.type = type
  },
  SET_ACCOUNT: (state, account) => {
    state.account = account
  },
  SET_LOGINTIP: (state, loginTip) => {
    state.loginTip = loginTip
  },
  SET_DATA: (state, data) => {
    state.data = data
  }
}

const actions = {

  // user login
  login({ commit }, userInfo) {
    const { account, password, type } = userInfo
    return new Promise((resolve, reject) => {
      login({ account: account.trim(), password: enc(password), type: type }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        commit('SET_LEVEL', data.roleLevel)
        setToken(data.token)
        if (!data) {
          return reject('验证失败，请重新登录。')
        }
        sessionStorage.setItem('id', data.id)
        // sessionStorage.setItem('userType', data.userType)
        sessionStorage.setItem('userType', '0')
        sessionStorage.setItem('name', data.name)
        sessionStorage.setItem('perms', JSON.stringify(data.perms))
        sessionStorage.setItem('level', data.roleLevel)
        sessionStorage.setItem('rsrcList', JSON.stringify(data.perms))
        data.pwd = password
        sessionStorage.setItem('userInfo', JSON.stringify(data))
        resolve()
      }).catch(error => {
        console.log('error submit!!')
        reject(error)
      })
    })
  },
  SSOlogin({ commit }, userInfo) {
    return new Promise((resolve, reject) => {
      ssologin(userInfo).then(response => {
        debugger
        const { data } = response
        commit('SET_TOKEN', data.token)
        commit('SET_LEVEL', data.roleLevel)
        commit('SET_USERID', data.id)
        // commit('SET_LOGINTIP', data.loginTip)
        if (!data) {
          return reject('验证失败，请重新登录。')
        }
        sessionStorage.setItem('id', data.id)
        // sessionStorage.setItem('userType', data.userType)
        sessionStorage.setItem('userType', '1')
        sessionStorage.setItem('name', data.name)
        sessionStorage.setItem('perms', JSON.stringify(data.perms))
        sessionStorage.setItem('level', data.roleLevel)
        sessionStorage.setItem('rsrcList', JSON.stringify(data.perms))
        sessionStorage.setItem('userInfo', JSON.stringify(data))
        resolve()
      }).catch(error => {
        console.log('error submit!!')
        reject(error)
      })
    })
  },
  // tenantLogin({ commit }, userInfo) {
  //   const { account, password, type, tenantId } = userInfo
  //   return new Promise((resolve, reject) => {
  //     fetchLoginTenant({ account: account.trim(), password: enc(password), type: type }).then(response => {
  //       const { data } = response
  //       commit('SET_TOKEN', data.token)
  //       commit('SET_LEVEL', data.roleLevel)
  //       commit('SET_TENANTID', data.tenantId)
  //       setToken(data.token)
  //       if (!data) {
  //         return reject('Verification failed, please Login again.')
  //       }
  //       sessionStorage.setItem('perms', JSON.stringify(data.perms))
  //       sessionStorage.setItem('name', data.name)
  //       sessionStorage.setItem('id', data.id)
  //       sessionStorage.setItem('agentId', data.agentId)
  //       sessionStorage.setItem('rsrcList', JSON.stringify(data.perms))
  //       sessionStorage.setItem('account', account)
  //       sessionStorage.setItem('type', type)
  //       sessionStorage.setItem('data', data)
  //       // const { perms: rsrcList = [] } = data
  //       // commit('SET_PERMS', data.perms)
  //       // commit('SET_NAME', data.name)
  //       // commit('SET_USERID', data.userId)
  //       // commit('SET_AGENTID', data.agentId)
  //       // commit('SET_RSRC_LIST', rsrcList)
  //       // commit('SET_ACCOUNT', null)
  //       // commit('SET_TYPE', null)
  //       resolve()
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // },

  // get user info
  getInfo({ commit, state }) {
    // return new Promise((resolve, reject) => {
    // getInfo(state.token).then(response => {
    //   const { data } = response
    //   if (!data) {
    //     return reject('Verification failed, please Login again.')
    //   }
    //   // const { name, avatar } = data
    //   const { name, agentId } = data.sysUser
    //   const { perms: rsrcList = [] } = data
    commit('SET_PERMS', JSON.parse(sessionStorage.getItem('perms')))
    commit('SET_NAME', sessionStorage.getItem('name'))
    commit('SET_USERID', sessionStorage.getItem('id'))
    // commit('SET_TENANTID', this.tenantId)
    commit('SET_LEVEL', sessionStorage.getItem('level'))
    commit('SET_RSRC_LIST', JSON.parse(sessionStorage.getItem('rsrcList')))
    // commit('SET_ACCOUNT', this.account)
    // commit('SET_TYPE', this.type)
    return state
    // resolve(sessionStorage.getItem('data'))
    // }).catch(error => {
    //   reject(error)
    // })
    // })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  SSOlogout({ commit, state }) {
    return new Promise((resolve, reject) => {
      ssologout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

