<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="manImg" class="user-avatar">
          <span class="user-name">{{ name }}</span>
          <i class="el-icon-setting" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item v-if="isPassword" @click.native="changePassword">
            <span style="display:block;"><i class="el-icon-lock" />修改密码</span>
          </el-dropdown-item>
          <el-divider v-if="isPassword" />
          <el-dropdown-item @click.native="logouts">
            <span style="display:block;"><i class="el-icon-switch-button" />退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <el-dialog title="修改密码" :visible.sync="dialogFormVisible" width="600px" :show-close="!isSimplePwd()" :close-on-press-escape="false" :close-on-click-modal="false">
      <el-form ref="ruleForm" :rules="rules" :model="ruleForm">
        <el-form-item label="旧密码" :label-width="formLabelWidth" prop="oldpassword">
          <el-input v-model="ruleForm.oldpassword" placeholder="请输入旧密码" show-password type="password" @paste.native.capture.prevent="handlePaste" />
        </el-form-item>
        <el-form-item label="新密码" :label-width="formLabelWidth" prop="newassword">
          <el-input v-model="ruleForm.newassword" placeholder="请输入新密码" show-password type="password" @paste.native.capture.prevent="handlePaste" />
        </el-form-item>
        <el-form-item label="确认密码" :label-width="formLabelWidth" prop="newasswordTo">
          <el-input v-model="ruleForm.newasswordTo" placeholder="请输入新密码" show-password type="password" @paste.native.capture.prevent="handlePaste" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="!isSimplePwd()" @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="newChangePassword">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="注册租户" :visible.sync="detailDialogFormVisible" width="800px" :close-on-click-modal="false">
      <el-form ref="tenantFrom" :rules="rules" :model="tenantFrom" label-position="left" label-width="80px" style="width: 73%;  margin-left: 100px;">
        <el-form-item label="租户名称" prop="tenantName" size="medium">
          <el-input v-model="tenantFrom.tenantName" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="租户描述" prop="tenantDsc" size="medium">
          <el-input v-model="tenantFrom.tenantDsc" placeholder="请输入租户描述" />
        </el-form-item>
        <el-form-item label="集群编号" prop="clusterNo" size="medium">
          <el-cascader
            v-model="tenantFrom.clusterNo"
            :options="clustersList"
            :props="{ expandTrigger: 'hover' }"
            :show-all-levels="false"
            clearable
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="登陆名" prop="loginName" size="medium">
          <el-input v-model="tenantFrom.loginName" placeholder="请输入登陆名" />
        </el-form-item>
        <el-form-item label="用户姓名" prop="userName" size="medium">
          <el-input v-model="tenantFrom.userName" placeholder="请输入用户姓名" />
        </el-form-item>
        <el-form-item label="证件类型" prop="certType" size="medium">
          <el-select v-model="tenantFrom.certType" placeholder="请选择证件类型" style="width:100%">
            <el-option
              v-for="item in certTypeOptins"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="证件号码" prop="certNo" size="medium">
          <el-input v-model="tenantFrom.certNo" placeholder="请输入证件号码" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone" size="medium">
          <el-input v-model="tenantFrom.phone" placeholder="请输入联系电话" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="medium" @click="newCreateTenant">
          确定
        </el-button>
        <el-button size="medium" @click="detailDialogFormVisible = false">
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
// import user from '@/store/modules/user'
import manImg from '@/assets/images/man.png'
import { navBarCreateTenant, getClusters, updatePassword } from '@/api/sys'
import { enc } from '@/utils'
import { validatePhoneTwo, validateIdNo } from '@/utils/validate'
import { resetRouter } from '@/router'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    const validateOldpassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入原密码'))
      } else if (value !== this.userInfo.pwd) {
        callback(new Error('原密码错误'))
      } else {
        callback()
      }
    }
    const validateNewassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入新密码'))
      } else if (value === this.userInfo.pwd) {
        callback(new Error('新密码不能跟原密码相同'))
      } else if (!/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/.test(value)) {
        callback(new Error('新密码必须包含字母和数字，且在8-16位之间'))
      } else {
        callback()
      }
    }
    const validateNewasswordTo = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请再次输入新密码'))
      } else if (value !== this.ruleForm.newassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      userInfo: JSON.parse(sessionStorage.getItem('userInfo')) || {},
      ruleForm: {
        oldpassword: '',
        newassword: '',
        newasswordTo: ''
      },
      subFrom: {
        oldpassword: '',
        newassword: ''
      },
      tenantFrom: {
        tenantName: '',
        tenantDsc: '',
        clusterNo: '',
        loginName: '',
        userName: '',
        certType: '',
        certNo: '',
        phone: ''
      },
      certTypeOptins: [
        { value: '0', label: '居民身份证' },
        { value: '1', label: '其他' }
      ],
      clustersList: [],
      formLabelWidth: '90px',
      dialogFormVisible: false,
      detailDialogFormVisible: false,
      rules: {
        oldpassword: [{ validator: validateOldpassword, required: true, trigger: 'blur' }],
        newassword: [{ validator: validateNewassword, required: true, trigger: 'blur' }],
        newasswordTo: [{ validator: validateNewasswordTo, required: true, trigger: 'blur' }],
        tenantName: [
          { required: true, message: '请输入租户名称', trigger: 'blur' }
        ],
        clusterNo: [
          { required: true, message: '请选择集群编号', trigger: 'change' }
        ],
        loginName: [
          { required: true, message: '请输入登陆名', trigger: 'blur' }
        ],
        certType: [
          { required: true, message: '请选择证件类型', trigger: 'change' }
        ],
        certNo: [
          { required: true, trigger: 'blur', validator: validateIdNo }
        ],
        phone: [
          { required: true, trigger: 'blur', validator: validatePhoneTwo }
        ]
      },
      manImg: manImg,
      isPassword: true
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name'
    ])
  },
  created() {
    if (this.isSimplePwd()) {
      setTimeout(() => {
        this.$message({
          message: '密码过于简单，请修改',
          type: 'warning'
        })
      }, 50)
      this.dialogFormVisible = true
    }
  },
  mounted() {
    const userType = sessionStorage.getItem('userType')
    if (userType === '1') {
      this.isPassword = false
    } else {
      this.isPassword = true
    }
  },
  methods: {
    isSimplePwd() {
      return this.userInfo.pwd === 'a123456'
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    // 修改密码
    changePassword() {
      this.ruleForm.oldpassword = ''
      this.ruleForm.newassword = ''
      this.ruleForm.newasswordTo = ''
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.ruleForm.resetFields()
      })
      this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    },
    // 租户注册
    resetTenant() {
      this.tenantFrom = {
        tenantName: '',
        tenantDsc: '',
        clusterNo: '',
        loginName: '',
        userName: '',
        certType: '0',
        certNo: '',
        phone: ''
      }
    },
    createTenant() {
      this.getClusters()
      this.resetTenant()
      this.detailDialogFormVisible = true
    },
    newChangePassword() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          if (this.ruleForm.newassword !== this.ruleForm.newasswordTo) {
            this.$message.error('两次输入密码不一致')
          } else {
            this.subFrom = JSON.parse(JSON.stringify(this.ruleForm))
            this.subFrom.newassword = enc(this.subFrom.newassword)
            this.subFrom.oldpassword = enc(this.subFrom.oldpassword)
            delete this.subFrom.newasswordTo
            console.log(this.subFrom)
            updatePassword(this.subFrom).then(res => {
              if (res.status === 0) {
                const userInfoJson = sessionStorage.getItem('userInfo')
                if (userInfoJson) {
                  const userInfo = JSON.parse(userInfoJson)
                  userInfo.pwd = this.ruleForm.newassword
                  sessionStorage.setItem('userInfo', JSON.stringify(userInfo))
                }
                this.$message({
                  message: '修改成功',
                  type: 'success'
                })
                this.dialogFormVisible = false
              } else {
                this.$message.error('修改失败')
              }
            })
          }
        }
      })
    },
    newCreateTenant() {
      this.tenantFrom.clusterNo = this.tenantFrom.clusterNo[1]
      this.$refs['tenantFrom'].validate((valid) => {
        if (valid) {
          navBarCreateTenant(this.tenantFrom).then(res => {
            if (res.status === 0) {
              this.$message({
                message: '租户注册成功',
                type: 'success'
              })
              this.detailDialogFormVisible = false
            } else {
              this.$message.error('租户注册成功失败')
            }
          })
        }
      })
    },
    logouts() {
      const userType = sessionStorage.getItem('userType')
      if (userType === '1') {
        this.ssologin()
      } else {
        this.logout()
      }
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    async ssologin() {
      await this.$store.dispatch('user/SSOlogout')
    },
    async getClusters() {
      const { data } = await getClusters()
      const clustersList = data.map(item => {
        const children = (item.clusters).map(i => {
          return { value: i.code, label: i.name }
        })
        return {
          value: item.id,
          label: item.name,
          children: children,
          disabled: children.length === 0
        }
      })
      this.clustersList = clustersList
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;
        display: flex;
        align-items: center;

        .user-avatar {
          cursor: pointer;
          display: inline-block;
          width: 25px;
          height: 25px;
          border-radius: 50%;
        }

        .user-name {
          font-size: 14px;
          padding-left: 5px;
        }

        .el-icon-setting {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 18px;
        }
      }
    }
  }
}
.el-divider--horizontal {
  height: 0.5px;
  margin: 0;
}
.vue-treeselect__control{
 line-height: initial;
}
</style>
