<template>
  <div class="app-container">
    <div class="filter-container" style="margin-top: 15px;display: flex;justify-content: flex-end;">
      <el-input v-model="listQuery.title" placeholder="" style="width: 300px;" class="input-with-select" @keyup.enter.native="handleFilter">
        <el-button slot="append" icon="el-icon-search" @click="handleFilter" />
      </el-input>
      <el-button v-permission="['create']" size="small" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        新 建
      </el-button>
    </div>
    <reuse-table
      v-loading="listLoading"
      :data-source="dataSource"
      :columns="columns"
      :table-option="tableOption"
      @handleButton="handleButton"
    />
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 70%; margin-left:50px;">
        <div class="createPost-main-container">
          <form-template
            v-for="item in columns"
            :key="item.param"
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
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createTenant, updateTenant, deleteTenant, fetchTenantList } from '@/api/sys'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import FormTemplate from '@/components/FormTemplate'
import { setTreeData } from '@/utils/service'

export default {
  components: { ReuseTable, Pagination, FormTemplate },
  data() {
    return {
      list: null,
      listLoading: true,
      total: 1,
      temp: {
        name: '',
        address: '',
        contact: '',
        phone: '',
        ip: '',
        disabled: '0',
        parentId: null,
        notes: ''
      }, // 传输数据
      listQuery: {
        page: 1,
        limit: 20,
        sorter: '',
        order: undefined
      }, // 搜索条件
      dialog: {}, // 弹出框
      dataSource: [],
      columns: [
        { label: '租户名称', param: 'name', align: 'left', sortable: true, editor: 'text', width: 100 },
        { label: '联系人名', param: 'contact', align: 'left', editor: 'text' },
        { label: '联系电话', param: 'phone', align: 'left', editor: 'text' },
        { label: '底座地址', param: 'ip', align: 'left', width: 200, editor: 'text' },
        { label: '是否禁用', param: 'disabled', align: 'left', valueEnum: { 0: '否', 1: '是' }, editor: 'select',
          options: [
            { key: '0', value: '否' },
            { key: '1', value: '是' }
          ] },
        { label: '类型', param: 'type', align: 'left', valueEnum: { 0: '管理系统机构', 1: '租户' }, editor: 'select',
          options: [
            { key: '0', value: '管理系统机构' },
            { key: '1', value: '租户' }
          ] },
        { label: '物理子系统id', param: 'envid', align: 'left', width: 300, editor: 'text' },
        { label: '租户地址', param: 'address', align: 'left', width: 300, editor: 'text' },
        {
          label: '上级租户',
          param: 'parentId',
          align: 'left',
          editor: 'treeSelect',
          options: [],
          render: (h, params) => {
            const parentId = params.row.parentId
            if (parentId) {
              return h(
                'el-tag',
                {
                  attrs: {
                    size: 'mini'
                  }
                },
                this.tenantMap.get(parentId)
              )
            }
          }
        },
        { label: ' 备注', param: 'notes', align: 'left', editor: 'textare' },
        { label: '修改时间', param: 'st', align: 'left', sortable: true, width: 200, valueType: 'date', showForm: false }
      ],
      tableOption: {
        label: '操作',
        width: '200',
        fixed: 'right',
        options: [
          { type: 'primary', icon: 'el-icon-edit', methods: 'update' },
          { type: 'danger', icon: 'el-icon-delete', methods: 'delete' }
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
        name: [{ required: true, message: '请输入名称！', trigger: 'blur' }],
        envid: [{ required: true, message: '请绑定物理子系统id！', trigger: 'blur' }],
        contact: [{ required: true, message: '请输入联系人名！', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入联系电话！', trigger: 'blur' }]
      },
      tenantMap: [],
      paramsList: {
        current: 1,
        pageSize: 20,
        r: true,
        q: '',
        sorter: '',
        order: undefined,
        mode: 0
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleButton(data) {
      this.temp = Object.assign({}, data.row)
      if (data.methods === 'update') {
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
      } else {
        this.openMessage()
      }
    },
    async getList() {
      this.listLoading = true
      this.paramsList.current = this.listQuery.page
      this.paramsList.pageSize = this.listQuery.limit
      this.paramsList.q = ''
      await fetchTenantList(this.paramsList).then(res => {
        if (!res.data) return
        res.data.forEach(item => {
          item.label = item.name
        })
        const parentId = this.columns.find(item => item.param === 'parentId')
        parentId.options = setTreeData(res.data) // 生成树形结构用于选择上级租户
        const tenantMap = new Map() // 生成Map对象 用于列表上级租户的渲染
        res.data.forEach(item => tenantMap.set(item.id, item.name))
        this.tenantMap = tenantMap
        this.total = res.total
        this.dataSource = res.data
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleChange(data) {
      this.temp[data.item.param] = data.value
    },
    resetTemp() {
      this.temp = {
        name: '',
        address: '',
        contact: '',
        phone: '',
        ip: '',
        type: '0',
        envid: '',
        disabled: '0',
        parentId: null,
        notes: ''
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
          createTenant(this.temp).then(res => {
            this.dialogFormVisible = false
            this.temp.id = res.id
            this.dataSource.unshift(this.temp)
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
          updateTenant(tempData.id, tempData).then(() => {
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
          deleteTenant(this.temp.id).then(() => {
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

