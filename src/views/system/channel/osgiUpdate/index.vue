<template>
  <div class="app-container">
    <div v-if="auditIf == '0'">
      <el-card class="box-card">
        <searchForm :form-list="formList" @submitForm="handleFilter" />
      </el-card>
      <el-card class="box-card" style="margin-top:15px;">
        <!-- <div class="cutTable">
          <span>{{ paramsList.mode?'业务待办':'业务浏览' }}
            <el-tooltip class="item" effect="dark" :content="paramsList.mode?'切换到浏览模式':'切换到待办模式'" placement="right">
              <i class="el-icon-document-copy" @click="cut" />
            </el-tooltip>
          </span>
          <el-button v-if="!paramsList.mode" v-permission="['create']" type="primary" size="small" @click="handleCreate"><i class="el-icon-plus" /> 新 建</el-button>
        </div> -->
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
              <el-button v-permission="['create']" size="small" style="position: absolute; left: 94%;" type="primary" @click="handleCreate"><i class="el-icon-plus" /> 新 建</el-button>
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
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" @close="closeDialog">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="84px" style="width: 90%; margin-left:25px;">
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
          <div class="createPost-main-container">
            <form-template
              v-for="item in lstTable"
              :key="item.param"
              :temp="item"
              :value="temp[item.param]"
              @input="handleChange"
            />
            <el-form-item label="报告文件" prop="reportFile">
              <ul v-if="dialogStatus =='detail'||dialogStatus =='update'">
                <li
                  v-for="item in rptFiles"
                  :key="item.id"
                ><span @click="downLoad(item.id)">{{ item.fileName }}</span>
                  ({{ item.size }}, checksum:
                  <ul v-if="isFileType(item.fileName)" class="fileClick" @click="fileClickOut">
                    <li v-for="(each, index) in checksumListJar" :key="index">
                      <span :fileId="item.id"> {{ each }}</span>
                      <div v-show="index < checksumListJar.length - 1" style="display: inline-block;"> <el-divider direction="vertical" /></div>
                    </li>
                  </ul>
                  <ul v-else class="fileClick" @click="fileClickOut">
                    <li v-for="(each, index) in checksumList" :key="index">
                      <span :fileId="item.id"> {{ each }}</span>
                      <div v-show="index < checksumList.length - 1" style="display: inline-block;"> <el-divider direction="vertical" /></div>
                    </li>
                  </ul>)
                  <!-- <el-button style="margin-left:10px;" size="mini" type="primary" @click="preViewFile(item.id)">预览 </el-button> -->
                  <el-button v-if="!isFileType(item.fileName)" style="margin-left:10px;" size="mini" type="primary" @click="preViewFileT(item.id)">预览</el-button>
                  <el-upload
                    v-if="dialogStatus =='update'&& temp.c4 == 'update'"
                    ref="upload"
                    class="upload-demo"
                    style="margin-left: 10px;display: inline-block;"
                    action=""
                    :show-file-list="false"
                    :on-remove="UphandleRemove"
                    :before-upload="beforeUpload"
                    :limit="1"
                    :file-list="UpfileList"
                  >
                    <el-button size="mini" type="warning" @click="replaceFile(item.id)">替换</el-button>
                  </el-upload>
                  <br>
                </li>
              </ul>
              <upload-file v-if="dialogStatus !=='detail'&&replaceStatus" :action="reportAction" :file-type="fileRpt" :limit="5" :file-list="fileList" @handleSuccess="handleSuccess" @handleRemove="handleRemove" />
            </el-form-item>

            <el-form-item label="升级文件" prop="osgiFile">
              <ul v-if="dialogStatus =='detail'||dialogStatus =='update'&&!osgiStatus">
                <li
                  v-for="item in osgiFiles"
                  :key="item.id"
                ><span @click="downLoad(item.id)">{{ item.fileName }}</span>
                  ({{ item.size }}, checksum:
                  <ul v-if="isFileType(item.fileName)" class="fileClick" @click="fileClickOut">
                    <li v-for="(each, index) in checksumListJar" :key="index">
                      <span :fileId="item.id"> {{ each }}</span>
                      <div v-show="index < checksumListJar.length - 1" style="display: inline-block;"> <el-divider direction="vertical" /></div>
                    </li>
                  </ul>
                  <ul v-else class="fileClick" @click="fileClickOut">
                    <li v-for="(each, index) in checksumList" :key="index">
                      <span :fileId="item.id"> {{ each }}</span>
                      <div v-show="index < checksumList.length - 1" style="display: inline-block;"> <el-divider direction="vertical" /></div>
                    </li>
                  </ul>)
                  <el-upload
                    v-if="dialogStatus =='update'&& temp.c4 == 'update'"
                    ref="upload"
                    class="upload-demo"
                    style="margin-left: 10px;display: inline-block;"
                    action=""
                    :show-file-list="false"
                    :on-remove="UphandleRemove"
                    :before-upload="beforeUpload"
                    :limit="1"
                    :file-list="UpfileList"
                  >
                    <el-button size="mini" type="warning" @click="replaceFile(item.id)">替换</el-button>
                  </el-upload>
                  <br>
                </li>
              </ul>
              <upload-file v-if="dialogStatus !=='detail'&&osgiStatus" :action="osgiAction" :file-type="fileOsgi" :limit="5" :file-list="fileList" @handleSuccess="handleSuccess" @handleRemove="handleRemove" />
            </el-form-item>
            <el-form-item label="插件文件" prop="pluginFile">
              <ul v-if="dialogStatus =='detail'||dialogStatus =='update'&&!osgiStatus">
                <li
                  v-for="item in pluginFiles"
                  :key="item.id"
                ><span @click="downLoad(item.id)">{{ item.fileName }}</span>
                  ({{ item.size }}, checksum:
                  <ul class="fileClick" @click="fileClickOut">
                    <li v-for="(each, index) in checksumListJar" :key="index">
                      <span :fileId="item.id"> {{ each }}</span>
                      <div v-show="index < checksumListJar.length - 1" style="display: inline-block;"> <el-divider direction="vertical" /></div>
                    </li>
                  </ul>)
                  <el-upload
                    v-if="dialogStatus =='update'&& temp.c4 == 'update'"
                    ref="upload"
                    class="upload-demo"
                    style="margin-left: 10px;display: inline-block;"
                    action=""
                    :show-file-list="false"
                    :on-remove="UphandleRemove"
                    :before-upload="beforeUpload"
                    :limit="1"
                    :file-list="UpfileList"
                  >
                    <el-button size="mini" type="warning" @click="replaceFile(item.id)">替换</el-button>
                  </el-upload>
                </li>
              </ul>
              <upload-file v-if="dialogStatus !=='detail'&&osgiStatus" :action="pluginAction" :file-type="filePlugin" :limit="1" :file-list="fileList" @handleSuccess="handleSuccess" @handleRemove="handleRemove" />
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
      <el-dialog title="文件预览" width="75%" top="50px" :fullscreen="dialogFull" :visible.sync="dialogTableVisible" :close-on-click-modal="false" :append-to-body="true">
        <span slot="title" style="float: right;position: relative; right: 25px; top: 1px" class="dialog-footer">
          <i class="el-icon-full-screen" @click="maxIf" />
        </span>
        <embed :src="pdfUrl" style="width: 100%; height: 600px">
      </el-dialog>
    </div>
    <audit v-if="auditIf == '1'" :audit-id="auditId" :action="auditAction" :users-list="usersList" @fatherMethod="fatherMethod" />
  </div>
