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
            <div class="cutTable">
              <el-button v-if="!paramsList.mode" v-permission="['create']" style="position: absolute; left: 94%;" type="primary" size="small" @click="handleCreate"><i class="el-icon-plus" /> 新 建</el-button>
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
          <el-tab-pane label="我的工单">
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
        title="撤回原因"
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
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" @close="closeDialog" width="1000px">
        <el-steps :active="pageData" finish-status="success" align-center>
          <el-step title="基本信息" />
          <el-step v-for="vo in categoryList" :key="vo" :title="vo" />
        </el-steps><br><br>
        <!-- 基本信息-->
        <div v-if="pageData === 0">
          <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="85px" style="width: 70%; margin-left:50px;">
            <div class="createPost-main-container" style="height: 550px">
              <el-form-item label="主审人">
                <el-select v-model="temp.reviewerId" placeholder="请选择" style="width: 100%;" size="small" :disabled="dialogStatus!='create'">
                  <el-option
                    v-for="item in usersList"
                    :key="item.id"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <form-template
                v-for="item in lstTable"
                :key="item.param"
                :temp="item"
                :value="temp[item.param]"
                @input="handleChange"
              />

              <el-form-item label="文件" prop="reportFile">
                <el-upload
                  class="upload-demo"
                  ref="upload"
                  :action="reportAction"
                  :file-list="fileList"
                  :auto-upload="false"
                  :on-success="onSuccess"
                  :on-error="onError"
                >
                  <template #trigger>
                    <el-button size="small" type="primary">选取文件</el-button>
                  </template>
                  <el-button
                    style="margin-left: 10px;"
                    size="small"
                    type="success"
                    @click="beforeUpload"
                  >上传到服务器</el-button
                  >
                </el-upload>
              </el-form-item>

            </div>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button type="primary" size="medium" @click="next">下一步</el-button>
          </div>
        </div>
        <!-- 基本信息结束-->
        <!-- XQTPL模板-->
        <div v-for="(vo, index) in templateList" :key="index+'c'">
          <div v-if="pageData == index + 1">
            <el-form label-width="120px" class="demo-ruleForm">
              <div style="height: 550px">
                <el-scrollbar style="height: 520px;">
                  <div v-for="(property,indexs) in JSON.parse(vo.property)" :key="indexs+'b'">
                    <el-col v-if="property.type == 'String'" :span="12">
                      <el-form-item :label="property.labelName" prop="name">
                        <el-input v-model="xqtpl[property.fieldName]" placeholder="请输入内容" />
                      </el-form-item>
                    </el-col>

                    <el-col v-if="property.type == 'date' && property.remarks == 'YYYY-MM-DD'" :span="12">
                      <el-form-item :label="property.labelName" prop="name">
                        <el-date-picker
                          v-model="xqtpl[property.fieldName]"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="选择日期"
                        />
                      </el-form-item>
                    </el-col>

                    <el-col v-if="property.type == 'date' && property.remarks == 'YYYY-MM-DD HH:mm:ss'" :span="12">
                      <el-form-item :label="property.labelName" prop="name">
                        <el-date-picker
                          v-model="xqtpl[property.fieldName]"
                          type="datetime"
                          value-format="yyyy-MM-dd HH:mm:ss"
                          placeholder="选择日期时间"
                        />
                      </el-form-item>
                    </el-col>

                    <el-col v-if="property.type == 'number'" :span="12">
                      <el-form-item :label="property.labelName" prop="name">
                        <el-input v-model="xqtpl[property.fieldName]" placeholder="请输入数值" oninput="value=value.replace(/^\.+|[^\d.]/g,'')" @input="xqtpl[property.fieldName]= checkNumberFloat(xqtpl[property.fieldName],property)" />
                      </el-form-item>
                    </el-col>

                    <el-col v-if="property.type == 'money'" :span="12">
                      <el-form-item :label="property.labelName" prop="name">
                        <el-input v-model="xqtpl[property.fieldName]" placeholder="请输入金额" oninput="value=value.replace(/^\.+|[^\d.]/g,'')" @input="xqtpl[property.fieldName]= checkMoney(xqtpl[property.fieldName])" />
                      </el-form-item>
                    </el-col>

                    <el-col v-if="property.type == 'combo'" :span="12">
                      <el-form-item :label="property.labelName" prop="name">
                        <el-select v-model="xqtpl[property.fieldName]" placeholder="请选择">
                          <el-option
                            v-for="item in JSON.parse(property.remarks)"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>

                    <el-col v-if="property.type == 'memo'" :span="12">
                      <el-form-item :label="property.labelName" prop="name">
                        <el-input v-model="xqtpl[property.fieldName]" type="textarea" placeholder="请输入备注" />
                      </el-form-item>
                    </el-col>
                  </div>
                </el-scrollbar>
              </div>
            </el-form>

            <div slot="footer" class="dialog-footer">
              <el-button v-if="pageData !== 0" size="medium" @click="previous">上一步</el-button>
              <el-button v-if="pageData !== templateList.length" type="primary" size="medium" :data-index="index" @click="nextAndAdd(index)">下一步</el-button>
              <el-button v-if="dialogStatus!=='detail' && pageData == templateList.length" type="primary" size="medium" @click="dialogStatus==='create'?createData():updateData()">
                提交
              </el-button>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
    <audit v-if="auditIf == '1'" :audit-id="auditId" :action="auditAction" :users-list="usersList" @fatherMethod="fatherMethod" />
  </div>
