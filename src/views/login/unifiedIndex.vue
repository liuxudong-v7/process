<template>
<div style="height: 100%">
  <el-row style="height: 100%">
      <el-col :span="24" style="height: 5%">
        <img :src="log">
      </el-col>
    <el-col :span="24" style="height: 90%">
        <img style="width: 100%; height: 100%; " :src="beijing">
      <div style="position: absolute; top: 10%; padding: 11%;">
        <transition name="el-zoom-in-center">
          <img v-show="show" style="height: 150px; " :src="bgLong">
        </transition>
      </div>
      <transition name="el-zoom-in-top">
      <div v-show="show" style="position: absolute; right: 15%;top: 20%;">
        <div style="width: 330px; background: #ffffff">
          <el-tabs type="border-card" @tab-click="handleClick">
            <el-tab-pane label="机构登录" >
              <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">
                <br><br>
                <div style="width: 85%;margin:0 auto">
                          <el-input
                            ref="username"
                            placeholder="请输入用户名"
                            prefix-icon="el-icon-user-solid"
                            v-model="loginForm.account"
                            name="username"
                            type="text"
                            tabindex="1"
                            auto-complete="on"
                          />
                </div>
                <br>
                <div style="width: 85%;margin:0 auto">
                          <el-input
                            :key="passwordType"
                            prefix-icon="el-icon-s-claim"
                            ref="password"
                            v-model="loginForm.password"
                            :type="passwordType"
                            placeholder="请输入密码"
                            name="password"
                            tabindex="2"
                            auto-complete="on"
                            @keyup.enter.native="handleLogin"
                          />
                </div>
                <br>
                <div style="width: 85%;margin:0 auto">
                  <el-row>
                    <el-col :span="12" >
                        <el-input style="width: 150px" placeholder="请输入验证码" prefix-icon="el-icon-s-ticket" v-model="code"></el-input>
                    </el-col>
                    <el-col :span="12">
                      <div @click="refreshCode">
                        <s-identify style="width: 150px" v-if="identifyIf == false"  :identifyCode="identifyCode" ></s-identify>
                      </div>
                    </el-col>
                  </el-row>
                </div>
                <br>
                <div style="width: 85%;margin:0 auto">
    <!--              <el-checkbox v-model="checked">记住我的登录名</el-checkbox>-->
                </div>
                <br>
                <div style="width: 85%;margin:0 auto">
                  <el-button style="width: 100%" type="primary" @click.native.prevent="handleLogin">立即登录</el-button>
                </div>
              </el-form>
            </el-tab-pane>
<!--            <el-tab-pane label="租户登录">-->
<!--              <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">-->
<!--                <br><br>-->
<!--                <div style="width: 85%;margin:0 auto">-->
<!--                  <el-input-->
<!--                    ref="username"-->
<!--                    placeholder="请输入用户名"-->
<!--                    prefix-icon="el-icon-user-solid"-->
<!--                    v-model="loginForm.account"-->
<!--                    name="username"-->
<!--                    type="text"-->
<!--                    tabindex="1"-->
<!--                    auto-complete="on"-->
<!--                  />-->
<!--                </div>-->
<!--                <br>-->
<!--                <div style="width: 85%;margin:0 auto">-->
<!--                  <el-input-->
<!--                    :key="passwordType"-->
<!--                    prefix-icon="el-icon-s-claim"-->
<!--                    ref="password"-->
<!--                    v-model="loginForm.password"-->
<!--                    :type="passwordType"-->
<!--                    placeholder="请输入密码"-->
<!--                    name="password"-->
<!--                    tabindex="2"-->
<!--                    auto-complete="on"-->
<!--                    @keyup.enter.native="handleLogin"-->
<!--                  />-->
<!--                </div>-->
<!--                <br>-->
<!--                <div style="width: 85%;margin:0 auto">-->
<!--                  <el-row>-->
<!--                    <el-col :span="12">-->
<!--                      <el-input style="width: 150px" placeholder="请输入验证码" prefix-icon="el-icon-s-ticket" v-model="code"></el-input>-->
<!--                    </el-col>-->
<!--                    <el-col :span="12">-->
<!--                      <div @click="refreshCode">-->
<!--                        <s-identify v-if="identifyIf == true" style="width: 150px;" :identifyCode="identifyCode" ></s-identify>-->
<!--                      </div>-->
<!--                    </el-col>-->
<!--                  </el-row>-->
<!--                </div>-->
<!--                <br>-->
<!--                <div style="width: 85%;margin:0 auto">-->
<!--                  &lt;!&ndash;              <el-checkbox v-model="checked">记住我的登录名</el-checkbox>&ndash;&gt;-->
<!--                </div>-->
<!--                <br>-->
<!--                <div style="width: 85%;margin:0 auto">-->
<!--                  <el-button style="width: 100%" type="primary" @click.native.prevent="tenantLogin">立即登录</el-button>-->
<!--                </div>-->
<!--              </el-form>-->
<!--            </el-tab-pane>-->
          </el-tabs>


        </div>
      </div>
      </transition>
    </el-col>
    <el-col :span="24" style="height: 5%">
      <span style="float:left; padding: 10px">Copyright@2020 成都天用唯勤科技股份有限公司研发部出品</span>
      <span style="float:right; padding: 10px; color: #1482f0"><a
        href="http://www.tienon.com/">http://www.tienon.com/</a></span>
    </el-col>
  </el-row>
