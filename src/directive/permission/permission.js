import store from '@/store'
import router from '@/router'

function checkPermission(el, binding) {
  const { value } = binding
  const perms = store.getters && store.getters.perms
  const currPath = router.history.current.path
  if (store.getters.level === 1) return // 超级用户不做权限处理
  if (value && value instanceof Array) {
    if (value.length > 0) {
      const hasPermission = perms[currPath] ? perms[currPath].some(role => {
        return value.includes(role)
      }) : false
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  } else {
    throw new Error(`need roles! Like v-permission="['0','1']"`)
  }
}

export default {
  inserted(el, binding) {
    checkPermission(el, binding)
  },
  update(el, binding) {
    checkPermission(el, binding)
  }
}
