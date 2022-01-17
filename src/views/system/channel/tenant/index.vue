<template>
  <div class="app-container">
    <div v-show="auditIf == '0'">
      <el-card class="box-card">
        <searchForm :form-list="formList" @submitForm="handleFilter" />
      </el-card>
      <el-card class="box-card" style="margin-top:15px;">
        <!--        <div class="cutTable">-->
        <!--          <span>{{ paramsList.mode?'业务待办':'业务浏览' }}-->
        <!--            <el-tooltip class="item" effect="dark" :content="paramsList.mode?'切换到浏览模式':'切换到待办模式'" placement="right">-->
        <!--              <i class="el-icon-document-copy" @click="cut" />-->
        <!--            </el-tooltip>-->
        <!--          </span>-->
        <!--          <el-button v-if="!paramsList.mode" v-permission="['create']" type="primary" size="small" @click="handleCreate"><i class="el-icon-plus" /> 新 建</el-button>-->
        <!--        </div>-->

        <el-tabs v-model="activeTab" type="border-card" @tab-click="handleClick">
          <el-tab-pane label="业务待办" name="ywdb">
            <reuse-table
              v-loading="listLoading"
              :data-source="dataSource"
              :columns="lstTable"
              :table-option="optionList"
              @handleButton="handleButton"
            >
              <!-- <template slot="detail" slot-scope="props">
                <el-button v-if="paramsList.mode===0" type="text" size="mini" @click="detailView(props.detail)">详情</el-button>
              </template> -->
            </reuse-table>
            <pagination
              v-show="total > 0"
              :total="total"
              :page.sync="paramsList.current"
              :limit.sync="paramsList.pageSize"
              @pagination="getList"
            />
          </el-tab-pane>

          <el-tab-pane label="业务浏览" name="ywll">
            <div class="cutTable">
              <el-button v-permission="['create']" style="position: absolute; left: 94%;" type="primary" size="small" @click="handleCreate"><i class="el-icon-plus" /> 新 建</el-button>
            </div>
            <reuse-table
              v-loading="listLoading"
              :data-source="dataSource"
              :columns="lstTable"
              :table-option="optionList"
              @handleButton="handleButton"
            >
              <!-- <template slot="detail" slot-scope="props">
                <el-button v-if="paramsList.mode===0" type="text" size="mini" @click="detailView(props.detail)">详情</el-button>
              </template> -->
            </reuse-table>
            <pagination
              v-show="total > 0"
              :total="total"
              :page.sync="paramsList.current"
              :limit.sync="paramsList.pageSize"
              @pagination="getList"
            />
          </el-tab-pane>
          <el-tab-pane label="我的工单" name="wdgd">
            <el-table
              v-loading="listLoading"
              :data="taskProcessList"
              style="width: 100%"
            >
              <el-table-column type="expand">
                <template #default="props">
                  <el-table
                    stripe
                    border
                    :data="props.row.taskProcess"
                    style="width: 100%"
                  >
                    <el-table-column
                      prop="id"
                      label="id"
                      width="180"
                    />
                    <el-table-column
                      prop="name"
                      label="名称"
                      width="180"
                    />
                    <el-table-column
                      prop="advice"
                      label="发表意见"
                      width="180"
                    />
                    <el-table-column
                      prop="operate"
                      :formatter="getOperate"
                      label="执行操作"
                    />
                    <el-table-column
                      prop="operateTime"
                      label="执行时间"
                    />
                  </el-table>

                  <!--                  <el-form v-for="task in props.row.taskProcess" label-position="left" inline class="demo-table-expand">-->
                  <!--                    <el-form-item label="id">-->
                  <!--                      <span>{{ task.id }}</span>-->
                  <!--                    </el-form-item>-->
                  <!--                    <el-form-item label="发表意见">-->
                  <!--                      <span>{{ task.advice }}</span>-->
                  <!--                    </el-form-item>-->
                  <!--                    <el-form-item label="执行操作">-->
                  <!--                      <span>{{ task.operate }}</span>-->
                  <!--                    </el-form-item>-->
                  <!--                    <el-form-item label="执行时间">-->
                  <!--                      <span>{{ task.operateTime }}</span>-->
                  <!--                    </el-form-item>-->
                  <!--                  </el-form>-->
                </template>
              </el-table-column>
              <el-table-column
                label="任务名称"
                width="350"
                prop="taskName"
              />
              <el-table-column
                label="任务状态"
                :formatter="getTaskStatus"
                width="150"
                prop="taskStatus"
              />
              <el-table-column
                label="任务开始时间"
                width="250"
                prop="taskStartTime"
              />
              <el-table-column
                label="任务结束时间"
                width="250"
                prop="taskEndTime"
              />
              <el-table-column
                label="最后的有效操作"
                :formatter="getMyOperate"
                prop="myOperate"
              />
              <el-table-column
                fixed="right"
                label="操作"
              >
                <template #default="scope">
                  <el-button type="text" size="small" @click="recallClick(scope.row)">撤回</el-button>
                </template>
              </el-table-column>
            </el-table>
            <pagination
              v-show="total > 0"
              :total="total"
              :page.sync="paramsList.current"
              :limit.sync="paramsList.pageSize"
              @pagination="getWorkOrderList"
            />
          </el-tab-pane>
        </el-tabs>

      </el-card>
      <el-dialog
        title="备注"
        :visible.sync="dialogVisible"
        width="30%"
        :before-close="handleClose"
      >
        <el-input
          v-model="textarea"
          type="textarea"
          :rows="2"
          placeholder="请输入内容"
        />
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="recall">确 定</el-button>
          </span>
        </template>
      </el-dialog>
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" @close="closeDialog">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="84px" style="width: 70%; margin-left:50px;">
          <div class="createPost-main-container">
            <form-template
              v-for="item in lstTable"
              :key="item.param"
              :temp="item"
              :value="temp[item.param]"
              @input="handleChange"
            />
            <el-form-item label="主审人">
              <el-select v-model="temp.reviewerId" placeholder="请选择" style="width: 100%;" size="small" :disabled="dialogStatus!='create'" filterable>
                <el-option
                  v-for="item in usersList"
                  :key="item.id"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </div>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button v-if="dialogStatus!=='detail'" type="primary" size="medium" @click="dialogStatus==='create'?createData():updateData()">
            提交
          </el-button>
          <el-button size="medium" @click="closeDialog">
            取消
          </el-button>
        </div>
      </el-dialog>

      <el-dialog :title="textMap[dialogStatus]" :visible.sync="detailDialogFormVisible" :close-on-click-modal="false">
        <el-form ref="dataForm" :model="temp" label-position="left" label-width="80px" style="width: 73%;  margin-left: 100px;">
          <el-row :gutter="200">
            <el-col :span="12">
              <el-form-item label="租户编号：">
                {{ temp.tenantNo }}
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="租户名称：">
                {{ temp.name }}
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="租户描述：">
                {{ temp.tenantDsc }}
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="集群编号：">
                {{ temp.clusterNo }}
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="审核状态：">
                <span v-if="temp.checked == 0">未审核</span>
                <span v-if="temp.checked == 1">已审核</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button v-if="dialogStatus!=='detail'" type="primary" size="medium" @click="dialogStatus==='create'?createData():updateData()">
            提交
          </el-button>
          <el-button size="medium" @click="detailDialogFormVisible = false">
            取消
          </el-button>
        </div>
      </el-dialog>
    </div>
    <audit v-if="auditIf == '1'" :audit-id="auditId" :action="auditAction" :users-list="usersList" @fatherMethod="fatherMethod" />

  </div>
