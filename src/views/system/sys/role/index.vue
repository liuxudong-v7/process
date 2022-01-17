<template>
  <div>
    <div v-if="sysRolesIf == '0'" class="app-container">
      <el-card class="box-card">
        <searchForm :form-list="formList" :disabled-if="disabled" @submitForm="handleFilter" />
      </el-card>
      <el-card class="box-card" style="margin-top:15px;">
        <div class="filter-container" style="margin-top: 15px;display: flex;justify-content: flex-end;">
          <!--
                  <el-input v-model="paramsList.q" placeholder="" style="width: 300px;" class="input-with-select" @change="changeIn" @keyup.enter.native="handleFilter">
                    <el-button slot="append" icon="el-icon-search" @click="handleFilter" />
                  </el-input>
          -->
          <el-button
            v-if="createIf"
            v-permission="['create']"
            class="filter-item"
            type="primary"
            icon="el-icon-plus"
            @click="handleCreate"
          >
            新建
          </el-button>
        </div>
        <reuse-table
          v-if="createIf == true"
          v-loading="listLoading"
          :data-source="dataSource"
          :list-query-page="paramsList.current"
          :list-query-limit="paramsList.pageSize"
          :columns="columns"
          :table-option="tableOption"
          @handleButton="handleButton"
        />
        <reuse-table
          v-if="createIf == false"
          v-loading="listLoading"
          :data-source="dataSource"
          :list-query-page="paramsList.current"
          :list-query-limit="paramsList.pageSize"
          :columns="columns"
          @handleButton="handleButton"
        />
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="paramsList.current"
          :limit.sync="paramsList.pageSize"
          @pagination="getList"
        />
      </el-card>

      <el-dialog
        width="50%"
        :title="textMap[dialogStatus]"
        :visible.sync="dialogFormVisible"
        :close-on-click-modal="false"
      >
        <el-form
          ref="dataForm"
          v-enterToNext="true"
          :rules="rules"
          :model="temp"
          label-position="left"
          label-width="120px"
          style="width: 80%; margin-left:50px;"
        >
          <!--
          <el-form-item label="角色编号" prop="roleNo">
            <el-input v-model="temp.roleNo" type="text" placeholder="请输入角色标识" />
          </el-form-item>
-->
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="temp.name" type="text" placeholder="请输入角色名称" maxlength="32" />
          </el-form-item>
          <el-form-item label="权限级别" prop="roleLevel">
            <el-select v-model="temp.roleLevel" filterable placeholder="请选择" :disabled="rootAdminDisable">
              <el-option v-for="item in roleLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <!--
          <el-form-item v-if="temp.type == 0" label="数据权限级别" prop="dataLevel">
            <el-select v-model="temp.dataLevel" filterable placeholder="请选择" :disabled="rootAdminDisable">
              <el-option v-for="(item,index) in dataLevelOptions" :key="index" :label="item" :value="index" />
            </el-select>
          </el-form-item>
-->
          <el-form-item label="是否禁用" prop="disabled">
            <el-select v-model="temp.disabled" filterable placeholder="请选择" :disabled="rootAdminDisable">
              <el-option v-for="item in disabledOptions" :key="item.index" :label="item.value" :value="item.index" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注信息" prop="remark">
            <el-input v-model="temp.remark" type="textarea" maxlength="200" show-word-limit :autosize="{minRows: 4, maxRows: 6}" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            取消
          </el-button>
          <el-button type="primary" :disabled="createDisabled" @click="dialogStatus==='create'?createData():updateData()">
            确定
          </el-button>
        </div>

      </el-dialog>
    </div>
    <div>
      <sysRoles v-if="sysRolesIf == '1'" ref="sysRoles" @fatherMethod="fatherMethod" />
    </div>
  </div>
</template>

<script>
import { fetchRoleList, createRole, updateRole, deleteRole } from '@/api/sys'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import sysRoles from './editPerms'
import searchForm from '@/components/searchForm'

