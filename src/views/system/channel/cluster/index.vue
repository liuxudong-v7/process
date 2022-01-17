<template>
  <div class="app-container">
    <el-card class="box-card">
      <searchForm :form-list="formList" @submitForm="handleFilter" />
    </el-card>
    <el-card class="box-card" style="margin-top:15px;">
      <div class="cutTable">
        <el-button v-permission="['create']" type="primary" size="small" @click="handleCreate"><i class="el-icon-plus" /> 新 建</el-button>
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" clearable>
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
import { clusterList, updaCluster, createCluster, deleteCluster, fetchTabtenantList } from '@/api/sys'
import FormTemplate from '@/components/FormTemplate'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import searchForm from '@/components/searchForm'
import { setMapValue } from '@/utils/service'
export default {
  components: { FormTemplate, ReuseTable, Pagination, searchForm },
  data() {
    return {
      formList: [
        { label: '底座名称', value: 'clusterName', type: 'string', clearable: true, placeholder: '' },
        { label: '申请人', value: 'register', type: 'string', clearable: true, placeholder: '' },
        { label: '系统标识', value: 'envid', type: 'string', clearable: true, placeholder: '' }
      ],
      paramsList: {
        current: 1,
        pageSize: 20,
        r: true,
        q: '',
        sorter: '',
        order: undefined
      },
      tableKey: 0,
      dataSource: [],
      listLoading: true,
      dialogFormVisible: false,
      temp: {
        id: '',
        clusterNo: '',
        clusterName: '',
        envid: '',
        disabled: '',
        register: null,
        remark: '',
        revision: ''
      }, // 传输数据
      listQuery: {
        page: 1,
        limit: 20,
        sorter: '',
        order: undefined
      }, // 搜索条件
      textMap: {
        update: '编辑',
        create: '新建'
      },
      dialogStatus: '',
      total: 1,
      tableOption: { label: '操作', width: '200',
        options: [
          { type: 'primary', icon: 'el-icon-edit', methods: 'update' },
          { type: 'danger', icon: 'el-icon-delete', methods: 'delete' }
        ]
      },
      rules: {
        envid: [{ required: true, message: 'timestamp is required', trigger: 'change' }]
      },
      columns: [
        { label: '集群编号', param: 'clusterNo', align: 'center', editor: 'text' },
        { label: '集群名称', param: 'clusterName', align: 'center', editor: 'text' },
        { label: '系统标识', param: 'envid', align: 'center', editor: 'select',
          options: []
        },
        { label: '系统名称', param: 'envname', align: 'center', editor: 'text', showForm: false,
          render: (h, params) => {
            const envid = params.row.envid
            const envidList = this.envidList
            if (envid) {
              return h(
                'div',
                // 'el-tag',
                // {
                //   attrs: {
                //     size: 'mini'
                //   }
                // },
                envidList.get(envid)
              )
            }
          } },
        { label: '备注', param: 'remark', align: 'center', editor: 'textare' },
        // { label: '登记人', param: 'register', align: 'center', editor: 'text', showForm: false },
        { label: '创建时间', param: 'ctime', align: 'center', sortable: true, valueType: 'dateTime', showForm: false },
        { label: '时间戳', param: 'st', align: 'center', sortable: true, valueType: 'dateTime', showForm: false }

      ],
      envidOptions: [],
      envidList: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      const paramsList = Object.assign(this.paramsList, { mode: 0 })
      await fetchTabtenantList(paramsList).then(res => {
        const { data } = res
        const map = new Map() // 生成Map对象
        data.forEach(item => map.set(item.envid, item.name))
        this.envidList = map
        const envList = data.map(item => {
          return {
            key: item.envid,
            value: item.name
          }
        })
        this.envidOptions = envList
        this.columns[this.columns.findIndex((item, index) => {
          return item.param === 'envid'
        })].options = this.envidOptions
      }).catch(() => {
        this.listLoading = false
      })
      await clusterList(this.paramsList).then(response => {
        this.dataSource = response.data
        this.total = response.total
        this.listLoading = false
      })
        .catch(() => {
          this.listLoading = false
        })
    },
    handleChange(data) {
      this.temp[data.item.param] = data.value
    },
    handleButton(data) {
      this.temp = Object.assign({}, data.row)
      if (data.methods === 'update') {
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
      } else if (data.methods === 'delete') {
        this.openMessage()
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: '',
        clusterNo: '',
        clusterName: '',
        envid: '',
        disabled: '',
        register: null,
        remark: '',
        revision: ''
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
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // eslint-disable-next-line no-unused-vars
          const tempData = Object.assign({}, this.temp)
          updaCluster(tempData.id, tempData).then(() => {
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
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createCluster(this.temp).then(() => {
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
    openMessage() {
      this.$confirm('此操作将永久删除该条信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(action => {
        if (action === 'confirm') {
          deleteCluster(this.temp.id).then(() => {
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

<style scoped lang="scss">
.cutTable {
  display: flex;
  justify-content: flex-end;
  height: 42px;
  padding-bottom: 10px;
}
</style>
