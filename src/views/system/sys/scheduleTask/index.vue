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

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      width="60%"
    >
      <el-form ref="dataForm" :rules="rules" :model="temp" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务描述" prop="taskDesc">
              <el-input v-model="temp.taskDesc" type="text" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务类名" prop="beanName">
              <el-input v-model="temp.beanName" type="text" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务方法名" prop="methodName">
              <el-input v-model="temp.methodName" type="text" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="CRON语法" prop="cronExpression">
              <el-popover v-model="cronPopover">
                <!--<el-input v-model="temp.cronExpression" type="text" placeholder="请输入"/>-->
                <el-input slot="reference" v-model="temp.cronExpression" placeholder="请输入定时策略" readonly="true" @click="cronPopover=true" />
                <cron i18n="cn" @change="changeCron" @close="cronPopover=false" />
              </el-popover>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="初始启动标志" prop="flag">
              <el-select v-model="temp.flag" placeholder="请选择">
                <el-option
                  v-for="(item,index) in flagOptions"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否禁用" prop="disabled">
              <el-select v-model="temp.disabled" placeholder="请选择">
                <el-option
                  v-for="(item,index) in disabledOptions"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
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

import Vue from 'vue'
import VueCron from 'vue-cron'
Vue.use(VueCron)
import { fetchScheduleTaskList, createScheduleTask, updateScheduleTask, removeScheduleTask } from '@/api/sys'
import { cron } from 'vue-cron'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import FormTemplate from '@/components/FormTemplate'
import searchForm from '@/components/searchForm'

export default {
  name: 'ScheduleTask',
  components: { ReuseTable, Pagination, FormTemplate, searchForm, cron },
  data() {
    return {
      /** searchForm */
      formList: [
        { label: '任务描述', value: 'taskDesc', type: 'string', clearable: true, placeholder: '' },
        { label: '任务类名', value: 'beanName', type: 'string', clearable: true, placeholder: '' },
        { label: '方法名', value: 'methodName', type: 'string', clearable: true, placeholder: '' }
      ],
      /** searchForm */
      list: null,
      changeInput: false,
      listLoading: true,
      total: 1,
      cronPopover: false,
      temp: {
        taskDesc: '',
        beanName: '',
        methodName: '',
        cronExpression: '',
        flag: '1',
        disabled: '0'
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
        { label: '任务描述', param: 'taskDesc', width: 200 },
        { label: '任务类名', param: 'beanName', width: 200 },
        { label: '任务方法名', param: 'methodName', width: 200 },
        { label: '任务表达式', param: 'cronExpression', width: 140 },
        {
          label: '初始启动标志', param: 'flag', width: 140,
          valueEnum: { '0': '否', '1': '是' },
          editor: 'select', options: [
            { key: '0', value: '否' },
            { key: '1', value: '是' }
          ]
        },
        {
          label: '是否禁用',
          param: 'disabled',
          align: 'center',
          width: 100,
          valueEnum: { '0': '否', '1': '是' },
          editor: 'select',
          options: [
            { key: '0', value: '否' },
            { key: '1', value: '是' }
          ]
        },
        { label: '创建时间', param: 'createTime', valueType: 'dateTime', width: 200, showForm: false },
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
        taskDesc: [{ required: true, message: '请输入任务描述！', trigger: 'blur' }],
        beanName: [{ required: true, message: '请输入类名！', trigger: 'blur' }],
        methodName: [{ required: true, message: '请输入方法名！', trigger: 'blur' }]
      },
      paramsList: {
        current: 1,
        pageSize: 10,
        r: true,
        q: '',
        sorter: '',
        order: undefined
      },
      flagOptions: [
        { value: '0', label: '否' },
        { value: '1', label: '是' }
      ],
      disabledOptions: [
        { value: '0', label: '否' },
        { value: '1', label: '是' }
      ]
    }
  },
  watch: {},
  created() {
    this.getList()
  },
  methods: {
    changeCron(val) {
      /* cron插件缺陷修复*/
      // let str = val.split(" ");
      // if((str[2].equalsIgnoreCase("1L")  || str[2].equalsIgnoreCase("2L")  || str[2].equalsIgnoreCase("3L")  || str[2].equalsIgnoreCase("4L")  || str[2].equalsIgnoreCase("5L")  || str[2].equalsIgnoreCase("6L")|| str[2].equalsIgnoreCase("7L")) && str[4].equalsIgnoreCase("?")){
      //   str[4] = str[2];
      //   str[2] = "?";
      //   execTime = str[0] + " " + str[1] + " " + str[2] + " " + str[3] + " " + str[4];
      //   paramJson.put("execTime",execTime);
      // }
      this.temp.cronExpression = val
    },
    handleFilter(dialogForm) {
      Object.assign(this.paramsList, dialogForm)
      this.paramsList.current = 1
      this.getList()
    },
    handleButton(data) {
      this.temp = Object.assign({}, data.row)
      if (data.methods === 'create') {
        this.temp.flag = '1'
        this.temp.disabled = '0'
      } else if (data.methods === 'update') {
        this.dialogStatus = 'update'
        this.temp = data.row
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
      this.paramsList.current = this.listQuery.page
      this.paramsList.pageSize = this.listQuery.limit
      this.paramsList.q = ''
      await fetchScheduleTaskList(this.paramsList).then(res => {
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
    resetTemp() {
      this.temp = {
        taskDesc: '',
        beanName: '',
        methodName: '',
        cronExpression: '',
        flag: '1',
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
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          createScheduleTask(tempData).then(res => {
            this.dialogFormVisible = false
            this.temp.id = res.id
            this.getList()
            this.temp.createTime = new Date()
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
          updateScheduleTask(tempData.id, tempData).then(() => {
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
          removeScheduleTask(this.temp.id).then(() => {
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