export default {
  components: { ReuseTable, Pagination, sysRoles, searchForm },
  data() {
    return {
      /** searchForm */
      createDisabled: false,
      disabled: false,
      formList: [
        { label: '角色名称', value: 'name', type: 'string', clearable: true, placeholder: '' },
        {
          label: '权限级别', value: 'roleLevel', type: 'select', placeholder: '',
          defaultPorps: { value: 'code', label: 'text' },
          optionList: []
        },
        {
          label: '是否禁用', value: 'disabled', type: 'select', placeholder: '',
          defaultPorps: { value: 'code', label: 'text' },
          optionList: [{ code: '', text: '全部' }, { code: '0', text: '否' }, { code: '1', text: '是' }]
        }
      ],
      /** searchForm */
      rsrcList: sessionStorage.getItem('rsrcList'),
      createIf: true,
      list: null,
      listLoading: true,
      clearable: true,
      total: 1,
      sysRolesIf: '0',
      rootAdminDisable: false,
      temp: {
        type: '',
        'roleNo': '',
        'name': '',
        'roleLevel': null,
        'dataLevel': null,
        'disabled': null,
        'remark': null
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
        // { label: '角色编号', param: 'roleNo', width: 200, align: 'left' },
        { label: '角色名称', param: 'name', align: 'left' },
        {
          label: '权限级别',
          param: 'roleLevel',
          align: 'center',

          valueEnum: { 0: '超级管理员', 1: '系统管理员', 2: '行内领导', 3: '普通用户' }
        },
        { label: '是否禁用', param: 'disabled', align: 'center', valueEnum: { 0: '否', 1: '是' }},
        { label: '创建时间', param: 'ctime', align: 'center', valueType: 'dateTime', showForm: false },
        {
          label: '更新时间',
          param: 'st',
          align: 'center',
          sortable: true,

          valueType: 'dateTime',
          showForm: false
        }
      ],
      tableOption: {
        label: '操作',
        fiexd: 'right',
        width: '240',
        options: [
          { type: 'text', label: '编辑权限', methods: 'editPerms' },
          { type: 'text', label: '编辑', methods: 'update' },
          { type: 'text', label: '删除', methods: 'delete' }
        ]
      },
      textMap: {
        update: '编辑',
        create: '新建'
      },
      dialogFormVisible: false,
      dataForm: {},
      dialogStatus: '', // 创建or更新
      rules: {
        roleNo: [{ required: true, message: '请输入角色标识！', trigger: 'blur' }],
        name: [{ required: true, message: '请输入角色名称！', trigger: 'blur' }]
      },
      level: sessionStorage.getItem('level'),
      roleLevelOptions: [],
      dataLevelOptions: ['全行数据', '指定权限'],
      disabledOptions: [{ index: '0', value: '否' }, { index: '1', value: '是' }],
      paramsList: {
        current: 1,
        pageSize: 10,
        r: true,
        q: '',
        sorter: 'ctime',
        order: undefined,
        disabled: '',
        roleLevel: '',
        name: ''
      }
    }
  },
  created() {
    var user = JSON.parse(this.rsrcList)
    for (var i = 0; i < user.length; i++) {
      if (user[i] === 'create') {
        this.createIf = false
      }
    }
    if (this.level === '0') {
      this.formList[1].optionList = [
        { code: '', text: '全部' },
        { code: '0', text: '超级管理员' },
        { code: '1', text: '系统管理员' },
        { code: '2', text: '行内领导' },
        { code: '3', text: '普通员工' }
      ]
      this.roleLevelOptions = [
        {
          value: 0,
          label: '超级管理员'
        },
        {
          value: 1,
          label: '系统管理员'
        },
        {
          value: 2,
          label: '行内领导'
        },
        {
          value: 3,
          label: '普通用户'
        }]
    } else if (this.level === '1') {
      this.formList[1].optionList = [
        { code: '', text: '全部' },
        { code: '1', text: '系统管理员' },
        { code: '2', text: '行内领导' },
        { code: '3', text: '普通员工' }
      ]
      this.roleLevelOptions = [
        {
          value: 1,
          label: '系统管理员'
        },
        {
          value: 2,
          label: '行内领导'
        },
        {
          value: 3,
          label: '普通用户'
        }]
    } else {
      this.createIf = false
      this.roleLevelOptions = []
    }
    this.fatherMethod()
  },
  methods: {
    fatherMethod() {
      this.sysRolesIf = '0'
      this.getList()
    },
    handleFilter(dialogForm) {
      this.paramsList.name = dialogForm.name
      this.paramsList.roleLevel = dialogForm.roleLevel
      this.paramsList.disabled = dialogForm.disabled
      this.paramsList.current = 1
      this.fetchRoleList()
    },
    fetchRoleList() {
      this.listLoading = true
      fetchRoleList(this.paramsList).then(res => {
        this.total = res.total
        this.dataSource = res.data
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleButton(data) {
      this.temp = Object.assign({}, data.row)
      console.log(data)
      if (data.row.roleLevel == 0) {
        this.$alert('权限级别为超级管理员不能进行此操作!', '提示', { confirmButtonText: '确定', type: 'warning' })
        return
      }
      if (data.methods === 'editPerms') {
        if (data.row.roleNo === 'adminRole') {
          this.$alert('系统管理员权限不能编辑!', '提示', { confirmButtonText: '确定', type: 'warning' })
          return
        }
        this.sysRolesIf = '1'
        setTimeout(() => {
          this.$refs.sysRoles.getList(this.temp.roleLevel, this.temp.id)
        }, 3)

        // this.$router.push({ path: '/sysRoles', query: { Id: this.temp.id }})
      } else if (data.methods === 'update') {
        if (data.row.roleNo === 'adminRole') {
          this.$alert('系统管理员角色不能编辑!', '提示', { confirmButtonText: '确定', type: 'warning' })
          return
        }
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        if (this.$refs['dataForm'] != null) {
          this.$refs['dataForm'].resetFields()
        }
        if (data.row.roleNo == 'roleAdmin') {
          this.rootAdminDisable = true
        } else {
          this.rootAdminDisable = false
        }
      } else {
        if (data.row.roleNo === 'adminRole') {
          this.$alert('系统管理员权限不能删除!', '提示', { confirmButtonText: '确定', type: 'warning' })
          return
        }
        this.openMessage()
      }
    },
    async getList() {
      this.listLoading = true
      this.paramsList.q = ''
      await fetchRoleList(this.paramsList).then(res => {
        this.total = res.total
        this.dataSource = res.data
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      }).catch(() => {
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = {
        'roleNo': '',
        'name': '',
        type: 0,
        'roleLevel': 3,
        'dataLevel': 0,
        'disabled': '0',
        'remark': null
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
      this.createDisabled = true
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          createRole(tempData).then(res => {
            this.createDisabled = false
            this.dialogFormVisible = false
            this.temp.id = res.id
            this.dataSource.unshift(this.temp)
            this.$notify({
              title: 'Success',
              message: '新建成功',
              type: 'success',
              duration: 2000
            })
            this.fetchRoleList()
          }).catch(() => {
            this.createDisabled = false
          })
        } else {
          this.createDisabled = false
        }
      })
    },
    updateData() {
      this.createDisabled = true
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateRole(tempData.id, tempData).then(() => {
            this.createDisabled = false
            this.dialogFormVisible = false
            this.dataSource.map((item, index) => {
              if (item.id === this.temp.id) {
                this.dataSource.splice(index, 1, this.temp)
              }
            })
            this.$notify({
              title: 'Success',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
            this.fetchRoleList()
          }).catch(() => {
            this.createDisabled = false
          })
        } else {
          this.createDisabled = false
        }
      })
    },
    openMessage() {
      this.listLoading = true
      this.$confirm('此操作将永久删除该条信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(action => {
        if (action === 'confirm') {
          deleteRole(this.temp.id).then(() => {
            this.listLoading = false
            this.dataSource.map((item, index) => {
              if (item.id === this.temp.id) {
                this.dataSource.splice(index, 1)
                this.total -= 1
              }
            })
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.fetchRoleList()
          }).catch(() => {
            this.listLoading = false
          })
        }
      }).catch(err => {
        this.listLoading = false
        if (err === 'cancel') {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        }
      })
    }
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
