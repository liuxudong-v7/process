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
      :key="tableKey"
      v-loading="listLoading"
      :data-source="dataSource"
      :columns="columns"
      :table-option="tableOption"
      @handleButton="handleButton"
    />
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" clearable :close-on-click-modal="false">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="79px" style="width: 70%; margin-left:50px;">
        <div class="createPost-main-container">
          <form-template
            v-for="item in columns"
            :key="item.id"
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

import { fetchTabtenantList, createTabtenant, updaTabtenant, deleteTabtenant } from '@/api/sys'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import FormTemplate from '@/components/FormTemplate'

export default {
  name: 'TenantEnv',
  components: { ReuseTable, Pagination, FormTemplate },
  data() {
    const pickerOptions = { // 限制激活时间不让选择今天以前的
      disabledDate(time) {
        return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
      }
    }
    return {
      params: {
        current: 1,
        pageSize: 10,
        r: true
      },
      listLoading: true,
      total: 1,
      temp: {
        envid: '',
        flag: '',
        disabled: '',
        remark: null,
        stime: new Date()
      }, // 传输数据
      listQuery: {
        page: 1,
        limit: 20,
        sorter: '',
        order: undefined
      }, // 搜索条件
      dataSource: [],
      columns: [
        { label: '物理子系统id', param: 'envid', align: 'center', editor: 'text' },
        { label: '同步标志', param: 'flag', align: 'center', editor: 'select', valueEnum: { 0: '待同步', 1: '同步成功', 2: '同步失败' }, options: [
          { key: '0', value: '待同步' },
          { key: '1', value: '同步成功' },
          { key: '2', value: '同步失败' }
        ] },
        { label: '同步时间', param: 'stime', align: 'center', valueType: 'date', editor: 'date', pickerOptions },
        { label: '是否禁用', param: 'disabled', align: 'center', valueEnum: { 0: '否', 1: '是' }, editor: 'select',
          options: [
            { key: '0', value: '否' },
            { key: '1', value: '是' }
          ] },
        { label: '备注', param: 'remark', align: 'center', editor: 'textare' }
      ],
      tableOption: {
        label: '操作',
        width: '200',
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
        envid: [{ required: true, message: 'type is required', trigger: 'change' }]
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
      await fetchTabtenantList(this.params).then(response => {
        this.dataSource = response.data
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    resetTemp() {
      this.temp = {
        envid: '',
        flag: '',
        disabled: '',
        remark: null,
        stime: new Date()
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
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          createTabtenant(this.temp).then(() => {
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
          updaTabtenant(tempData.id, tempData).then(() => {
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
          deleteTabtenant(this.temp.id).then(() => {
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
