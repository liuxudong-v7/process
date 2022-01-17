<template>
  <div class="app-container">
    <el-card class="box-card">
      <search-form :form-list="formList" @submitForm="handleFilter" />
    </el-card>

    <el-card class="box-card" style="margin-top:15px;">
      <div class="filter-container" style="margin-top: 15px;display: flex;justify-content: flex-end;">
        <el-button v-permission="['create']" class="filter-item" size="small" type="primary" icon="el-icon-plus" @click="handleCreate">
          新 建
        </el-button>
      </div>
      <el-table
        v-loading="listLoading"
        :data="dataSource"
        style="width: 100%"
      >
        <el-table-column type="expand">
          <template #default="props">
            <el-table
              stripe
              border
              :data="props.row.fileList"
              style="width: 80%"
            >
              <el-table-column
                prop="certtype"
                :formatter="getCerttype"
                label="证书类别"
                width="100"
              />
              <el-table-column
                prop="authType"
                :formatter="getAuthType"
                label="认证方式"
                width="100"
              />
              <el-table-column
                prop="keytype"
                :formatter="getKeytype"
                label="密钥类别"
                width="100"
              />
              <el-table-column
                prop="fileName"
                label="文件名称"
                width="400"
              />
              <el-table-column
                prop="publishTime"
                label="发布时间"
                width="100"
              />
              <el-table-column
                prop="expireTime"
                label="到期时间"
                width="100"
              />
              <el-table-column
                prop="uploadTime"
                label="上传时间"
                width="180"
              />
              <el-table-column
                fixed="right"
                label="操作"
              >
                <template #default="scope">
                  <el-button type="text" size="small" @click="deleteFile(scope)">删除</el-button>
                  <el-button type="text" size="small" @click="handleExport(scope.row.id)">下载</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column
          label="部署网络"
          :formatter="getNetwork"
          width="150"
          prop="network"
        />
        <el-table-column
          label="主机地址"
          width="200"
          prop="host"
        />
        <el-table-column
          label="证书名称"
          width="250"
          prop="name"
        />
        <el-table-column
          label="证书域名"
          width="200"
          prop="domain"
        />
        <el-table-column
          label="登记人"
          prop="register"
          width="100"
        />
        <el-table-column
          label="创建时间"
          :formatter="dateFormat"
          prop="ctime"
          width="250"
        />
        <el-table-column
          label="时间戳"
          :formatter="dateFormat"
          prop="st"
          width="250"
        />
        <el-table-column
          fixed="right"
          label="操作"
          width="150"
        >
          <template #default="scope">
            <el-button type="text" size="small" @click="updateClick(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="deleteClick(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </el-card>

    <el-dialog top="50px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="1000px">
      <b>基本信息</b><br><br>
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-width="84px"
        style="width: 90%; margin-left:50px;"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item label="部署网络" prop="network">
              <el-select v-model="temp.network" placeholder="请选择">
                <el-option v-for="(item,index) in networkOptions" :key="index" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="证书域名" prop="domain">
              <el-input v-model="temp.domain" type="text" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="主机名称" prop="name">
              <el-input v-model="temp.name" type="text" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="主机地址" prop="host">
              <el-select v-model="temp.host" placeholder="请选择" @change="setHid">
                <el-option v-for="(item,index) in hId" :key="index" :label="item.host" :value="item.host" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="主机id">
              <el-input v-model="temp.hid" type="text" placeholder="请输入" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="登记人">
              <el-input v-model="temp.register" type="text" placeholder="请输入" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <b>证书管理</b><br><br>
      <el-form label-width="84px" style="width: 90%; margin-left:50px;">

        <el-row>
          <el-col :span="8">
            <el-form-item label="证书类别" prop="certtype">
              <el-select v-model="formFileItem.certtype" placeholder="证书类别">
                <el-option
                  v-for="(item,index) in certtypeOptions"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="认证方式" prop="authType">
              <el-select v-model="formFileItem.authType" placeholder="认证方式">
                <el-option
                  v-for="(item,index) in authTypeOptions"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="密钥类别" prop="keytype">
              <el-select v-model="formFileItem.keytype" placeholder="密钥类别">
                <el-option
                  v-for="(item,index) in keytypeOptions"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="文件名称" prop="fileName">
              <el-input v-model="formFileItem.fileName" disabled type="text" placeholder="请选择文件" />
              <el-upload
                class="upload-demo"
                :limit="1"
                action=""
                :on-change="fileHandleChange"
                :http-request="getFile"
                :file-list="fileList"
                :show-file-list="false"
              >
                <el-button size="small" type="text">选择文件</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="发布时间" prop="publishTime">
              <el-date-picker
                v-model="formFileItem.publishTime"
                style="width: 190px"
                type="date"
                placeholder="选择日期"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="到期时间" prop="expireTime">
              <el-date-picker
                v-model="formFileItem.expireTime"
                style="width: 190px"
                type="date"
                placeholder="选择日期"
              />
              <div style="float:right"><el-button size="medium" type="primary" @click="addFileList">增加</el-button></div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form><br>
      <b>证书列表</b><br><br>
      <el-table height="350" :data="formFileItemList">
        <el-table-column
          prop="certtype"
          label="证书类别"
          width="180"
        >
          <template slot-scope="scope">
            　　　　　　　　　　<span v-if="scope.row.certtype=== '0'">nginx</span>
            　　　　　　　　　　<span v-if="scope.row.certtype=== '1'">https</span>
            <span v-if="scope.row.certtype=== '2'">ftps</span>
          　　　　　　　　</template>
        </el-table-column>
        <el-table-column
          prop="authType"
          label="认证方式"
          width="150"
        >
          <template slot-scope="scope">
            　　　　　　　　　　<span v-if="scope.row.authType=== '0'">双向认证</span>
            　　　　　　　　　　<span v-if="scope.row.authType=== '1'">单向认证</span>
          　　　　　　　　</template>
        </el-table-column>
        <el-table-column
          prop="keytype"
          label="密钥类别"
          width="100"
        >
          <template slot-scope="scope">
            　　　　　　　　　　<span v-if="scope.row.keytype=== '0'">本地公钥</span>
            　　　　　　　　　　<span v-if="scope.row.keytype=== '1'">本地私钥</span>
            <span v-if="scope.row.keytype=== '2'">对方公钥</span>
          　　　　　　　　</template>
        </el-table-column>
        <el-table-column
          prop="fileName"
          label="文件名称"
          width="180"
        />
        <el-table-column
          prop="publishTime"
          label="发布时间"
          width="180"
        />
        <el-table-column
          prop="expireTime"
          label="到期时间"
          width="180"
        />
        <el-table-column
          fixed="right"
          width="100"
          label="操作"
        >
          <template #default="scope">
            <el-button type="text" size="small" @click="deleteTemp(scope)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="ifCreateUpda()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!--      详情-->
    <el-dialog title="详细信息" :visible.sync="detailed">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="租户编号：">
              {{ temp.tenantNo }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部署网络：">
              {{ temp.network }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="域名：">
              {{ temp.domain }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主机ID：">
              {{ temp.hid }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="对方地址：">
              {{ temp.remoteIp }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人：">
              {{ temp.contacter }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话：">
              {{ temp.telephone }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="登记人：">
              {{ temp.register }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建时间：">
              {{ temp.ctime }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="时间戳：">
              {{ temp.st }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文件：">
              {{ temp.certificateFile }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="18">
            <el-form-item label="备注：">
              {{ temp.remark }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="detailedif()">
          关闭
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {
  addChannelCertificate,
  deleteFlag,
  fetchChannelCertificateList,
  fetchNetId,
  fetchTenants,
  channelCertificateFile,
  updateChannelCertificate,
  getHid,
  deleteFile,
  downloadFile
} from '@/api/sys'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import FormTemplate from '@/components/FormTemplate'
import searchForm from '@/components/searchForm'
import { setMapValue } from '@/utils/service'
import moment from 'moment'

export default {
  name: 'User',
  components: { ReuseTable, Pagination, searchForm, FormTemplate },
  data() {
    return {
      fileMap: {
        publishTime: '',
        expireTime: '',
        certtype: '',
        file: ''
      },
      formFileItem: {
        certtype: '0',
        authType: '0',
        keytype: '0',
        uuid: '',
        type: '',
        fileName: '',
        publishTime: '',
        expireTime: ''
      },
      formFileItemList: [],
      certtypeOption: [{
        value: 'HTTPS',
        label: 'HTTPS'
      }, {
        value: 'SFTP',
        label: 'SFTP'
      }, {
        value: 'NGINX',
        label: 'NGINX'
      }],
      outerVisible: false,
      innerVisible: false,

      tableData: [],

      certificateTypeOption: [{
        value: 'CRT',
        label: 'CRT'
      }, {
        value: 'P12',
        label: 'P12'
      }, {
        value: 'JKS',
        label: 'JKS'
      }, {
        value: 'CER',
        label: 'CER'
      }, {
        value: 'DER',
        label: 'DER'
      }, {
        value: 'PFX',
        label: 'PFX'
      }, {
        value: 'PEM',
        label: 'PEM'
      }],
      formList: [
        {
          label: '部署网络', value: 'network', type: 'select', placeholder: '',
          defaultPorps: { value: 'code', label: 'text' },
          optionList: [
            { code: '', text: '全部' },
            { code: '0', text: '开发环境' },
            { code: '1', text: '测试环境' },
            { code: '2', text: '生产环境' }
          ]
        },
        { label: '主机地址', value: 'host', type: 'string', clearable: true, placeholder: '' },
        { label: '证书名称', value: 'name', type: 'string', clearable: true, placeholder: '' }
      ],
      certificateType: '',
      certificateName: '',
      envid: '',
      fileList: [],
      fileListVo: [],
      list: null,
      changeInput: false,
      listLoading: true,
      total: 1,
      temp: {
        id: '',
        network: '0',
        host: '',
        name: '',
        domain: '',
        hid: '',
        register: ''
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
        { label: '证书名称', param: 'name', align: 'left', editor: 'text' },
        { label: '证书域名', param: 'domain', align: 'left', editor: 'text', width: '300' },
        { label: '主机地址', param: 'host', align: 'left', editor: 'text', width: '120' },
        {
          label: '部署网络', param: 'network', align: 'left', width: '100',
          valueEnum: { '0': '开发环境', '1': '测试环境', '2': '生产环境' },
          editor: 'select',
          options: [
            { key: '0', value: '开发环境' },
            { key: '1', value: '测试环境' },
            { key: '2', value: '生产环境' }
          ]
        },
        { label: '创建时间', param: 'ctime', align: 'left', width: '120', valueType: 'date' },
        { label: '时间戳', param: 'st', align: 'left', width: '180', valueType: 'dateTime' }
      ],
      tableOption: {
        label: '操作', width: '280', fixed: 'right',
        options: [
          { type: 'text', label: '查看', methods: 'query' },
          { type: 'text', label: '修改', methods: 'update' },
          { type: 'text', label: '删除', methods: 'delete' },
          { type: 'text', label: '上传文件', methods: 'upload' }
        ]
      },
      textMap: {
        update: '编辑',
        create: '新建'
      },
      dialogFormVisible: false,
      detailed: false,
      dataForm: {},
      dialogStatus: '', // 创建or更新
      rules: {
        network: [{ required: true, message: '请输入部署网络！', trigger: 'blur' }],
        domain: [{ required: true, message: '请输入证书域名！', trigger: 'blur' }],
        name: [{ required: true, message: '请输入主机名称！', trigger: 'blur' }],
        host: [{ required: true, message: '请输入主机地址！', trigger: 'blur' }]
      },
      disabledOptions: ['否', '是'],
      networkOptions: [
        { value: '0', label: '开发环境' },
        { value: '1', label: '测试环境' },
        { value: '2', label: '生产环境' }
      ],
      certtypeOptions: [
        { value: '0', label: 'nginx' },
        { value: '1', label: 'https' },
        { value: '2', label: 'ftps' }
      ],
      authTypeOptions: [
        { value: '0', label: '双向认证' },
        { value: '1', label: '单向认证' }
      ],
      keytypeOptions: [
        { value: '0', label: '本地公钥' },
        { value: '1', label: '本地私钥' },
        { value: '2', label: '对方公钥' }
      ],
      paramsList: {
        current: 0,
        pageSize: 10,
        r: true,
        q: '',
        network: '',
        name: '',
        host: ''
      },
      tenantsList: null,
      uploadChanne: '',
      dialogForm: {
        envid: '',
        certificateType: '',
        certificateName: ''
      },
      channelId: '',
      hId: ''
    }
  },
  watch: {},
  created() {
    this.getNetId()
    // this.getTenants()
    this.getList()
    this.getHid()
  },
  methods: {
    getCerttype(row, column) {
      if (row.certtype === '0') {
        return 'nginx'
      } else if (row.certtype === '1') {
        return 'https'
      } else if (row.certtype === '2') {
        return 'ftps'
      } else {
        return '未知类型'
      }
    },
    getAuthType(row, column) {
      if (row.authType === '0') {
        return '双向认证'
      } else if (row.authType === '1') {
        return '单向认证'
      } else {
        return '未知类型'
      }
    },
    getKeytype(row, column) {
      if (row.keytype === '0') {
        return '本地公钥'
      } else if (row.keytype === '1') {
        return '本地私钥'
      } else if (row.keytype === '2') {
        return '对方公钥'
      } else {
        return '未知类型'
      }
    },
    getNetwork(row, column) {
      if (row.network === '0') {
        return '开发环境'
      } else if (row.network === '1') {
        return '测试环境'
      } else if (row.network === '2') {
        return '生产环境'
      } else {
        return '未知类型'
      }
    },
    deleteTemp(row) {
      this.$confirm('确定删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(action => {
        this.formFileItemList.splice(row.$index, 1)
        this.fileListVo.splice(row.$index, 1)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(err => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    updateClick(row) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.temp.id = row.id
      this.temp.network = row.network
      this.temp.host = row.host
      this.temp.hid = row.hid
      this.temp.register = row.register
      this.temp.name = row.name
      this.temp.domain = row.domain
      this.formFileItem.certtype = '0'
      this.formFileItem.authType = '0'
      this.formFileItem.keytype = '0'
      this.formFileItem.fileName = ''
      this.formFileItem.uuid = ''
      this.formFileItem.publishTime = ''
      this.formFileItem.expireTime = ''
      if (row.fileList !== 'null' && row.fileList !== '' && row.fileList !== null) {
        this.formFileItemList = row.fileList
      }
    },
    deleteClick(row) {
      this.$confirm('此操作将永久删除该条信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(action => {
        if (action === 'confirm') {
          updateChannelCertificate(row.id).then(() => {
            this.getList()
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

    downloadFile() {

    },
    deleteFile(item) {
      this.$confirm('此操作将永久删除该条信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(action => {
        deleteFile(item.row.id).then(res => {
          if (res.status === 0) {
            this.getList()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }
        }).catch(err => {
          console.log(err)
          this.listLoading = false
        })
      }).catch(err => {
        if (err === 'cancel') {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        }
      })
    },
    setHid(item) {
      for (var i = 0; i < this.hId.length; i++) {
        if (this.hId[i].host === item) {
          this.temp.hid = this.hId[i].id
          this.temp.register = this.hId[i].register
        }
      }
    },
    getHid() {
      getHid().then(res => {
        this.hId = res.data
      }).catch(err => {
        console.log(err)
      })
    },
    // 下载
    handleExport(id) {
      // downloadFile(id).then(res => {
      //
      // }).catch(err => {
      //   console.log(err)
      //   this.listLoading = false
      // })
      window.open('/uihost/channelCertificateFile/' + id)
    },
    detailedif() {
      this.detailed = false
    },
    reset() {
      this.envid = ''
      this.certificateType = ''
      this.certificateName = ''
    },
    dateFormat(row, column) {
      const date = row[column.property]
      if (date == undefined) {
        return ''
      }
      return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },
    formatDate(date, fmt) {
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      }
      const o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
      }
      for (var k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
          var str = o[k] + ''
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : this.padLeftZero(str))
        }
      }
      return fmt
    },

    padLeftZero(str) {
      return ('00' + str).substr(str.length)
    },
    getSTime(val) {
      var date = new Date(val)
      // this.temp.publishTime = this.formatDate(date, 'yyyy-MM-dd')
    },
    getFile(item) {
      // this.temp.fileName = item.file.name
      this.file = item.file
    },
    fileHandleChange(file, fileList) {
      this.fileList = fileList.slice(-1)
      this.formFileItem.fileName = this.fileList[0].name
    },
    addFileList() {
      if (this.formFileItem.fileName === '') {
        this.$message({
          type: 'bk',
          message: '上传文件不能为空'
        })
      } else {
        this.fileListVo.push(this.fileList[0])
        this.formFileItem.publishTime = this.formFileItem.publishTime !== '' ? this.deepClone(moment(this.formFileItem.publishTime).format('yyyy-MM-DD')) : ''
        this.formFileItem.expireTime = this.formFileItem.expireTime !== '' ? this.deepClone(moment(this.formFileItem.expireTime).format('yyyy-MM-DD')) : ''
        this.formFileItemList.push(this.deepClone(this.formFileItem))
        this.formFileItem.publishTime = ''
        this.formFileItem.expireTime = ''
        this.formFileItem.fileName = ''
        this.fileList = []
      }
    },
    deepClone(obj) {
      var _obj = JSON.stringify(obj)
      var objClone = JSON.parse(_obj)
      return objClone
    },
    handleChange(data) {
      this.temp[data.item.param] = data.value
    },
    handleButton(data) {
      this.temp = Object.assign({}, data.row)
      if (data.methods === 'update') {
        this.dialogStatus = 'update'
        // this.temp = data.row
        this.dialogFormVisible = true
      } else if (data.methods === 'delete') {
        this.deleteFlag()
      } else if (data.methods === 'upload') {
        // this.tableData = data.row.certificateFile
        // console.log(data.row.certificateFile)
        this.channelId = data.row.id
        this.outerVisible = true
      } else {
        // this.temp = data.row
        this.detailed = true
      }
    },
    handleFilter(dialogForm) {
      Object.assign(this.paramsList, dialogForm)
      this.paramsList.current = 1
      this.getList()
    },
    async getList() {
      this.listLoading = true
      await fetchChannelCertificateList(this.paramsList).then(res => {
        this.dataSource = res.data
        this.listLoading = false
        this.total = res.total
      }).catch(err => {
        console.log(err)
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = {
        network: '0',
        domain: '',
        host: this.hId[0].host,
        name: '',
        register: this.hId[0].register,
        hid: this.hId[0].id
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.formFileItemList = []
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    ifCreateUpda() {
      this.addcHannelCertificateFile()// 上传文件 在保存信息
    },
    addcHannelCertificateFile() {
      if (this.fileListVo.length !== 0) {
        const fd = new FormData()
        for (var i = 0; i < this.fileListVo.length; i++) {
          fd.append(this.fileListVo[i].name, this.fileListVo[i].raw)
        }
        channelCertificateFile(fd).then(res => {
          if (res.status === '0' || res.status === 0) {
            for (var i = 0; i < this.formFileItemList.length; i++) {
              this.formFileItemList[i].uuid = res.data[this.formFileItemList[i].fileName]
              this.formFileItemList[i].type = '3'
            }
            if (this.dialogStatus === 'create') {
              this.createData()// 上传文件 在保存信息
            } else {
              this.updateData() // 修改
            }
            this.$notify({
              title: '成功',
              message: '上传成功',
              type: 'success',
              duration: 2000
            })
          }
        }).catch(err => {
          console.log(err)
          this.listLoading = false
        })
      } else {
        if (this.formFileItemList !== '' && this.formFileItemList !== null) {
          if (this.dialogStatus === 'create') {
            this.createData()// 上传文件 在保存信息
          } else {
            this.updateData() // 修改
          }
        } else {
          this.$message.error('请选择一个文件')
        }
      }
    },
    createData() {
      var formVo = {
        hid: this.temp.hid,
        host: this.temp.host,
        network: this.temp.network,
        name: this.temp.name,
        domain: this.temp.domain,
        fileList: this.formFileItemList
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addChannelCertificate(formVo).then(res => {
            if (res.status === '0' || res.status === 0) {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: '新建成功',
                type: 'success',
                duration: 2000
              })
            }
          })
        }
      })
    },
    updateData() {
      var formVo = {
        id: this.temp.id,
        hid: this.temp.hid,
        host: this.temp.host,
        network: this.temp.network,
        name: this.temp.name,
        domain: this.temp.domain,
        fileList: this.formFileItemList
      }
      deleteFlag(formVo).then(() => {
        this.dialogFormVisible = false
        // const index = this.dataSource.findIndex((item, index) => item.id === this.temp.id)
        // this.dataSource.splice(index, 1, this.temp)
        this.getList()
        this.$notify({
          title: 'Success',
          message: '修改成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    deleteFlag() {
      this.$confirm('此操作将永久删除该条信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(action => {
        if (action === 'confirm') {
          const param = new FormData()
          // param.append('operateFlag', '0')
          param.append('temp', this.temp)
          deleteFlag('0', this.temp).then(() => {
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
    async getNetId() {
      const { data } = await fetchNetId()
    },
    async getTenants() {
      const { data } = await fetchTenants()
      const tenantNoList = data.map(item => {
        return { key: item.id, value: item.name }
      })
      this.columns.find(i => i.param === 'tenantNo').options = tenantNoList
      this.tenantsList = setMapValue(data)
    }
  }
}
</script>

<style scoped>

</style>
