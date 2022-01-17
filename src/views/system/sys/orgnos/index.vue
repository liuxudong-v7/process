<template>
  <div class="app-container">
    <div class="filter-container" style="margin-top: 15px;display: flex;justify-content: flex-end;">
      <el-input v-model="paramsList.q" placeholder="" style="width: 300px;" class="input-with-select" @keyup.enter.native="handleFilter">
        <el-button slot="append" icon="el-icon-search" @click="handleFilter" />
      </el-input>
      <el-button v-if="paramsList.hasPerm" v-permission="['create']" size="small" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <el-form
        ref="dataForm"
        v-enterToNext="true"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="80px"
        style="width: 80%; margin-left:50px;"
      >
        <form-template
          v-for="item in columns"
          :key="item.param"
          :temp="item"
          :value="temp[item.param]"
          @input="handleChange"
        />
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
import { createOrgno, updateOrgno, deleteOrgno, fetchOrgnoList, getOrgnosList } from '@/api/sys'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import FormTemplate from '@/components/FormTemplate'
import { setTreeData, setMapValue } from '@/utils/service'

export default {
  components: { ReuseTable, Pagination, FormTemplate },
  data() {
    return {
      list: null,
      listLoading: true,
      total: 1,
      temp: {
        parentId: null,
        id: '',
        name: '',
        address: '',
        disabled: '0',
        remark: ''
      }, // 传输数据
      listQuery: {
        page: 1,
        limit: 10
      }, // 搜索条件
      dialog: {}, // 弹出框
      dataSource: [],
      columns: [
        { label: '机构编号', param: 'id', align: 'left', editor: 'text', width: 200 },
        { label: '机构名称', param: 'name', align: 'left', editor: 'text', width: 200 },
        { label: '上级机构', param: 'parentId', align: 'left', editor: 'treeSelect', width: 200,
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
        { label: '地址', param: 'address', align: 'left', width: 300, editor: 'text' },
        {
          label: '是否禁用',
          param: 'disabled',
          align: 'center',
          width: 100,
          valueEnum: { 0: '否', 1: '是' },
          editor: 'select',
          options: [
            { key: '0', value: '否' },
            { key: '1', value: '是' }
          ]
        },
        // { label: ' 备注', param: 'remark', align: 'left', editor: 'textare' },
        { label: '创建时间', param: 'ctime', align: 'left', width: 150, valueType: 'date', showForm: false },
        { label: '时间戳', param: 'st', align: 'left', width: 200, valueType: 'dateTime', showForm: false }
      ],
      tableOption: {
        label: '操作',
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
        id: [{ required: true, message: '请输入机构编号！', trigger: 'blur' }],
        name: [{ required: true, message: '请输入机构名称！', trigger: 'blur' }]
      },
      tenantMap: [],
      paramsList: {
        current: 1,
        pageSize: 10,
        r: true,
        q: '',
        sorter: '',
        order: undefined,
        hasPerm: true
      }
    }
  },
  created() {
    this.getOrgnos()
    this.getList()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleButton(data, type) {
      this.temp = Object.assign({}, data.row)
      if (data.methods === 'update') {
        this.columns[0].disabled = true
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        if (this.$refs['dataForm'] != null) {
          this.$refs['dataForm'].resetFields()
        }
      } else {
        this.openMessage()
      }
    },
    getOrgnos() {
      getOrgnosList().then(res => {
        if (!res.data) return
        res.data.forEach(item => {
          item.label = item.name
        })
        const parentId = this.columns.find(item => item.param === 'parentId')
        parentId.options = setTreeData(res.data) // 生成树形结构用于选择上级租户
        this.tenantMap = setMapValue(res.data)
      })
    },
    async getList() {
      this.listLoading = true
      this.paramsList.current = this.listQuery.page
      this.paramsList.pageSize = this.listQuery.limit
      this.paramsList.q = ''
      await fetchOrgnoList(this.paramsList).then(res => {
        if (!res.data) return
        res.data.forEach(item => {
          item.label = item.name
        })
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
        parentId: null,
        id: '',
        name: '',
        address: '',
        disabled: '0',
        remark: ''
      }
    },
    handleCreate() {
      this.columns[0].disabled = false
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
          createOrgno(this.temp).then(res => {
            this.dialogFormVisible = false
            this.getList()
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
          const tempData = Object.assign({}, this.temp)
          updateOrgno(tempData.id, tempData).then(() => {
            this.dialogFormVisible = false
            this.getList()
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
          deleteOrgno(this.temp.id).then(() => {
            this.getList()
            this.$message({
              type: 'success',
              message: '删除成功!',
              duration: 2000
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

