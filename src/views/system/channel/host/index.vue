<template>
  <div class="app-container">
    <el-card class="box-card">
      <searchForm :form-list="formList" @submitForm="handleFilter" />
    </el-card>
    <el-card class="box-card" style="margin-top:15px;">
      <div class="filter-container" style="margin-top: 15px;display: flex;justify-content: flex-end;">
        <!--<el-input v-model="paramsList.q" placeholder="" style="width: 300px;" class="input-with-select" @change="changeIn" @keyup.enter.native="handleFilter">
            <el-button slot="append" icon="el-icon-search" @click="handleFilter" />
          </el-input>-->
        <el-button v-permission="['create']" class="filter-item" size="small" type="primary" icon="el-icon-plus" @click="handleCreate">
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
    </el-card>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="60%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主机名称" prop="name">
              <el-input v-model="temp.name" type="text" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主机地址" prop="host">
              <el-input v-model="temp.host" type="text" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属网络" prop="network">
              <el-select v-model="temp.network" placeholder="请选择">
                <el-option v-for="(item,index) in networkOptions" :key="index" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主机类别" prop="type">
              <el-select v-model="temp.type" placeholder="请选择" @change="typeChange">
                <el-option v-for="(item,index) in typeOptions" :key="index" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="relationIdLabel" prop="relationId">
              <el-select v-model="temp.relationId" filterable placeholder="请选择">
                <el-option
                  v-for="(item,index) in relationIdOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="temp.remark" type="textarea" :autosize="{minRows: 4, maxRows: 6}" />
            </el-form-item>
          </el-col>
        </el-row>

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

import { fetchHostList, findAllTenantEnv, findAllClusters, createHost, updateHost, deleteHost } from '@/api/sys'
import user from '@/store/modules/user'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import FormTemplate from '@/components/FormTemplate'
import searchForm from '@/components/searchForm'

export default {
  name: 'Host',
  components: { ReuseTable, Pagination, FormTemplate, searchForm },
  data() {
    return {
      /** searchForm */
      formList: [
        { label: '主机名称', value: 'name', type: 'string', clearable: true, placeholder: '' },
        { label: '主机地址', value: 'host', type: 'string', clearable: true, placeholder: '' }
      ],
      /** searchForm */
      list: null,
      changeInput: false,
      listLoading: true,
      total: 1,
      temp: {
        name: '',
        host: '',
        network: '1',
        type: '0',
        relationId: '',
        remark: ''
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
        { label: '主机名称', param: 'name' },
        { label: '主机地址', param: 'host' },
        { label: '所属网络', param: 'network',
          valueEnum: { '0': '开发环境', '1': '测试环境', '2': '生产环境' },
          editor: 'select', options: [
            { key: '0', value: '开发环境' },
            { key: '1', value: '测试环境' },
            { key: '2', value: '生产环境' }
          ] },
        {
          label: '主机类别',
          param: 'type',
          align: 'left',
          valueEnum: { '0': '配置后台', '1': '底座集群' },
          editor: 'select',
          options: [
            { key: '0', value: '配置后台' },
            { key: '1', value: '底座集群' }
          ]
        },
        { label: '物理系统', param: 'relationId' },
        { label: '登记人', param: 'register' },
        { label: '创建时间', param: 'ctime', valueType: 'dateTime', showForm: false },
        { label: '时间戳', param: 'st', align: 'left', sortable: true, valueType: 'dateTime', showForm: false }
      ],
      tableOption: {
        label: '操作', width: '160', fixed: 'right',
        options: [
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
        name: [{ required: true, message: '请输入主机名称！', trigger: 'blur' }],
        host: [{ required: true, message: '请输入主机地址！', trigger: 'blur' }],
        network: [{ required: true, message: '请输入所属网络！', trigger: 'blur' }]
      },
      paramsList: {
        current: 1,
        pageSize: 10,
        r: true,
        q: '',
        sorter: '',
        order: undefined
      },
      networkOptions: [
        { value: '0', label: '开发环境' },
        { value: '1', label: '测试环境' },
        { value: '2', label: '生产环境' }
      ],
      typeOptions: [
        { value: '0', label: '配置后台' },
        { value: '1', label: '底座集群' }
      ],
      relationIdOptions: [],
      clusterNoOptions: [],
      tenantEnvidOptions: [],
      relationIdLabel: '物理子系统id'
    }
  },
  watch: {},
  created() {
    this.getList()
  },
  methods: {
    handleFilter(dialogForm) {
      Object.assign(this.paramsList, dialogForm)
      this.paramsList.current = 1
      this.getList()
    },
    handleButton(data) {
      this.temp = Object.assign({}, data.row)
      if (this.temp.dataPerms === null) this.temp.dataPerms = []
      if (data.methods == 'create') {
        this.relationIdOptions = this.tenantEnvidOptions
        this.relationIdLabel = '物理子系统id'
      } else if (data.methods === 'update') {
        this.dialogStatus = 'update'
        if (this.temp.type == '0') {
          this.relationIdOptions = this.tenantEnvidOptions
          this.relationIdLabel = '物理子系统id'
        } else {
          this.relationIdOptions = this.clusterNoOptions
          this.relationIdLabel = '集群ID'
        }
        this.dialogFormVisible = true
        if (this.$refs['dataForm'] != null) {
          this.$refs['dataForm'].resetFields()
        }
      } else if (data.methods === 'delete') {
        this.openMessage()
      }
    },
    async getList() {
      this.listLoading = true
      await findAllTenantEnv().then(res => {
        if (!res.data) return
        const tenantEnvList = res.data.map(item => {
          return {
            value: item.envid,
            label: item.name
          }
        })
        this.tenantEnvidOptions = tenantEnvList
        this.relationIdOptions = tenantEnvList
      })
      await findAllClusters().then(res => {
        if (!res.data) return
        const clusterList = res.data.map(item => {
          return {
            value: item.clusterNo,
            label: item.clusterName
          }
        })
        this.clusterNoOptions = clusterList
      })
      this.paramsList.current = this.listQuery.page
      this.paramsList.pageSize = this.listQuery.limit
      this.paramsList.q = ''
      await fetchHostList(this.paramsList).then(res => {
        this.total = res.total
        this.dataSource = res.data
        this.changeInput = false
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      }).catch(err => {
        console.log(err)
        this.listLoading = false
      })
    },
    typeChange() {
      if (this.temp.type == '0') { // 0-配置后台，1-底座集群
        this.relationIdOptions = this.tenantEnvidOptions
        this.relationIdLabel = '物理子系统id'
      } else {
        this.relationIdOptions = this.clusterNoOptions
        this.relationIdLabel = '集群ID'
      }
      this.temp.relationId = ''
    },
    resetTemp() {
      this.temp = {
        name: '',
        host: '',
        network: '1',
        type: '0',
        relationId: '',
        remark: ''
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
          const tempData = Object.assign({}, this.temp)
          createHost(tempData).then(res => {
            this.dialogFormVisible = false
            this.temp.id = res.id
            this.getList()
            this.temp.register = user.state.name
            this.temp.ctime = new Date()
            this.temp.st = new Date()
            this.dataSource.unshift(this.temp)
            this.total += 1
            this.$notify({
              title: 'Success',
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
          const tempData = Object.assign({}, this.temp)
          updateHost(tempData.id, tempData).then(() => {
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: 'Success',
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
          deleteHost(this.temp.id).then(() => {
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
    changeIn(e) {
      this.changeInput = true
    },
    handleChange(data) {
      this.temp[data.item.param] = data.value
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
