<template>
  <div class="app-container">
    <el-card class="box-card">
      <searchForm :form-list="formList" :disabled-if="disabled" :validata-list="validataList" @submitForm="handleFilter" />
    </el-card>
    <el-card class="box-card" style="margin-top:15px;">
      <div class="filter-container" style="margin-top: 15px;display: flex;justify-content: flex-end;">
        <!--
      <el-input v-model="paramsList.q" placeholder="" style="width: 300px;" class="input-with-select" @change="changeIn" @keyup.enter.native="handleFilter">
        <el-button slot="append" icon="el-icon-search" @click="handleFilter" />
      </el-input>
-->
        <el-button v-if="paramsList.hasPerm && level != '2' && level != '3'" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
          新建
        </el-button>
      </div>
      <reuse-table
        v-loading="listLoading"
        :data-source="dataSource"
        :columns="columns"
        :list-query-page="paramsList.current"
        :list-query-limit="paramsList.pageSize"
        :table-option="tableOption"
        @handleButton="handleButton"
      >
        <template slot="passwdReset" slot-scope="props">
          <el-divider direction="vertical" />
          <el-button type="text" size="mini" style="margin: 0 5px;" @click="openPasswdResetMessage(props.passwdReset)">密码重置</el-button>
        </template>
      </reuse-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="paramsList.current"
        :limit.sync="paramsList.pageSize"
        @pagination="getList"
      />
    </el-card>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="60%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-width="100px">
        <el-row :gutter="20">
          <!--
          <el-col :span="12">
            <el-form-item label="用户编号" prop="userId">
              <el-input v-model="temp.userId" type="text" placeholder="请输入" />
            </el-form-item>
          </el-col>
-->
          <el-col :span="12">
            <el-form-item label="用户姓名" prop="userName">
              <el-input v-model="temp.userName" type="text" placeholder="请输入" :disabled="userTypeDisable" maxlength="32" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="登录名称" prop="loginName">
              <el-input v-model="temp.loginName" type="text" placeholder="请输入" :disabled="adminDisable || temp.loginName == 'admin'|| userTypeDisable" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="证件类型" prop="certtype">
              <el-select v-model="temp.certtype" placeholder="请选择" :disabled="userTypeDisable" @change="changeCerttype">
                <el-option v-for="(item,index) in certtypeOptions" :key="index" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件号码" prop="certno">
              <el-input v-model="temp.certno" placeholder="请输入" :disabled="userTypeDisable" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="员工编号" prop="empid">
              <el-input v-model="temp.empid" placeholder="请输入" :disabled="userTypeDisable" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="temp.phone" placeholder="请输入" :disabled="userTypeDisable" />
            </el-form-item>
          </el-col>
          <!--
            <el-col :span="12">
                <el-form-item label="个人邮箱" prop="email">
                    <el-input v-model="temp.email" placeholder="请输入" />
                </el-form-item>
            </el-col>
-->
        </el-row>
        <el-row :gutter="20">
          <!--
              <el-col :span="12">
                  <el-form-item label="昵称" prop="nickName">
                      <el-input v-model="temp.nickName" type="text" placeholder="请输入" />
                  </el-form-item>
              </el-col>
-->
          <el-col :span="12">
            <el-form-item label="数据级别" prop="disabled">
              <el-select v-model="temp.dataLevel" placeholder="请选择" @change="onDataLevelChange">
                <el-option v-for="(item,index) in dataLevelOptions" :key="index" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据权限" prop="dataPerms" size="medium">
              <el-cascader
                v-model="temp.dataPerms"
                :options="dataPermsOptions"
                :props="{ expandTrigger: 'hover', multiple: true, checkStrictly: true, label:'name', value:'id' }"
                :show-all-levels="true"
                :disabled="dataPermsDisable "
                clearable
                filterable
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否禁用" prop="disabled">
              <el-select v-model="temp.disabled" placeholder="请选择" :disabled="adminDisable || userTypeDisable">
                <el-option v-for="(item,index) in disabledOptions" :key="index" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户类型" prop="userType">
              <el-select v-model="temp.userType" placeholder="请选择" disabled>
                <el-option v-for="(item,index) in userTypeOptions" :key="index" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!--
          <el-col :span="12">
            <el-form-item label="归属租户" prop="tenantId">
              <el-select v-model="temp.tenantId" filterable placeholder="请选择" :disabled="tenantIdDisable">
                <el-option v-for="item in tenantIdOptions" :key="item.key" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="数据权限" prop="dataPerms">
              <el-select v-model="temp.dataPerms" filterable placeholder="请选择" :disabled="tenantIdDisable" multiple collapse-tags>
                <el-option v-for="item in tenantIdOptions" :key="item.key" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
