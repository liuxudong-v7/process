import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control
import permission from '@/directive/permission'
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)

// vue
Vue.prototype.perms = ''
Vue.prototype.name = ''
Vue.prototype.id = ''
Vue.prototype.level = ''
Vue.prototype.tenantId = ''
Vue.prototype.rsrcList = ''
Vue.prototype.account = ''
Vue.prototype.type = ''
Vue.prototype.data = ''

Vue.config.productionTip = false

Vue.directive('grant', {
  inserted: (el, binding) => {
    const { value } = binding
    const petmName = binding.value.split('_')[0]
    const petmValue = binding.value.split('_')[1]
    const rsrcList = store.getters && store.getters.rsrcList
    if (value) {
      if (rsrcList[petmName].indexOf(petmValue) === -1) el.parentNode && el.parentNode.removeChild(el)
    } else {
      throw new Error(`need limits! like v-grant="'test'"`)
    }
  }
})

Vue.directive('permission', permission) // 注册全局功能权限指令

//回车时让焦点跳到下一控件
Vue.directive('enterToNext',{
  inserted:function(el){
    console.log("enterToNext...")
    //let frm = el.querySelector('.el-form');
    let inputs = el.querySelectorAll('input');
    console.log(inputs);
    //绑定回写事件
    for( var i = 0 ;i < inputs.length ; i++ ){
      inputs[i].setAttribute("keyFocusIndex",i);
      inputs[i].addEventListener('keyup', (ev) => {
        if (ev.keyCode === 13) {
          let targetTo = ev.srcElement.getAttribute('keyFocusTo');
          if(targetTo){
            this.$refs[targetTo].$el.focus();
          }else{
            var attrIndex = ev.srcElement.getAttribute('keyFocusIndex');
            var ctlI = parseInt(attrIndex);
            if(ctlI<inputs.length-1)
              inputs[ctlI+1].focus();
          }
        }
      });
    }
  },
});

Vue.prototype.$_has = function(value) {
  let isAllow = false
  const petmName = value.split('_')[0]
  const petmValue = value.split('_')[1]
  const rsrcList = store.getters && store.getters.rsrcList
  if (value) {
    if (rsrcList[petmName].indexOf(petmValue) >= 0) {
      isAllow = true
    }
  }
  return isAllow
}

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