</template>

<script>
import {
  fetchOsgiUpdateList,
  createOsgiUpdate,
  updateOsgiUpdate,
  deleteOsgiUpdate,
  getClusters,
  getAuditorsList,
  getWorkOrderList,
  getworkOrderRecall,
  uploadOsgiFile
} from '@/api/sys'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import FormTemplate from '@/components/FormTemplate'
import searchForm from '@/components/searchForm'
import UploadFile from '@/components/UploadFile'
import Audit from './audit'
import { setMap, setArray } from '@/utils/service'
export default {
  components: { ReuseTable, Pagination, FormTemplate, searchForm, UploadFile, Audit },
  data() {
    return {
      rptFilesId: '',
      routerIf: false,
      activeTab: 'ywdb',
      dialogVisible: false,
      row: '',
      textarea: '',
      detailDialogFormVisible: false,
      taskProcessList: [],
      formList: [
        { label: '底座名称', value: 'name', type: 'string', clearable: true, placeholder: '' },
        { label: '申请人', value: 'applicant', type: 'string', clearable: true, placeholder: '' }
      ],
      dialogFull: false,
      list: null,
      listLoading: false,
      total: 1,
      temp: {
        reviewerId: '',
        name: '',
        applicant: '',
        clusterNo: '',
        publishTime: '',
        rptFile: null,
        osgiFile: null,
        checked: null,
        pluginFile: null
      },
      listQuery: {
        page: 1,
        limit: 20
      }, // 搜索条件
      dialog: {}, // 弹出框
      dataSource: [],
      workOrder: [
        { label: '租户编号', param: 'tenantNo', align: 'left', editor: 'text', showForm: false },
        { label: '租户名称', param: 'name', align: 'left', editor: 'text' },
        { label: '当前审核人', param: 'currentName', align: 'left', editor: 'text' },
        { label: '审核状态', param: 'checked', align: 'center',
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
      columns: [
        { label: '底座名称', param: 'name', align: 'left', editor: 'text', width: 160 },
        { label: '集群编号', param: 'clusterNo', align: 'left', width: 160, editor: 'cascader', options: [] },
        { label: '集群名称', param: 'clusterName', align: 'left', editor: 'text', width: 160, showForm: false },

        { label: '上线时间', param: 'publishTime', align: 'left', editor: 'date', width: 120 },
        { label: '审核状态', param: 'checked', align: 'left', width: 120, valueEnum: { 0: '未审核', 1: '已审核' }, editor: 'select', showForm: false,
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
        {
          label: '报告文件名',
          param: 'rptFile',
          align: 'left',
          width: 160,
          showForm: false,
          render: (h, params) => {
            const rptFile = JSON.parse(params.row.rptFile)
            return (
              rptFile.map(item => {
                return h(
                  'span',
                  item.fileName
                )
              })
            )
          }
        },
        {
          label: '升级文件名',
          param: 'osgiFile',
          align: 'left',
          width: 160,
          showForm: false,
          render: (h, params) => {
            const osgiFile = JSON.parse(params.row.osgiFile)
            return (
              osgiFile.map(item => {
                return h(
                  'span',
                  item.fileName
                )
              })
            )
          }
        },
        {
          label: '插件文件名',
          param: 'pluginFile',
          align: 'left',
          width: 160,
          showForm: false,
          render: (h, params) => {
            const pluginFile = JSON.parse(params.row.pluginFile)
            return (
              pluginFile.map(item => {
                return h(
                  'span',
                  item.fileName
                )
              })
            )
          }
        },
        { label: '申请人', param: 'applicant', align: 'left', editor: 'text', width: 120 },
        { label: '登记人', param: 'register', align: 'left', width: 120, editor: 'text', showForm: false },
        { label: '创建时间', param: 'ctime', align: 'left', width: 160, valueType: 'dateTime', showForm: false },
        { label: '时间戳', param: 'st', align: 'left', sortable: true, width: 160, valueType: 'dateTime', showForm: false }
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
        { type: 'text', label: '详情', methods: 'query' },
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
        name: [{ required: true, message: '请输入底座名称！', trigger: 'blur' }],
        clusterNo: [{ required: true, message: '请选择集群编号', trigger: 'change' }]
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
      reportAction: '/uihost/upLoadOsgiFile?type=1', // uihost
      osgiAction: '/uihost/upLoadOsgiFile?type=2',
      pluginAction: '/uihost/upLoadOsgiFile?type=4',
      replaceStatus: true,
      osgiStatus: true,
      // preViewUrl: '',
      // osgiPreViewUrl: '',
      fileRpt: 'rpt',
      fileOsgi: 'osgi',
      filePlugin: 'plugin',
      rptFiles: [],
      osgiFiles: [],
      pluginFiles: [],
      filesId: {
        rptFilesId: [],
        osgiFilesId: [],
        pluginFilesId: []
      },
      fileList: [],
      auditIf: 0,
      auditAction: '',
      auditId: '',
      checksumList: ['SHA-1', 'SHA-256', 'SHA-512', 'MD5'],
      checksumListJar: ['RSA'],
      dialogTableVisible: false,
      pdfUrl: '',
      lstTable: [],
      usersList: [],
      UpfileList: []
    }
  },
  created() {
    this.lstTable = this.columns
    this.getUsersList()
    this.getClusters()
    if (this.$route.query.Id) {
      this.routerIf = true
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
    maxIf() {
      if (this.dialogFull) {
        this.dialogFull = false
      } else {
        this.dialogFull = true
      }
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
        module: '3',
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
        module: '3'
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
    fatherMethod() {
      this.auditIf = '0'
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
      this.rptFiles = JSON.parse(this.temp.rptFile)
      this.osgiFiles = JSON.parse(this.temp.osgiFile)
      this.pluginFiles = JSON.parse(this.temp.pluginFile)
      if (data.methods === 'update') {
        this.dialogStatus = 'update'
        this.replaceStatus = false
        this.osgiStatus = false
        this.dialogFormVisible = true
      } else if (data.methods === 'check') {
        this.auditIf = 1
        this.auditAction = 'check'
        this.auditId = data.row.id
      } else if (data.methods === 'revoke') {
        const { checked } = data.row
        if (checked) {
          this.$message({
            type: 'warning',
            message: '该底座信息已审核，不能进行此操作！'
          })
        } else {
          this.auditIf = 1
          this.auditAction = 'revoke'
          this.auditId = data.row.id
        }
      } else if (data.methods === 'query') {
        console.log(data)
        this.temp = Object.assign({}, data.row)
        this.rptFiles = JSON.parse(this.temp.rptFile)
        this.osgiFiles = JSON.parse(this.temp.osgiFile)
        this.dialogStatus = 'detail'
        this.dialogFormVisible = true
        this.replaceStatus = false
        this.osgiStatus = false
      }
    },
    resetTemp() {
      this.temp = {
        reviewerId: '',
        name: '',
        applicant: '',
        clusterNo: '',
        publishTime: '',
        rptFile: null,
        osgiFile: null,
        pluginFile: null
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.fileList = []
      this.dialogFormVisible = true
      this.replaceStatus = true
      this.osgiStatus = true
      this.filesId['rptFilesId'] = []
      this.filesId['osgiFilesId'] = []
      this.filesId['pluginFilesId'] = []
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async getList() {
      this.listLoading = true
      await fetchOsgiUpdateList(this.paramsList).then(res => {
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
          this.rptFiles = JSON.parse(this.temp.rptFile)
          this.osgiFiles = JSON.parse(this.temp.osgiFile)
          this.dialogStatus = 'update'
          this.replaceStatus = false
          this.osgiStatus = false
          this.dialogFormVisible = true
        }
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
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp['rptFile'] = this.filesId['rptFilesId'].toString()
          this.temp['osgiFile'] = this.filesId['osgiFilesId'].toString()
          this.temp['pluginFile'] = this.filesId['pluginFilesId'].toString()
          const tempData = Object.assign({}, { entity: this.temp }, { reviewerId: this.temp.reviewerId })
          if (this.temp['rptFile'] && this.temp['osgiFile']) {
            createOsgiUpdate(tempData).then(res => {
              this.dialogFormVisible = false
              this.filesId['rptFilesId'] = []
              this.filesId['osgiFilesId'] = []
              this.filesId['pluginFilesId'] = []
              this.getList()
              this.$message({
                type: 'success',
                message: '新建成功',
                duration: 2000
              })
            })
          } else {
            this.$message.warning('请选上传报关文件和升级文件！')
          }
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.filesId['rptFilesId'].length) {
            this.temp['rptFile'] = JSON.stringify(this.filesId['rptFilesId'])
          } else {
            this.rptFiles.map(item => {
              this.filesId['rptFilesId'].push(item.id)
            })
            this.temp['rptFile'] = JSON.stringify(this.filesId['rptFilesId'])
          }
          if (this.filesId['osgiFilesId'].length) {
            this.temp['osgiFile'] = JSON.stringify(this.filesId['osgiFilesId'])
          } else {
            this.osgiFiles.map(item => {
              this.filesId['osgiFilesId'].push(item.id)
            })
            this.temp['osgiFile'] = JSON.stringify(this.filesId['osgiFilesId'])
          }
          if (this.filesId['pluginFilesId'].length) {
            this.temp['osgiFile'] = JSON.stringify(this.filesId['pluginFilesId'])
          } else {
            this.osgiFiles.map(item => {
              this.filesId['pluginFilesId'].push(item.id)
            })
            this.temp['pluginFile'] = JSON.stringify(this.filesId['pluginFilesId'])
          }
          const tempData = Object.assign({}, { entity: this.temp }, { advice: '修改' }, { reviewerId: this.temp.reviewerId })
          updateOsgiUpdate(tempData.entity.id, tempData).then(() => {
            this.dialogFormVisible = false
            this.$router.push('/channel/osgi')
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
    cut() {
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
    handleSuccess(data) {
      this.filesId[`${data.fileType}FilesId`].push(data.res['data'])
      this.$message({
        message: '文件上传成功',
        type: 'success'
      })
    },
    handleRemove(data) {
      if (data.file.response) {
        const fileId = data.file.response['data']
        this.filesId[`${data.fileType}FilesId`].splice((this.filesId[`${data.fileType}FilesId`].findIndex((item) => {
          return item === fileId
        })), 1)
      }
    },
    downLoad(id) {
      window.location.href = `/uihost/downLoadOsgiFile/${id}`
    },
    // preViewFile(id) {
    //   // this.preViewUrl = `/uihost/downLoadOsgiFile/${id}?openType=inline`
    //   this.dialogTableVisible = true
    //   this.pdfUrl = `/uihost/downLoadOsgiFile/${id}?openType=inline`
    // },
    preViewFileT(id) {
      this.dialogFull = false
      this.pdfUrl = `/uihost/osgiFile/preview/${id}`
      setTimeout(() => { // 设置延迟执行
        this.dialogTableVisible = true
      }, 100)
    },
    // osgiPreViewFile(id) {
    //   this.dialogTableVisible = true
    //   this.pdfUrl = `/uihost/downLoadOsgiFile/${id}?openType=inline`
    //   // this.osgiPreViewUrl = `/uihost/downLoadOsgiFile/${id}?openType=inline`
    // },
    replaceFile(id) {
      this.rptFilesId = id
    },
    repeal() {
      this.$confirm('此操作将撤销该条信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(action => {
        if (action === 'confirm') {
          deleteOsgiUpdate(this.temp.id, { advice: '撤销' }).then(() => {
            this.getList()
            this.$message({
              type: 'success',
              message: '撤销成功!',
              duration: 2000
            })
          })
        }
      }).catch(err => {
        if (err === 'cancel') {
          this.$message({
            type: 'info',
            message: '已取消撤销'
          })
        }
      })
    },
    fileClickOut(e) {
      console.log(e)
      const fileId = e.target.getAttribute('fileId')
      const method = e.target.innerHTML.trim()
      window.location.href = `/uihost/osgiFile/${fileId}/fileCheck?method=${method}`
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
    closeDialog() {
      if (this.$route.query.Id) {
        this.$router.push('/dashboard')
      } else {
        this.dialogFormVisible = false
      }
    },
    UphandleRemove(file, fileList) {
      console.log(file, fileList)
    },
    async beforeUpload(file) {
      const fd = new FormData()
      fd.append('file', file)
      await uploadOsgiFile(this.rptFilesId, fd).then(res => {
        if (res.status === 0) {
          // this.rptFiles.splice((this.rptFiles.findIndex((item, index) => {
          //   return item.id === this.rptFilesId
          // })), 1)
          // this.filesId['rptFilesId'] = []
          // this.rptFiles.map(item => {
          //   this.filesId['rptFilesId'].push(item.id)
          // })
          this.$message({
            type: 'success',
            message: '文件替换成功'
          })
          this.$refs.upload.abort()
        } else {
          this.$message({
            type: 'error',
            message: '上传文件失败，请重试'
          })
        }
      })
      return false
    },
    isFileType(fileName) {
      const fix = fileName.substr(fileName.lastIndexOf('.'))
      if (fix.toLowerCase() === '.jar') return true
      return false
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
.el-form-item__content ul{
  margin: auto;
  padding: unset;
  list-style: none;
  span{
    color: rgb(0, 140, 255);
    cursor: pointer;
  }
  span:hover{
    color: #0000ff;
    text-decoration:underline;
  }

 ::v-deep .fileClick{
   display:inline-flex;
  }
}
</style>
