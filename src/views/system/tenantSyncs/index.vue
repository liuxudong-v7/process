<template>
  <div class="app-container">
    <el-card class="box-card">
      <searchForm :form-list="formList" @submitForm="handleFilter" />
    </el-card>

    <el-card class="box-card" style="margin-top:15px;">
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
        :page.sync="paramsList.current"
        :limit.sync="paramsList.pageSize"
        @pagination="getList"
      />
    </el-card>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
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
        <!-- <el-button v-if="dialogStatus!=='detail'" type="primary" size="medium" @click="dialogStatus==='create'?createData():updateData()">
          提交
        </el-button> -->
        <el-button size="medium" @click="dialogFormVisible = false">
          关闭
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { syncsQuery } from '@/api/sys'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import FormTemplate from '@/components/FormTemplate'
import searchForm from '@/components/searchForm'

export default {
  components: { ReuseTable, Pagination, FormTemplate, searchForm },
  data() {
    var myDate = new Date()// 获取系统当前时间
    var year = myDate.getFullYear() // 年
    var month = myDate.getMonth() + 1 // 月
    if (month < 10) {
   	month = '0' + month
    }
    var date = myDate.getDate() // 日
    var currentDate = year + '-' + month + '-' + date + ' ' + myDate.getHours() + ':' + myDate.getMinutes()// 当前时间

    return {
      /** searchForm */
      formList: [
        { label: '租户名称', value: 'tenantName', type: 'string', clearable: true, placeholder: '' },
        { label: '租户id', value: 'tenantNo', type: 'string', clearable: true, placeholder: '' }
      ],
      /** searchForm */
      list: null,
      listLoading: true,
      total: 1,
      temp: {
        name: '',
        contact: '',
        certtype: '0',
        certno: '',
        phone: '',
        address: '',
        ip: '',
        syncSwitch: '0',
        disabled: '0'
      }, // 传输数据
      listQuery: {
        page: 1,
        limit: 20
      }, // 搜索条件
      dialog: {}, // 弹出框
      dataSource: [],
      columns: [
        { label: '租户Id', param: 'tenantNo', align: 'left', editor: 'text' },
        { label: '租户名称', param: 'tenantName', align: 'left', editor: 'text' },
        { label: '操作类型', param: 'operate', align: 'center',
          valueEnum: { 1: '实时同步新增', 2: '实时同步修改', 3: '实时同步删除', 4: '定时同步新增', 5: '定时同步修改', 6: '定时同步删除', 7: '开启定时同步', 8: '关闭定时同步' }, editor: 'select', showForm: false,
          options: [

          ] },
        { label: '起始时间', param: 'startTime', align: 'center', valueType: 'date' },
        { label: ' 终止时间', param: 'endTime', align: 'center', valueType: 'date' },
        { label: '状态', param: 'status', align: 'center', valueEnum: { 0: '失败', 1: '成功' }, editor: 'select', showForm: false, width: 120,
          render: (h, params) => {
            const checked = params.row.status
            console.log(params.row.status)
            const checkedMap = { 0: '失败', 1: '成功' }
            return h(
              'el-tag',
              {
                attrs: {
                  size: 'mini',
                  type: checked === '1' ? 'success' : 'danger'
                }
              },
              checkedMap[checked]
            )
          }
        },
        { label: '状态描述', param: 'descrip', align: 'center', editor: 'text', showForm: false },
        { label: '同步地址', param: 'syncUrl', align: 'left', editor: 'text' }
      ],
      tableOption: {
        label: '操作',
        width: '200',
        fixed: 'right',
        options: [
          { type: 'text', label: '查看详情', methods: 'update' }
        ]
      },
      textMap: {
        update: '查看详细'
      },
      dialogFormVisible: false,
      dataForm: {},
      dialogStatus: '', // 创建or更新
      rules: {
        name: [{ required: true, message: '请输入名称！', trigger: 'blur' }],
        contact: [{ required: true, message: '请输入申请人！', trigger: 'blur' }]
      },
      tenantMap: [],
      paramsList: {
        current: 1,
        pageSize: 20,
        date: currentDate,
        operTime: '',
        operate: '1'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleFilter(dialogForm) {
      Object.assign(this.paramsList, dialogForm)
      this.paramsList.current = 1
      this.getList()
    },
    async handleButton(data) {
      this.temp = Object.assign({}, data.row)
      if (data.methods === 'update') {
        // syncsQuery(this.paramsList).then(res => {
        //   console.log(res)
        // })
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
      }
    },
    async getList() {
      this.listLoading = true
      await syncsQuery(this.paramsList).then(res => {
        // this.total = res.total
        this.dataSource = res.data
        this.listLoading = false
      }).catch(() => {
        this.dataSource = []
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
        certno: '',
        phone: '',
        ip: '',
        certtype: '0',

        syncSwitch: '0',
        disabled: '0'
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    }
    // createData() {
    //   this.$refs['dataForm'].validate((valid) => {
    //     if (valid) {
    //       createTenant(this.temp).then(res => {
    //         this.dialogFormVisible = false
    //         this.getList()
    //         this.$message({
    //           type: 'success',
    //           message: '新建成功',
    //           duration: 2000
    //         })
    //       })
    //     }
    //   })
    // },
    // updateData() {
    //   this.$refs['dataForm'].validate((valid) => {
    //     if (valid) {
    //       const tempData = Object.assign({}, { entity: this.temp }, { advice: '修改' })
    //       updateTenant(tempData.entity.id, tempData).then(() => {
    //         this.dialogFormVisible = false
    //         this.getList()
    //         this.$message({
    //           type: 'success',
    //           message: '修改成功',
    //           duration: 2000
    //         })
    //       })
    //     }
    //   })
    // },
    // cut() {
    //   // this.paramsList.mode = 1 ^ this.paramsList.mode
    //   Object.assign(this.paramsList, {
    //     mode: 1 ^ this.paramsList.mode,
    //     current: 1,
    //     pageSize: 20
    //   })
    //   this.getList()
    // }
  }
}
</script>
<style scoped lang="scss">
.cutTable {
  display: flex;
  justify-content: space-between;
  height: 42px;
  padding-bottom: 10px;
  span {
    display: flex;
    align-items: center;
    .el-icon-document-copy {
      margin-left: 10px;
    }
  }
}
</style>