</template>

<script>
import {
  createTabtenant,
  updaTabtenant,
  fetchTabtenantList,
  queryTemplate,
  getAuditorsList,
  getworkOrderRecall,
  getWorkOrderList,
  uploadOsgiFile
} from '@/api/sys'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import FormTemplate from '@/components/FormTemplate'
import searchForm from '@/components/searchForm'
import Audit from './audit'
import { setMap, setArray } from '@/utils/service'
const checkUrl = (rule, value, callback) => {
  if (value) {
    const reg = /^1[3456789]\d{9}$/
    if (reg.test(value)) {
      callback()
    } else {
      callback(new Error('格式错误，请重新填写！'))
    }
  } else {
    callback(new Error('请输入'))
  }
}

const checkIdCard = (rule, value, callback) => {
  if (value) {
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (reg.test(value)) {
      callback()
    } else {
      callback(new Error('格式错误，请重新填写！'))
    }
  }
}

export default {
  components: { ReuseTable, Pagination, FormTemplate, searchForm, Audit },
  data() {
    const pickerOptions = { // 限制激活时间不让选择今天以前的
      disabledDate(time) {
        return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
      }
    }
    return {
      reportAction: '/uihost/uploadTenantEnvFile?type=5',
      fileList: [],
      pageData: 0,
      xqtpl: {},
      kytpl: [],
      activeTab: 'ywdb',
      dialogVisible: false,
      row: '',
      textarea: '',
      detailDialogFormVisible: false,
      taskProcessList: [],

      /** searchForm */
      formList: [
        { label: '系统标识', value: 'envid', type: 'string', clearable: true, placeholder: '' },
        { label: '系统名称', value: 'name', type: 'string', clearable: true, placeholder: '' },
        { label: '审核状态', value: 'checked', type: 'select', placeholder: '',
          defaultPorps: { value: 'code', label: 'text' },
          optionList: [{ code: '', text: '全部' }, { code: '1', text: '成功' }, { code: '0', text: '失败' }] }
      ],
      /** searchForm */
      list: null,
      listLoading: true,
      total: 1,
      temp: {
        filename: '',
        reviewerId: '',
        name: '',
        envid: '',
        remark: null,
        tplData: {},
        feasibilityStudy: ''
      }, // 传输数据
      listQuery: {
        page: 1,
        limit: 20
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
        { label: '系统标识', param: 'envid', align: 'center', editor: 'text' },
        { label: '系统名称', param: 'name', align: 'center', editor: 'text' },
        { label: '审核状态', param: 'checked', align: 'center', valueEnum: { 0: '未审核', 1: '已审核' }, editor: 'select', showForm: false,
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
        // { label: '备注', param: 'remark', align: 'center', editor: 'textare' }
        { label: '登记人', param: 'register', align: 'center', editor: 'text', showForm: false },
        { label: '备注', param: 'remark', align: 'left', editor: 'textare' },
        { label: '创建时间', param: 'ctime', align: 'center', valueType: 'date', showForm: false },
        { label: '时间戳', param: 'st', align: 'center', sortable: true, valueType: 'dateTime', width: 160, showForm: false }
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
        envid: [{ required: true, message: 'type is required', trigger: 'change' }],
        name: [{ required: true, message: 'type is required', trigger: 'change' }]
      },
      tenantMap: [],
      paramsList: {
        current: 1,
        pageSize: 20,
        r: true,
        q: '',
        sorter: '',
        order: undefined,
        mode: 1
      },
      auditAction: '',
      auditId: '',
      templateList: '',
      usersList: [],
      categoryList: []
    }
  },
  created() {
    this.lstTable = this.columns
    this.getUsersList()
    this.getTemplateList()
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
    onSuccess(response, file, fileList) {
      console.log(response.data)
      if(this.temp.filename === '') {
        this.temp.filename = response.data[0]
      } else {
        this.temp.filename = this.temp.filename + ',' + response.data[0]
      }
      console.log(this.temp.filename)
      this.$message({
        message: '文件上传成功',
        type: 'success'
      })
    },
    onError() {
      this.$message({
        message: '文件上传失败',
        type: 'error'
      })
    },
    beforeUpload() {
      this.$refs.upload.submit()
    },
    checkNumberFloat(value, property) {
      // 去掉数字和.以外的内容
      value = value.replace(/[^\d.]/g, '')
      // 不允许.开头
      value = value.replace(/^\./g, '')
      // 去掉连续的.
      value = value.replace(/\.{2,}/g, '.')
      // 只允许一个点，第一个会匹配到第一个点，第二个会匹配到剩余的点
      // 因为是输入框，最多会呈现到‘1.23.’这种方式
      // 注意第一个点是字符串方式匹配，第二个是正则匹配
      value = value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
      // 两位小数，‘\.(\d\d)’匹配到两位数
      var remarks = Number(property.remarks)
      var xq = new RegExp('^(\\-)*(\\d+)\\.(\\d{0,' + remarks + '}).*$')
      value = value.replace(eval(xq), '$1$2.$3')
      return value
    },
    checkMoney(value) {
      // 去掉数字和.以外的内容
      value = value.replace(/[^\d.]/g, '')
      // 不允许.开头
      value = value.replace(/^\./g, '')
      // 去掉连续的.
      value = value.replace(/\.{2,}/g, '.')
      // 只允许一个点，第一个会匹配到第一个点，第二个会匹配到剩余的点
      // 因为是输入框，最多会呈现到‘1.23.’这种方式
      // 注意第一个点是字符串方式匹配，第二个是正则匹配
      value = value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
      // 两位小数，‘\.(\d\d)’匹配到两位数
      value = value.replace(/^(\-)*(\d+)\.(\d{0,2}).*$/, '$1$2.$3')
      return value
    },

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
        module: '2',
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
    async getWorkOrderList() {
      this.listLoading = true
      var list = {
        current: this.paramsList.current,
        pageSize: this.paramsList.pageSize,
        module: '2'
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
    nextAndAdd(index) {
      if (this.pageData === 0) {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            if (this.pageData++ > this.templateList.length) this.pageData = 0
          }
        })
      } else {
        if (this.pageData++ > this.templateList.length) this.pageData = 0
      }
    },
    next() {
      if (this.pageData === 0) {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.pageData++
            if (this.pageData > this.templateList.length) {
              this.pageData = 0
            }
          }
        })
      } else {
        this.pageData++
        if (this.pageData > this.templateList.length) {
          this.pageData = 0
        }
      }
    },
    previous() {
      if (this.pageData-- > this.templateList.length) this.pageData = 0
    },
    getTemplateList() {
      this.paramsList.current = this.listQuery.page
      this.paramsList.pageSize = this.listQuery.limit
      this.paramsList.q = ''
      queryTemplate(this.paramsList).then(res => {
        var data = res.data
        this.templateList = data
        console.log(this.templateList)
        this.category = []
        for (var l = 0; l < data.length; l++) {
          this.categoryList.push(data[l].name)
        }
        console.log(this.categoryList)
      })
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

    fatherMethod() {
      this.auditIf = '0'
      this.getList()
    },
    handleFilter(dialogForm) {
      Object.assign(this.paramsList, dialogForm)
      this.paramsList.current = 1
      this.getList()
    },
    handleButton(data) {
      this.pageData = 0
      this.temp = Object.assign({}, data.row)
      if (data.row.tplData !== null) {
        this.xqtpl = JSON.parse(data.row.tplData)
      } else {
        this.xqtpl = {}
      }
      // var xqtpl = this.temp.demand
      // if (xqtpl != null) {
      //   xqtpl = JSON.parse(xqtpl)
      //   for (var i = 0; i < xqtpl.length; i++) {
      //     if (i === 0) {
      //       this.xqtpl = xqtpl[0]
      //     } else {
      //       this.xqtpl = JSON.parse((JSON.stringify(this.xqtpl) + JSON.stringify(xqtpl[i])).replace(/}{/, ','))
      //     }
      //   }
      // }
      // var kytpl = this.temp.feasibilityStudy
      // kytpl = JSON.parse(kytpl)
      // if (kytpl != null) {
      //   for (var m = 0; m < kytpl.length; m++) {
      //     if (m === 0) {
      //       this.kytpl = kytpl[0]
      //     } else {
      //       this.kytpl = JSON.parse((JSON.stringify(this.kytpl) + JSON.stringify(kytpl[m])).replace(/}{/, ','))
      //     }
      //   }
      // }

      if (data.methods === 'update') {
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
      } else if (data.methods === 'check') {
        // this.$router.push({
        //   path: 'tenantEnvAudit',
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
        this.dialogFormVisible = true
      }
    },
    // detailView(data) {
    //   this.temp = Object.assign({}, data)
    //   this.dialogStatus = 'detail'
    //   this.dialogFormVisible = true
    // },
    async getList() {
      this.listLoading = true
      await fetchTabtenantList(this.paramsList).then(res => {
        if (!res.data) return
        res.data.forEach(item => {
          item.label = item.name
        })

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
          console.log(this.temp)
          this.dialogStatus = 'update'
          this.dialogFormVisible = true
        }
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
        filename: '',
        reviewerId: '',
        name: '',
        envid: '',
        remark: null
      }
    },
    handleCreate() {
      this.xqtpl = {}
      this.kytpl = []
      this.resetTemp()
      this.dialogStatus = 'create'
      this.pageData = 0
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      // var li = []
      // for (var i = 0; i < this.kytpl.length; i++) {
      //   var x = {}
      //   x[this.kytpl[i].value] = this.kytpl[this.kytpl[i].value]
      //   li.push(x)
      // }
      // this.temp.feasibilityStudy = JSON.stringify(li)

      // var lix = this.xqtpl
      // for (var ix = 0; ix < this.xqtpl.length; ix++) {
      //   var xx = {}
      //   xx[this.xqtpl[ix].value] = this.xqtpl[this.xqtpl[ix].value]
      //   lix.push(xx)
      // }
      // this.temp.demand = JSON.stringify(lix)
      this.temp.tplData = JSON.stringify(this.xqtpl)

      this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
      const tempData = Object.assign({}, { entity: this.temp }, { reviewerId: this.temp.reviewerId })
      createTabtenant(tempData).then(res => {
        this.dialogFormVisible = false
        this.getList()
        this.$message({
          type: 'success',
          message: '新建成功',
          duration: 2000
        })
      }).catch(() => {
        this.dialogFormVisible = false
      })
    },
    updateData() {
      // var li = []
      // for (var i = 0; i < this.kytpl.length; i++) {
      //   var x = {}
      //   x[this.kytpl[i].value] = this.kytpl[this.kytpl[i].value]
      //   li.push(x)
      // }
      // this.temp.feasibilityStudy = JSON.stringify(li)
      //
      // var lix = []
      // for (var ix = 0; ix < this.xqtpl.length; ix++) {
      //   var xx = {}
      //   xx[this.xqtpl[ix].value] = this.xqtpl[this.xqtpl[ix].value]
      //   lix.push(xx)
      // }
      this.temp.tplData = JSON.stringify(this.xqtpl)
      const tempData = Object.assign({}, { entity: this.temp }, { advice: '修改' }, { reviewerId: this.temp.reviewerId })
      updaTabtenant(tempData.entity.id, tempData).then(() => {
        this.dialogFormVisible = false
        this.$router.push('/channel/tenantEnv')
        this.getList()
        this.$message({
          type: 'success',
          message: '修改成功',
          duration: 2000
        })
      }).catch(() => {
        this.dialogFormVisible = false
      })
    },
    async getUsersList() {
      const { data } = await getAuditorsList()
      this.usersList = setMap(data)
      this.usersList = setArray(this.$store.state.user.userId, this.usersList)
    },
    cut() {
      // this.paramsList.mode = 1^this.paramsList.mode
      Object.assign(this.paramsList, {
        mode: this.paramsList.mode,
        current: 1,
        pageSize: 20
      })
      if (this.paramsList.mode === 2) {
        this.getWorkOrderList()
      } else {
        this.getList()
      }
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
<style>
  .el-scrollbar__wrap{overflow-x: hidden;}
</style>
