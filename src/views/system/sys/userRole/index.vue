<template>
  <div class="app-container">
    <el-card class="box-card">
      <searchForm :form-list="formList" @submitForm="handleFilter" />
    </el-card>
    <el-card class="box-card" style="margin-top:15px;">
      <div class="filter-container" style="margin-top: 15px;display: flex;justify-content: flex-end;">
        <el-button v-permission="['create']" size="small" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
          新 建
        </el-button>
      </div>
      <reuse-table
        :key="tableKey"
        v-loading="listLoading"
        :data-source="dataSource"
        :columns="columns"
        :table-option="tableOption"
        @handleButton="handleButton"
      />
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    </el-card>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" clearable :close-on-click-modal="false">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="79px" style="width: 70%; margin-left:50px;">
        <div class="createPost-main-container">
          <form-template
            v-for="item in columns"
            :key="item.id"
            v-loading="listLoading"
            :temp="item"
            :value="temp[item.param]"
            @input="handleChange"
          />
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          提交
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>

import { usersList, roleList, fetchUserRoleList, createUseRole, updaUserRole, deleteUserRole } from '@/api/sys'
import { setTreeData, setFormSelectMap, setMapValue } from '@/utils/service'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import FormTemplate from '@/components/FormTemplate'
import searchForm from '@/components/searchForm'

export default {
  name: 'UserRole',
  components: { ReuseTable, Pagination, FormTemplate, searchForm },
  data() {
    return {
      /** searchForm */
      formList: [
        { label: '用户名称', value: 'userId', type: 'select', placeholder: '',
          defaultPorps: { value: 'code', label: 'text' },
          optionList: [] },
        { label: '角色名称', value: 'roleId', type: 'select', placeholder: '',
          defaultPorps: { value: 'code', label: 'text' },
          optionList: [] }
        /*
        { label: '是否禁用', value: 'disabled', type: 'select', placeholder: '',
              defaultPorps: { value: 'code', label: 'text' },
              optionList: [{ code: '', text: '全部' }, { code: '1', text: '是' }, { code: '0', text: '否' }] }
*/
      ],
      /** searchForm */
      paramsList: {
        current: 1,
        pageSize: 10,
        r: true,
        q: '',
        sorter: '',
        order: undefined
      },
      paramsData: {
        current: 1,
        pageSize: 10
      },
      userMap: [],
      userOptionList: [],
      roleMap: [],
      roleOptionList: [],
      listLoading: true,
      total: 1,
      temp: {
        name: '',
        userId: '',
        roleId: '',
        disabled: '0',
        remark: null,
        dataPerms: null
      }, // 传输数据
      listQuery: {
        page: 1,
        limit: 10,
        sorter: '',
        order: undefined
      }, // 搜索条件
      dataSource: [],
      columns: [
        // { label: '权限名称', param: 'name', align: 'center', editor: 'text' },
        { label: '用户名称', param: 'userId', align: 'center', editor: 'select', options: [],
          render: (h, params) => {
            const userId = params.row.userId
            if (userId) {
              return h('div', this.userMap.get(userId))
            }
          }
        },
        { label: '角色名称', param: 'roleId', align: 'center', editor: 'select', options: [],
          render: (h, params) => {
            const roleId = params.row.roleId
            if (roleId) {
              return h('div', this.roleMap.get(roleId))
            }
          }
        },
        // { label: '是否禁用', param: 'disabled', align: 'center', editor: 'select',
        //   valueEnum: { '0': '否', '1': '是' },
        //   options: [
        //     { value: '0', label: '否' },
        //     { value: '1', label: '是' }
        //   ] },
        { label: '备注', param: 'remark', align: 'center', editor: 'textare', showTable: false },
        { label: '创建时间', param: 'ctime', valueType: 'dateTime', width: 200, showForm: false },
        {
          label: '时间戳',
          param: 'st',
          align: 'center',
          sortable: true,
          width: 200,
          valueType: 'dateTime',
          showForm: false
        }
      ],
      tableOption: { label: '操作', width: '200',
        options: [
          { type: 'primary', icon: 'el-icon-edit', methods: 'update' },
          { type: 'danger', icon: 'el-icon-delete', methods: 'delete' }
        ]
      },
      textMap: {
        update: '修改',
        create: '角色添加'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      rules: {
        // name: [{ required: true, message: '请输入权限名称', trigger: 'change' }],
        userId: [{ required: true, message: '请选择用户名称', trigger: 'change' }],
        roleId: [{ required: true, message: '请选择角色', trigger: 'change' }]
      },
      tableKey: 0
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleButton(data) {
      this.temp = Object.assign({}, data.row)
      if (data.methods === 'update') {
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
      } else if (data.methods === 'delete') {
        this.openMessage()
      }
    },
    handleChange(data) {
      this.temp[data.item.param] = data.value
    },
    async getList() {
      this.listLoading = true
      await usersList().then(res => {
        if (!res.data) return
        res.data.forEach(item => { item.label = item.userName, item.name = item.userName })
        const userId = this.columns.find(item => item.param === 'userId')
        if (userId) userId.options = setFormSelectMap(res.data)
        this.userMap = setMapValue(res.data)
        this.userOptionList = res.data.map(item => { return { code: item.id, text: item.userName } })
        this.userOptionList.unshift({ code: '', text: '全部' })
        this.formList[0].optionList = this.userOptionList
      })
      await roleList().then(res => {
        if (!res.data) return
        const roleId = this.columns.find(item => item.param === 'roleId')
        if (roleId) roleId.options = setFormSelectMap(res.data)
        this.roleMap = setMapValue(res.data)
        this.roleOptionList = res.data.map(item => { return { code: item.id, text: item.name } })
        this.roleOptionList.unshift({ code: '', text: '全部' })
        this.formList[1].optionList = this.roleOptionList
      })
      await fetchUserRoleList(this.paramsList).then(res => {
        this.dataSource = res.data
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },

    handleFilter(dialogForm) {
      Object.assign(this.paramsList, dialogForm)
      this.listQuery.page = 1
      this.getList()
    },

    resetTemp() {
      this.temp = {
        name: '',
        userId: '',
        roleId: '',
        disabled: '0',
        remark: null,
        dataPerms: null
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
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createUseRole(this.temp).then(res => {
            this.temp.id = res.id
            this.temp.ctime = new Date()
            this.dataSource.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '新建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // eslint-disable-next-line no-unused-vars
          const tempData = Object.assign({}, this.temp)
          updaUserRole(tempData.id, tempData).then(() => {
            this.dialogFormVisible = false
            const index = this.dataSource.findIndex(item => item.id === this.temp.id)
            this.dataSource.splice(index, 1, this.temp)
            this.$notify({
              title: '成功',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
          })
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
          deleteUserRole(this.temp.id).then(() => {
            const index = this.dataSource.findIndex(item => item.id === this.temp.id)
            this.dataSource.splice(index, 1)
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
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
    }
  }
}
</script>
<style scoped>
.w-table[data-v-443de9ed] {
    background-color: white;
}
</style>