-->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="temp.remark" type="textarea" :autosize="{minRows: 4, maxRows: 6}" maxlength="200" show-word-limit :disabled="userTypeDisable" />
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" :disabled="addDisabled" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="'绑定角色'" :visible.sync="roleFormVisible" clearable :close-on-click-modal="false">
      <el-form
        ref="roleForm"
        :rules="roleFormRules"
        :model="roleForm"
        label-position="right"
        label-width="120px"
        style="width: 70%; margin-left:100px;"
      >
        <el-form-item label="用户姓名" prop="name">
          <el-input v-model="roleForm.name" type="text" disabled />
        </el-form-item>
        <el-form-item label="用户角色" prop="roleIds">
          <el-select v-model="roleForm.roleIds" multiple filterable placeholder="请选择" :disabled="isroleIds">
            <el-option
              v-for="(item,index) in roleOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
              :disabled="isroleLevel(item.roleLevel)"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="roleFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" :disabled="submDisabled" @click="submitData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchUsersList, createUser, updateUser, deleteUser, roleList, fetchDataPerms, getRoleIdsByUserid, bindRole, resetPasswordById } from '@/api/sys'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import searchForm from '@/components/searchForm'

export default {
  name: 'User',
  components: { ReuseTable, Pagination, searchForm },
  data() {
    return {
      addDisabled: false,
      submDisabled: false,
      /** searchForm */
      isroleIds: false,
      disabled: false,
      formList: [
        { label: '用户姓名', value: 'userName', type: 'string', clearable: true, placeholder: '' },
        { label: '登录名称', value: 'loginName', type: 'string', clearable: true, placeholder: '' },
        { label: '用户类型', value: 'userType', type: 'select', placeholder: '',
          defaultPorps: { value: 'code', label: 'text' },
          optionList: [{ code: '', text: '全部' }, { code: '0', text: '本地用户' }, { code: '1', text: 'UASS用户' }]
        }
      ],
      validataList: {
        // loginName: [{ required: false, message: '请输入数字或字母', trigger: 'blur', pattern: /^[A-Za-z0-9]*$/ }]
      },
      /** searchForm */
      list: null,
      listLoading: true,
      total: 1,
      adminDisable: false,
      tenantIdDisable: false,
      dataPermsDisable: false,
      temp: {
        userName: '',
        loginName: '',
        nickName: '',
        certtype: '0',
        certno: '',
        email: '',
        phone: '',
        empid: '',
        disabled: '0',
        remark: '',
        tenantId: '',
        dataLevel: '1',
        dataPerms: '',
        userType: '0'
      }, // 传输数据
      listQuery: {
        page: 1,
        limit: 10,
        sorter: '',
        order: undefined
      }, // 搜索条件
      dialog: {}, // 弹出框
      dataSource: [],
      columns: [
        // { label: '用户编号', param: 'userId', width: 100 },
        { label: '用户姓名', param: 'userName' },
        { label: '登录名称', param: 'loginName' },
        // { label: '昵称', param: 'nickName', width: 140 },
        {
          label: '证件类型', param: 'certtype', valueEnum: { 0: '居民身份证', 1: '其他' }, editor: 'select',
          options: [
            { key: '0', value: '居民身份证' }
            // { key: '1', value: '其他' }
          ],
          showTable: false
        },
        { label: '证件号码', param: 'certno', showTable: false },
        // { label: '邮箱', param: 'email', width: 200 },
        { label: '联系电话', param: 'phone' },
        { label: '员工编号', param: 'empid' },
        {
          label: '权限级别', param: 'dataLevel', align: 'center',
          valueEnum: { 0: '全行数据', 1: '指定权限' }, editor: 'select',
          options: [
            { key: 0, value: '全行数据' },
            { key: 1, value: '指定权限' }
          ]
        },
        {
          label: '是否禁用', param: 'disabled', align: 'center',
          valueEnum: { 0: '否', 1: '是' }, editor: 'select',
          options: [
            { key: 0, value: '否' },
            { key: 1, value: '是' }
          ]
        },
        {
          label: '用户类型', param: 'userType', align: 'center',
          valueEnum: { 0: '本地用户', 1: 'UASS用户' }, editor: 'select'
        },
        { label: '登记人', param: 'register', align: 'center', editor: 'text', showForm: false },
        { label: '创建时间', param: 'ctime', valueType: 'dateTime', showForm: false },
        { label: '更新时间', param: 'st', align: 'center', sortable: true, valueType: 'dateTime', showForm: false }
      ],
      tableOption: {},
      textMap: {
        update: '编辑',
        create: '新建'
      },
      dialogFormVisible: false,
      dataForm: {},
      dialogStatus: '', // 创建or更新
      rules: {
        userName: [{ required: true, message: '请输入用户姓名！', trigger: 'blur' }],
        loginName: [{ required: true, message: '请输入正确的名称(4到16位数字或字母)', trigger: 'blur', pattern: /^[-_a-zA-Z0-9]{4,16}$/ }],
        // email: [{ required: false, message: '请输入正确邮箱地址！', trigger: 'blur', pattern: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/ }],
        certno: [{ required: false, message: '请输入正确证件号码！', trigger: 'blur', pattern: /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/ }],
        phone: [{ required: true, message: '请输入正确电话号码！', trigger: 'blur', pattern: /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/ }]
      },
      dataLevelOptions: [
        { value: '0', label: '全行数据' },
        { value: '1', label: '指定权限' }
      ],
      disabledOptions: [
        { value: 0, label: '否' },
        { value: 1, label: '是' }
      ],
      certtypeOptions: [
        { value: '0', label: '居民身份证' },
        { value: '1', label: '其他' }
      ],
      userTypeOptions: [
        { value: '0', label: '本地用户' },
        { value: '1', label: 'UASS用户' }
      ],
      dataPermsOptions: [],
      tenantIdOptions: [],
      tenantIdMap: [],
      paramsList: {
        current: 1,
        pageSize: 10,
        r: true,
        q: '',
        sorter: 'ctime',
        order: undefined,
        hasPerm: true,
        userName: '',
        loginName: ''
      },
      roleFormVisible: false,
      roleForm: {
        userId: '',
        name: '',
        roleIds: []
      },
      roleFormRules: {
        role: [{ required: true, message: '请选择！', trigger: 'change' }],
        roleIds: [{ required: true, message: '请绑定用户角色！', trigger: ['blur', 'change'] }]
      },
      roleColumns: [
        { label: '用户姓名', param: 'name', width: 140, disabled: true, editor: 'text' },
        {
          label: '证件类型', param: 'role', width: 100, valueEnum: { 0: '居民身份证'/*, 1: '其他'*/ }, editor: 'select',
          options: [
            { key: '0', value: '居民身份证' },
            { key: '1', value: '其他' }
          ]
        }
      ],
      passwordFormRules: {
        password: [{ required: true, message: '请输入密码！', trigger: 'blur' }],
        password2: [{ required: true, message: '请输入确认密码！', trigger: 'blur' }]
      },
      roleOptions: [],
      level: sessionStorage.getItem('level'),
      userTypeDisable: false
    }
  },
  watch: {},
  created() {
    if (this.level !== '0' && this.level !== '1') {
      this.tableOption = {
        label: '操作', width: '240', fixed: 'right',
        options: [
          { type: 'text', label: '编辑', methods: 'update' },
          { type: 'text', label: '删除', methods: 'delete' }
        ]
      }
    } else {
      this.tableOption = {
        label: '操作', width: '240', fixed: 'right',
        options: [
          { type: 'text', label: '绑定角色', methods: 'bindRole' },
          { type: 'text', label: '编辑', methods: 'update' },
          { type: 'text', label: '删除', methods: 'delete' }
        ]
      }
    }

    this.getList()
    this.getRoleList()
  },
  methods: {
    handleFilter(dialogForm) {
      this.listLoading = true
      Object.assign(this.paramsList, dialogForm)
      this.paramsList.current = 1
      this.fetchUsersList()
    },
    fetchUsersList() {
      fetchUsersList(this.paramsList).then(res => {
        this.listLoading = false
        this.total = res.total
        this.dataSource = res.data
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleButton(data) {
      if (data.row.userType === '1') {
        this.userTypeDisable = true
      } else {
        this.userTypeDisable = false
      }
      this.temp = Object.assign({}, data.row)
      if (this.temp.dataPerms === null) this.temp.dataPerms = []
      if (this.temp.dataLevel === null) {
        this.temp.dataLevel = '0'
        this.dataPermsDisable = true
      }
      if (data.methods === 'update') {
        // if (data.row.loginName === 'admin') {
        //   this.$alert('系统管理员信息不能修改!', '提示', { confirmButtonText: '确定', type: 'warning' })
        //   return
        // }
        this.dialogStatus = 'update'
        this.roleFormVisible = false
        this.dialogFormVisible = true
        if (this.temp.dataPerms.length) {
          this.temp.dataPerms = JSON.parse(this.temp.dataPerms)
        }
        // if (user.state.level === 2 || user.state.level === 3) {
        //   // this.temp.tenantId = user.state.tenantId
        //   // this.temp.dataPerms = [user.state.tenantId]
        //   this.tenantIdDisable = true
        // }
        // else {
        //   this.temp.dataPerms = [data.row.dataPerms]
        // }
        // this.temp.tenantId = user.state.tenantId
        // this.temp.dataPerms = user.state.tenantId
        if (this.$refs['dataForm'] != null) {
          this.$refs['dataForm'].resetFields()
        }
        if (data.row.loginName === 'admin') {
          this.adminDisable = true
        } else {
          this.adminDisable = false
        }
        if (this.temp.dataLevel == 0) {
          this.dataPermsDisable = true
          this.temp.dataPerms = []
        } else {
          this.dataPermsDisable = false
        }
      } else if (data.methods === 'bindRole') {
        // if (loginName === data.loginName) {
        //   this.$message.error('不能修改自己的绑定角色！')
        // } else {
        this.roleForm = {
          id: data.row.id,
          name: data.row.userName,
          roleIds: []
        }
        this.getRoleIds(data.row.id)
        // }
      } else if (data.methods === 'delete') {
        this.openMessage()
      }
    },
    onDataLevelChange() {
      if (this.temp.dataLevel == 0) {
        this.dataPermsDisable = true
        this.temp.dataPerms = []
      } else {
        this.dataPermsDisable = false
      }
    },
    async getList() {
      this.dataPermsOptions = []
      this.listLoading = true
      // 数据权限
      // fetchDataPerms().then(res => {
      //   const data = res.data
      //   for (const envdata of data) { // []
      //     for (const key in envdata) {
      //       const d = envdata[key]
      //       const envMap = {}
      //       envMap.id = key
      //       envMap.name = key
      //       const children = []
      //       for (const item of d) {
      //         const tenantMap = {} // 生成Map对象 用于列表上级租户的渲染
      //         tenantMap.id = item.id
      //         tenantMap.name = item.name
      //         children.push(tenantMap)
      //       }
      //       envMap.children = children
      //       this.dataPermsOptions.push(envMap)
      //     }
      //   }
      //   this.listLoading = false
      // }).catch(err => {
      //   console.log(err)
      //   this.listLoading = false
      // })
      // 用户信息
      this.paramsList.q = ''
      await fetchUsersList(this.paramsList).then(res => {
        this.total = res.total
        this.dataSource = res.data
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      }).catch(err => {
        console.log(err)
        this.listLoading = false
      })
    },
    async getRoleList() {
      var level = sessionStorage.getItem('level')
      await roleList().then(res => {
        const { data } = res
        const roleList = []
        data.map(item => {
          if (level === '1') {
            if (item.roleLevel !== 1) {
              roleList.push({
                value: item.id,
                label: item.name,
                roleLevel: item.roleLevel
              })
            }
          } else {
            roleList.push({
              value: item.id,
              label: item.name,
              roleLevel: item.roleLevel
            })
          }
        })
        this.roleOptions = roleList
      })
    },
    async getRoleIds(userId) {
      this.listLoading = true
      await getRoleIdsByUserid(userId).then(res => {
        if (res.data) {
          this.roleForm.roleIds = res.data
          var isroleIdsArr = []
          if (this.roleForm.roleIds.length) {
            this.roleForm.roleIds.map(item => {
              this.roleOptions.map(items => {
                if (items.value === item) {
                  isroleIdsArr.push(items.roleLevel)
                  return
                }
              })
            })
          }
          if (isroleIdsArr.indexOf(0) > -1) {
            this.isroleIds = true
          } else {
            this.isroleIds = false
          }
          this.listLoading = false
          this.dialogFormVisible = false
          this.roleFormVisible = true
          this.$nextTick(() => {
            this.$refs['roleForm'].clearValidate()
          })
        }
      }).catch(err => {
        console.log(err)
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = {
        name: '',
        loginName: '',
        nickName: '',
        certtype: '0',
        certno: '',
        email: '',
        phone: '',
        empid: '',
        disabled: 0,
        remark: '',
        agentId: null,
        dataLevel: '1',
        dataPerms: [],
        userType: '0'
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.addDisabled = true
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          if (tempData.dataPerms != null && tempData.dataPerms.length > 0) {
            tempData.dataPerms = JSON.stringify(this.temp.dataPerms)
          } else {
            tempData.dataPerms = '[]'
          }
          createUser(tempData).then(res => {
            this.addDisabled = false
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: 'Success',
              message: '新建成功',
              type: 'success',
              duration: 2000
            })
            this.fetchUsersList()
          })
        } else {
          this.addDisabled = false
        }
      })
    },
    updateData() {
      this.addDisabled = true
      this.changeCerttype()
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // eslint-disable-next-line no-unused-vars
          const tempData = Object.assign({}, this.temp)
          if (tempData.dataPerms != null) {
            tempData.dataPerms = JSON.stringify(this.temp.dataPerms)
          } else {
            tempData.dataPerms = '[]'
          }
          updateUser(tempData.id, tempData).then(() => {
            this.addDisabled = false
            this.dialogFormVisible = false
            const index = this.dataSource.findIndex((item, index) => item.id === this.temp.id)
            this.dataSource.splice(index, 1, this.temp)
            this.$notify({
              title: 'Success',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
            this.fetchUsersList()
          })
        } else {
          this.addDisabled = false
        }
      })
    },
    openMessage() {
      this.$confirm('此操作将永久删除该条信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(action => {
        if (action === 'confirm') {
          deleteUser(this.temp.id).then(() => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.fetchUsersList()
          })
        }
      }).catch(err => {
        if (err === 'cancel') {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        }
      })
    },
    openPasswdResetMessage(data) {
      this.temp = Object.assign({}, data)
      if (this.temp.userType === '1') {
        this.$alert('UASS用户禁止重置密码!', '提示', { confirmButtonText: '确定', type: 'warning' })
      } else {
        this.$confirm('您确认重置吗?(' + this.temp.loginName + '-' + this.temp.userName + ')', '重置密码', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            resetPasswordById(this.temp.id).then(() => {
              this.$message({
                type: 'success',
                message: '重置成功!'
              })
            })
          }
        }).catch(err => {
          if (err === 'cancel') {
            this.$message({
              type: 'info',
              message: '已取消重置'
            })
          }
        })
      }
    },
    handleChange(data) {
      this.temp[data.item.param] = data.value
    },
    submitData() {
      this.submDisabled = true
      this.$refs['roleForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.roleForm)
          bindRole(tempData.id, tempData.roleIds).then(res => {
            this.submDisabled = false
            this.roleFormVisible = false
            this.$notify({
              title: 'Success',
              message: '绑定成功',
              type: 'success',
              duration: 2000
            })
          })
        } else {
          this.submDisabled = false
        }
      })
    },
    changeCerttype() {
      if (this.temp.certtype === '1') {
        this.rules.certno[0].pattern = ''
      } else {
        this.rules.certno[0].pattern = /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
      }
    },
    isroleLevel(roleLevel) {
      if (roleLevel === 0) {
        return true
      } else {
        // eslint-disable-next-line no-self-assign
        return false
      }
    }

    // passwdResetSubmit() {
    //   this.$refs['passwdResetForm'].validate((valid) => {
    //     if (valid) {
    //       const tempData = Object.assign({}, this.temp2)
    //       console.log(tempData)
    //       resetPasswordById(tempData.id, this.temp2).then(res => {
    //         this.passwdResetFormVisible = false
    //         this.$notify({
    //           title: 'Success',
    //           message: '重置成功',
    //           type: 'success',
    //           duration: 2000
    //         })
    //       })
    //     }
    //   })
    // }
  }
}
</script>

<style lang="scss" scoped>
    .el-select {
        width: 100%;
    }

    ::v-deep .el-form-item__label {
        font-weight: normal;
    }

    ::v-deep .el-divider--vertical {
        margin: 0;
    }
</style>