</template>

<script>
import { createTenant, updateTenant, fetchTenantList, getworkOrderRecall, workOrderUndo, getWorkOrderList, getClusters, passwdReset, getAuditorsList, fetchDeployArea } from '@/api/sys'
// import { setTreeData, setMapValue } from '@/utils/service'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import FormTemplate from '@/components/FormTemplate'
import searchForm from '@/components/searchForm'
import Audit from './audit'
import { setMap, setArray } from '@/utils/service'
const checkPhone = (rule, value, callback) => {
  if (value) {
    // const reg = /^1[3456789]\d{9}$/
    var isPhone = /^([0-9]{3,4}-)?[0-9]{7,8}$/
    var isMobile = /^((\+?86)|(\+86))?(13[012356789][0-9]{8}|15[012356789][0-9]{7})$/
    if (isPhone.test(value) || isMobile.test(value)) {
      callback()
    } else {
      callback(new Error('格式错误，请重新填写！'))
    }
  } else {
    callback(new Error('请输入'))
  }
}

// const checkIdCard = (rule, value, callback) => {
//   if (value) {
//     const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
//     if (reg.test(value)) {
//       callback()
//     } else {
//       callback(new Error('格式错误，请重新填写！'))
//     }
//   }
// }

export default {
  components: { ReuseTable, Pagination, FormTemplate, searchForm, Audit },
  data() {
    return {
      activeTab: 'ywdb',
      dialogVisible: false,
      row: '',
      textarea: '',
      detailDialogFormVisible: false,
      /** searchForm */
      formList: [
        { label: '租户名称', value: 'name', type: 'string', clearable: true, placeholder: '' },
        { label: '租户编号', value: 'tenantNo', type: 'string', clearable: true, placeholder: '' }
      ],
      /** searchForm */
      list: null,
      listLoading: true,
      total: 1,
      taskProcessList: [],
      temp: {
        reviewerId: '',
        name: '',
        tenantDsc: '',
        clusterNo: '',
        deployArea: '',
        disabled: '0',
        remark: ''
      }, // 传输数据
      listQuery: {
        page: 1,
        limit: 10
      }, // 搜索条件
      dialog: {}, // 弹出框
      dataSource: [],
      workOrder: [
        { label: '租户编号', param: 'tenantNo', align: 'left', width: 200, editor: 'text', showForm: false },
        { label: '租户名称', param: 'name', align: 'left', editor: 'text', width: 200 },
        { label: '当前审核人', param: 'currentName', align: 'left', editor: 'text', width: 200 },
        { label: '审核状态', param: 'checked', align: 'center', width: 150,
          valueEnum: { 0: '未审核', 1: '已审核' }, editor: 'select', showForm: false,
          render: (h, params) => {
            const checked = params.row.checked
            const checkedMap = { 0: '未审核', 1: '已审核' }
            return h(
              'el-tag',
              {
                attrs: {
                  size: 'mini'
                }
              },
              checkedMap[checked]
            )
          }
        },
        { label: '时间戳', param: 'st', align: 'center', sortable: true, valueType: 'dateTime', showForm: false }
      ],
      lstTable: [],
      columns: [
        { label: '租户名称', param: 'name', align: 'left', editor: 'text', width: 160 },
        { label: '租户描述', param: 'tenantDsc', align: 'left', editor: 'text', width: 160 },
        { label: '部署区域', param: 'deployArea', align: 'center', editor: 'select', width: 100,
          valueEnum: { 0: '标准区', 1: '集团域', 2: '建行域', 3: '子公司' },
          options: [
            { key: '0', value: '标准区' },
            { key: '1', value: '集团域' },
            { key: '2', value: '建行域' },
            { key: '3', value: '子公司' }
          ] },
        // { label: '集群编号', param: 'clusterNo', align: 'center', width: 160, editor: 'cascader', options: [] },
        { label: '集群名称', param: 'clusterName', align: 'center', editor: 'text', width: 160, showForm: false },
        { label: '租户编号', param: 'tenantNo', align: 'left', width: 120, editor: 'text', showForm: false },
        { label: '审核状态', param: 'checked', align: 'center', width: 120,
          valueEnum: { 0: '未审核', 1: '已审核' }, editor: 'select', showForm: false,
          render: (h, params) => {
            const checked = params.row.checked
            const checkedMap = { 0: '未审核', 1: '已审核' }
            return h(
              'el-tag',
              {
                attrs: {
                  size: 'mini'
                }
              },
              checkedMap[checked]
            )
          }
        },
        // { label: '备注', param: 'remark', align: 'center', editor: 'textare', width: 160 },
        { label: '登记人', param: 'register', align: 'center', width: 100, editor: 'text', showForm: false },
        { label: '创建时间', param: 'ctime', align: 'center', width: 160, valueType: 'dateTime', showForm: false },
        { label: '时间戳', param: 'st', align: 'center', sortable: true, width: 160, valueType: 'dateTime', showForm: false }
      ],
      optionList: {},
      tableOption: {
        label: '操作',
        width: '200',
        fixed: 'right',
        options: []
      },
      workOption: {
        label: '操作',
        width: '370',
        fixed: 'right',
        options: []
      },
      workOperation: [
        { type: 'text', label: '处理流程', methods: 'check' },
        { type: 'text', label: '审核意见', methods: 'update' },
        { type: 'text', label: '撤回审核人', methods: 'revoke' },
        { type: 'text', label: '撤销审核人', methods: 'check' }
      ],
      tableBrowse: [
        { type: 'text', label: '详情', methods: 'detail' },
        { type: 'text', label: '撤销', methods: 'revoke' }
      ],
      tableCommission: [
        { type: 'text', label: '办理', methods: 'check' },
        { type: 'text', label: '编辑', methods: 'update' },
        { type: 'text', label: '撤销', methods: 'revoke' }
      ],
      textMap: {
        update: '编辑',
        create: '新建',
        detail: '详情'
      },
      dialogFormVisible: false,
      dataForm: {},
      dialogStatus: '', // 创建or更新
      rules: {
        name: [{ required: true, message: '请输入名称！', trigger: 'blur' }]
      },
      tenantMap: [],
      paramsList: {
        current: 0,
        pageSize: 10,
        r: true,
        q: '',
        sorter: '',
        order: undefined,
        mode: 1
      },
      auditAction: '',
      auditId: '',
      usersList: []

    }
  },
  created() {
    this.lstTable = this.columns
    this.getUsersList()
    // this.getClusters()
    // this.getDeployArea()   //获取部署区域集合
    if (this.$route.query.Id) {
      if (this.$route.query.c4 === 'check') {
        this.auditIf = 1
        this.auditAction = 'check'
        this.auditId = this.$route.query.Id
      } else {
        this.fatherMethod()
      }
    } else {
      this.fatherMethod()
    }
  },
  methods: {
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },

    getTaskStatus(row, column) {
      if (row.taskStatus === '0') {
        return '待审核'
      } else if (row.taskStatus === '1') {
        return '流转中'
      } else if (row.taskStatus === '2') {
        return '已审核'
      } else if (row.taskStatus === '3') {
        return '待修改'
      } else if (row.taskStatus === '4') {
        return '已撤销'
      }
    },
    getMyOperate(row, column) {
      if (row.myOperate === 'apply') {
        return '申请'
      } else if (row.myOperate === 'check') {
        return '审核'
      } else if (row.myOperate === 'veto') {
        return '否决'
      } else if (row.myOperate === 'update') {
        return '修改'
      } else if (row.myOperate === 'flow') {
        return '指派'
      } else if (row.myOperate === 'recall') {
        return '撤回(指撤回到上一级审核人)'
      } else if (row.myOperate === 'undo') {
        return '撤销审核人(指撤回到最初审核人)'
      } else if (row.myOperate === 'repeal') {
        return '撤销(指撤销流程)'
      } else if (row.myOperate === 'wait') {
        return '待处理'
      }
    },
    getOperate(row, column) {
      if (row.operate === 'apply') {
        return '申请'
      } else if (row.operate === 'check') {
        return '审核'
      } else if (row.operate === 'veto') {
        return '否决'
      } else if (row.operate === 'update') {
        return '修改'
      } else if (row.operate === 'flow') {
        return '指派'
      } else if (row.operate === 'recall') {
        return '撤回(指撤回到上一级审核人)'
      } else if (row.operate === 'undo') {
        return '撤销审核人(指撤回到最初审核人)'
      } else if (row.operate === 'repeal') {
        return '撤销(指撤销流程)'
      } else if (row.operate === 'wait') {
        return '待处理'
      }
    },
    recallClick(row) {
      this.row = row
      this.textarea = ''
      this.dialogVisible = true
    },
    recall() {
      var vo = {
        module: '1',
        advice: this.textarea
      }
      this.dialogVisible = false
      getworkOrderRecall(this.row.entityId, vo).then(res => {
        if (res.status === 0) {
          this.$message({
            message: '撤回成功',
            type: 'success'
          })
          this.cut()
        }
      }).catch(() => {
        this.dataSource = []
        this.listLoading = false
      })
    },
    undoClick(row) {
      var vo = {
        module: '1',
        advice: '意见'
      }
      workOrderUndo(row.id, vo).then(res => {

      }).catch(() => {
        this.dataSource = []
        this.listLoading = false
      })
    },
    fatherMethod() {
      this.auditIf = 0
      this.getList()
    },
    handleClick(tab, event) {
      if (tab.name === 'ywdb') {
        this.lstTable = this.columns
        this.paramsList.mode = 1
      } else if (tab.name === 'ywll') {
        this.lstTable = this.columns
        this.paramsList.mode = 0
      } else {
        this.lstTable = this.workOrder
        this.paramsList.mode = 2
      }
      this.cut()
    },
    handleFilter(dialogForm) {
      Object.assign(this.paramsList, dialogForm)
      this.paramsList.current = 1
      this.getList()
    },
    handleButton(data) {
      this.temp = Object.assign({}, data.row)
      if (data.methods === 'update') {
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
      } else if (data.methods === 'check') {
        // this.$router.push({
        //   path: 'audit',
        //   query: {
        //     id: data.row.id,
        //     action: 'check'
        //   }
        // })
        this.auditIf = 1
        this.auditAction = 'check'
        this.auditId = data.row.id
      } else if (data.methods === 'revoke') {
        const { checked } = data.row
        if (checked) {
          this.$message({
            type: 'warning',
            message: '该租户信息已审核，不能进行此操作！'
          })
        } else {
          this.auditIf = 1
          this.auditAction = 'revoke'
          this.auditId = data.row.id
        }
      } else if (data.methods === 'detail') {
        this.dialogStatus = 'detail'
        this.detailDialogFormVisible = true
      }
    },
    passwdReset(data) {
      this.temp = Object.assign({}, data)
      this.$confirm(`您确认重置租户(${this.temp.name})密码吗?`, '重置密码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(action => {
        if (action === 'confirm') {
          passwdReset(this.temp.tenantNo).then(() => {
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
    },
    async getList() {
      this.listLoading = true
      await fetchTenantList(this.paramsList).then(res => {
        if (!res.data) return
        // res.data.forEach(item => {
        //   item.label = item.name
        // })
        if (this.paramsList.mode === 1) {
          this.tableOption.options = this.tableCommission
          this.optionList = this.tableOption
        } else if (this.paramsList.mode === 0) {
          this.tableOption.options = this.tableBrowse
          this.optionList = this.tableOption
        } else if (this.paramsList.mode === 2) {
          this.workOption.options = this.workOperation
          this.optionList = this.workOption
        }
        this.total = res.total
        this.dataSource = res.data
        this.listLoading = false
        if (this.$route.query.Id && this.$route.query.c4 === 'update') {
          const dataList = this.dataSource.filter(item => {
            return item.id === this.$route.query.Id
          })
          this.temp = Object.assign({}, dataList[0])
          this.dialogStatus = 'update'
          this.dialogFormVisible = true
        }
      }).catch(() => {
        this.dataSource = []
        this.listLoading = false
      })
    },

    async getWorkOrderList() {
      this.listLoading = true
      var list = {
        current: this.paramsList.current,
        pageSize: this.paramsList.pageSize,
        module: '1'
      }
      await getWorkOrderList(list).then(res => {
        if (!res.data) return
        this.total = res.total
        this.taskProcessList = res.data
        this.listLoading = false
      }).catch(() => {
        this.dataSource = []
        this.listLoading = false
      })
    },
    handleChange(data) {
      if (data.item.editor === 'cascader') {
        this.temp[data.item.param] = data.value[1]
      } else {
        this.temp[data.item.param] = data.value
      }
    },
    resetTemp() {
      this.temp = {
        reviewerId: '',
        name: '',
        tenantDsc: '',
        clusterNo: '',
        syncSwitch: '0',
        disabled: '0',
        deployArea: '',
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
          const tempData = Object.assign({}, { entity: this.temp }, { reviewerId: this.temp.reviewerId })
          createTenant(tempData).then(res => {
            this.dialogFormVisible = false
            this.getList()
            this.$message({
              type: 'success',
              message: '新建成功',
              duration: 2000
            })
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, { entity: this.temp }, { advice: '修改' }, { reviewerId: this.temp.reviewerId })
          updateTenant(tempData.entity.id, tempData).then(() => {
            this.dialogFormVisible = false
            this.$router.push('/channel/tenants')
            this.getList()
            this.$message({
              type: 'success',
              message: '修改成功',
              duration: 2000
            })
          })
        }
      })
    },
    cut() {
      // this.paramsList.mode = 1^this.paramsList.mode
      Object.assign(this.paramsList, {
        mode: this.paramsList.mode,
        current: 1,
        pageSize: 10
      })
      if (this.paramsList.mode === 2) {
        this.getWorkOrderList()
      } else {
        this.getList()
      }
    },
    async getClusters() {
      const { data } = await getClusters()
      const clustersList = data.map(item => {
        const children = (item.clusters).map(i => {
          return { value: i.clusterNo, label: i.clusterName }
        })
        return {
          value: item.id,
          label: item.name,
          children: children,
          disabled: children.length === 0
        }
      })
      this.lstTable.find(i => i.param === 'clusterNo').options = clustersList
    },
    async getUsersList() {
      const { data } = await getAuditorsList()
      this.usersList = setMap(data)
      this.usersList = setArray(this.$store.state.user.userId, this.usersList)
    },
    async getDeployArea() {
      const { data } = await fetchDeployArea()
    },
    closeDialog() {
      if (this.$route.query.Id) {
        this.$router.push('/dashboard')
      } else {
        this.dialogFormVisible = false
      }
    }
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
::v-deep .el-divider--vertical {
  margin: 0;
}
</style>