</div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import { fetchLoginTenant } from '@/api/user'
import bgLong from '../../assets/images/bg_long.png'
import beijing from '../../assets/images/beijing.png'
import log from '../../assets/images/log.png'

import SIdentify from '@/utils/verification'

export default {
  name: 'UnifiedIndex',
  components: { SIdentify },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 3) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      show: false,
      identifyIf: false,
      identifyCodes: '1234567890',
      identifyCode: '',
      code: '',

      log: log,
      bgLong: bgLong,
      beijing: beijing,
      loginForm: {
        account: 'admin',
        password: 'a1234567',
        tenantId: '',
        type: 'account'
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        tenantId: [{ required: true, trigger: 'blur' }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      tenantList: []
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    this.refreshCode()
    // 租户接口暂时屏蔽
    /*fetchLoginTenant().then(res => {
      this.tenantList = res.data
    })*/
    setTimeout(()=>{  //设置延迟执行
      this.show = true
    },500);
  },
  mounted() {
    this.identifyCode = ''
    this.makeCode(this.identifyCodes, 4)
  },
  methods: {
    //验证码
    randomNum(min, max) {
      return Math.floor(Math.random() * (max - min) + min)
    },
    refreshCode() {
      this.identifyCode = ''
      this.makeCode(this.identifyCodes, 4)
    },
    makeCode(o, l) {
      for (let i = 0; i < l; i++) {
        this.identifyCode += this.identifyCodes[
          this.randomNum(0, this.identifyCodes.length)
        ]
      }
    },
    handleClick(tab, event) {
      if (tab.index === '0'){
        this.identifyIf = false
      }
      if (tab.index === '1'){
        this.identifyIf = true
      }
      this.refreshCode()
    },


    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      // 验证码 暂时不开启
      // if (this.code == ''){
      //   this.$message.error('请输入验证码');
      //   return;
      // }
      // if (this.identifyCode !== this.code){
      //   this.code = ''
      //   this.refreshCode()
      //   this.$message.error('验证码错误');
      //   return
      // }
      this.loginForm.type = 'account'
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            this.$router.push({ path: '/' }) //this.redirect || '/'
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    tenantLogin() {
      this.loginForm.type = 'tenant'
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/tenantLogin', this.loginForm).then(() => {
            this.$router.push({ path: '/' }) //this.redirect || '/'
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }

  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
.login-container .el-input input {
color: $cursor;
}
}

/* reset element-ui css */
.login-container {
.el-select {
width: 92% !important;
}

.el-select > .el-input {
width: 100%;
}

.el-input, .el-select {
display: inline-block;
height: 47px;
width: 85%;

input {
  background: transparent;
  border: 0px;
  -webkit-appearance: none;
  border-radius: 0px;
  padding: 12px 5px 12px 15px;
  color: $light_gray;
  height: 47px;
  caret-color: $cursor;

  &:-webkit-autofill {
    box-shadow: 0 0 0px 1000px $bg inset !important;
    -webkit-text-fill-color: $cursor !important;
  }
}
}

.el-form-item {
border: 1px solid rgba(255, 255, 255, 0.1);
background: rgba(0, 0, 0, 0.1);
border-radius: 5px;
color: #454545;
}
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
min-height: 100%;
width: 100%;
background-color: $bg;
overflow: hidden;

.login-form {
position: relative;
width: 520px;
max-width: 100%;
padding: 160px 35px 0;
margin: 0 auto;
overflow: hidden;
}

.tips {
font-size: 14px;
color: #fff;
margin-bottom: 10px;

span {
  &:first-of-type {
    margin-right: 16px;
  }
}
}

.svg-container {
padding: 6px 5px 6px 15px;
color: $dark_gray;
vertical-align: middle;
width: 30px;
display: inline-block;
}

.title-container {
position: relative;

.title {
  font-size: 26px;
  color: $light_gray;
  margin: 0px auto 40px auto;
  text-align: center;
  font-weight: bold;
}
}

.show-pwd {
position: absolute;
right: 10px;
top: 7px;
font-size: 16px;
color: $dark_gray;
cursor: pointer;
user-select: none;
}
}


/*验证码样式*/
.code {
width: 124px;
height: 31px;
border: 1px solid rgba(186, 186, 186, 1);
}

.login-code {
cursor: pointer;
}

</style>
