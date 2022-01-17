<template>
  <div class="app-container">
    <div v-if="mode == 0">
      <el-card class="box-card">
        <searchForm :form-list="formList" @submitForm="handleFilter" />
      </el-card>
      <el-card class="box-card" style="margin-top:15px;position: relative;">
        <div class="cutTable">
          <el-button type="primary" size="small" @click="toDispose"><i class="el-icon-printer" /> 物料导出</el-button>
        </div>
        <reuse-table
          v-loading="listLoading"
          :data-source="dataSource"
          :columns="lstTable"
          :table-option="optionList"
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
    </div>
    <div v-if="mode == 1">
      <el-card class="box-card">
        <el-steps :active="active" align-center>
          <el-step title="租户信息" icon="el-icon-s-custom" />
          <el-step title="集群信息" icon="el-icon-s-grid" />
          <el-step title="环境信息" icon="el-icon-eleme" />
          <el-step title="证书信息" icon="el-icon-s-ticket" />
          <el-step title="底座信息" icon="el-icon-s-operation" />
        </el-steps>
      </el-card>
      <el-card class="box-card" style="margin-top:15px;height:680px;position: relative;">
        <div v-show="active == 1">
          <reuse-table
            ref="multipleTable"
            v-loading="listLoading"
            tooltip-effect="dark"
            :data-source="dataSourceTenant"
            :columns="lstTableTen"
            :table-height="tableHeight"
            @handleSelectionChange="handleSelectionChange"
          >
            <template slot="selectionTenant">
              <el-table-column
                type="selection"
                width="55"
              />
            </template>
          </reuse-table>
          <div class="card-footer">
            <el-button type="primary" size="medium" @click="handoff">返回</el-button>
            <el-button type="primary" size="medium" @click="tenantNext">下一步</el-button>
          </div>
        </div>
        <div v-show="active == 2">
          <reuse-table
            v-loading="listLoading"
            :data-source="dataSourceCluster"
            :columns="clustersTable"
            :table-height="tableHeight"
            @handleSelectionChange="handleSelectionChangeClu"
          >
            <template slot="selectionCluster">
              <el-table-column
                type="selection"
                width="55"
              />
            </template>
          </reuse-table>
          <div class="card-footer">
            <el-button type="primary" size="medium" @click="Prev">返回</el-button>
            <el-button type="primary" size="medium" @click="clusterNext">下一步</el-button>
          </div>
        </div>
        <div v-show="active == 3">
          <reuse-table
            v-loading="listLoading"
            :data-source="dataSourceTenantEnv"
            :columns="TenantEnvTable"
            :table-height="tableHeight"
            @handleSelectionChange="handleSelectionChangeEnv"
          >
            <template slot="selectionEnv">
              <el-table-column
                type="selection"
                width="55"
              />
            </template>
          </reuse-table>
          <div class="card-footer">
            <el-button type="primary" size="medium" @click="Prev">返回</el-button>
            <el-button type="primary" size="medium" @click="envNext">下一步</el-button>
          </div>
        </div>
        <div v-show="active == 4">
          <reuse-table
            v-loading="listLoading"
            :data-source="dataSourceCert"
            :columns="CertTable"
            :table-height="tableHeight"
            @handleSelectionChange="handleSelectionChangeCert"
          >
            <template slot="selectionCert">
              <el-table-column
                type="selection"
                width="55"
              />
            </template>
          </reuse-table>
          <div class="card-footer">
            <el-button type="primary" size="medium" @click="Prev">返回</el-button>
            <el-button type="primary" size="medium" @click="certNext">下一步</el-button>
          </div>
        </div>
        <div v-show="active == 5">
          <reuse-table
            v-loading="listLoading"
            :data-source="dataSourceOsgi"
            :columns="osgiTable"
            :table-height="tableHeight"
            @handleSelectionChange="handleSelectionChangeOsgi"
          >
            <template slot="selectionOsgi">
              <el-table-column
                type="selection"
                width="55"
              />
            </template>
          </reuse-table>
          <div class="card-footer">
            <el-button type="primary" size="medium" @click="Prev">返回</el-button>
            <el-button type="primary" size="medium" @click="osgiNext">提交</el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { fetchMaterialExports, fetchTenantListAll, osgiExports, fetchClusterListAll, fetchTabtenantListAll, fetchOsgiListAll, fetchCertListAll } from '@/api/sys'
import searchForm from '@/components/searchForm'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
export default {
  components: {
    searchForm,
    ReuseTable,
    Pagination
  },
  data() {
    return {
      mode: 0,
      active: 1,
      listLoading: false,
      dataSource: [],
      dataSourceTenant: [],
      dataSourceCluster: [],
      dataSourceTenantEnv: [],
      dataSourceOsgi: [],
      dataSourceCert: [],
      lstTable: [
        { label: '批次号', param: 'batch', align: 'center', editor: 'text' },
        { label: '导出日期', param: 'exportDate', align: 'center', valueType: 'date' },
        { label: '模块名称', param: 'module', align: 'center', editor: 'text' },
        { label: '导出人', param: 'register', align: 'center', editor: 'text' },
        { label: '时间戳', param: 'st', align: 'center', sortable: true, valueType: 'dateTime' }
      ],
      lstTableTen: [
        { label: '租户名称', param: 'name', align: 'left', editor: 'text' },
        { label: '租户描述', param: 'tenantDsc', align: 'left', editor: 'text' },
        { label: '部署区域', param: 'deployArea', align: 'center', editor: 'select',
          valueEnum: { 0: '标准区', 1: '集团域', 2: '建行域', 3: '子公司' },
          options: [
            { key: '0', value: '标准区' },
            { key: '1', value: '集团域' },
            { key: '2', value: '建行域' },
            { key: '3', value: '子公司' }
          ] },
        { label: '集群编号', param: 'clusterNo', align: 'center', editor: 'cascader', options: [] },
        { label: '集群名称', param: 'clusterName', align: 'center', editor: 'text', showForm: false },
        { label: '租户编号', param: 'tenantNo', align: 'left', editor: 'text', showForm: false },
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
        { label: '登记人', param: 'register', align: 'center', editor: 'text', showForm: false },
        { label: '时间戳', param: 'st', align: 'center', sortable: true, width: 160, valueType: 'dateTime', showForm: false }
      ],
      clustersTable: [
        { label: '集群编号', param: 'clusterNo', align: 'center', editor: 'text' },
        { label: '集群名称', param: 'clusterName', align: 'center', editor: 'text' },
        { label: '登记人', param: 'register', align: 'center', editor: 'text', showForm: false },
        { label: '时间戳', param: 'st', align: 'center', sortable: true, valueType: 'dateTime', showForm: false }
      ],
      TenantEnvTable: [
        { label: '物理子系统id', param: 'envid', align: 'center', editor: 'text' },
        { label: '物理子系统名称', param: 'name', align: 'center', editor: 'text' },
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
        { label: '登记人', param: 'register', align: 'center', editor: 'text', showForm: false },
        { label: '备注', param: 'remark', align: 'left', editor: 'textare' },
        { label: '时间戳', param: 'st', align: 'center', sortable: true, valueType: 'dateTime', showForm: false }
      ],
      osgiTable: [
        { label: '底座名称', param: 'name', align: 'left', editor: 'text' },
        { label: '集群编号', param: 'clusterNo', align: 'left', editor: 'cascader', options: [] },
        { label: '集群名称', param: 'clusterName', align: 'left', editor: 'text' },
        { label: '上线时间', param: 'publishTime', align: 'left', editor: 'date' },
        { label: '审核状态', param: 'checked', align: 'left', valueEnum: { 0: '未审核', 1: '已审核' }, editor: 'select', showForm: false,
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
        { label: '申请人', param: 'applicant', align: 'left', editor: 'text' },
        { label: '登记人', param: 'register', align: 'left', editor: 'text', showForm: false },
        { label: '时间戳', param: 'st', align: 'left', sortable: true, valueType: 'dateTime', showForm: false }
      ],
      CertTable: [
        { label: '证书名称', param: 'name', align: 'center', editor: 'text' },
        { label: '本地域名', param: 'domain', align: 'center', editor: 'text' },
        { label: '主机ID', param: 'hid', align: 'center', editor: 'text' },
        { label: '登记人', param: 'register', align: 'center', editor: 'text', showForm: false },
        { label: '时间戳', param: 'st', align: 'center', sortable: true, valueType: 'dateTime' }
      ],
      total: 1,
      paramsList: {
        current: 0,
        pageSize: 10,
        r: true,
        q: '',
        sorter: '',
        order: undefined
      },
      tenantIds: [],
      clusterIds: [],
      envIds: [],
      certificateIds: [],
      osgiIds: [],
      packSelect: ['1', '2'],
      formList: [
        { label: '批次号', value: 'batch', type: 'string', clearable: true, placeholder: '' }
      ],
      optionList: {},
      tableHeight: (document.documentElement.clientHeight) * 0.6
    }
  },
  created() {
    this.active = 1
    this.getList()
  },
  methods: {
    handleSelectionChange(val) {
      this.tenantIds = []
      val.map(item => {
        this.tenantIds.push(item.id)
      })
      console.log(this.tenantIds)
    },
    handleSelectionChangeClu(val) {
      this.clusterIds = []
      val.map(item => {
        this.clusterIds.push(item.id)
      })
      console.log(this.clusterIds)
    },
    handleSelectionChangeEnv(val) {
      this.envIds = []
      val.map(item => {
        this.envIds.push(item.id)
      })
      console.log(this.envIds)
    },
    handleSelectionChangeCert(val) {
      this.certificateIds = []
      val.map(item => {
        this.certificateIds.push(item.id)
      })
      console.log(this.certificateIds)
    },
    handleSelectionChangeOsgi(val) {
      this.osgiIds = []
      val.map(item => {
        this.osgiIds.push(item.id)
      })
      console.log(this.osgiIds)
    },
    async fetchTenantListAll() {
      this.listLoading = true
      const { data } = await fetchTenantListAll()
      this.dataSourceTenant = data
      console.log(this.$refs.multipleTable)
      this.listLoading = false
    },
    async fetchClusterListAll() {
      this.listLoading = true
      const { data } = await fetchClusterListAll()
      this.dataSourceCluster = data
      this.listLoading = false
    },
    async fetchTabtenantListAll() {
      this.listLoading = true
      const { data } = await fetchTabtenantListAll()
      this.dataSourceTenantEnv = data
      this.listLoading = false
    },
    async fetchCertListAll() {
      this.listLoading = true
      const { data } = await fetchCertListAll()
      this.dataSourceCert = data
      this.listLoading = false
    },
    async fetchOsgiListAll() {
      this.listLoading = true
      const { data } = await fetchOsgiListAll()
      this.dataSourceOsgi = data
      this.listLoading = false
    },
    getLits() {
      this.fetchTenantListAll()
    },
    tenantNext() {
      // if (this.tenantIds.length) {
      if (this.active++ > 5) this.active = 1
      // } else {
      //   this.$message({
      //     type: 'warning',
      //     message: '请选择您要导出的租户信息'
      //   })
      // }
    },
    Prev() {
      if (this.active-- < 0) this.active = 1
      // if (this.tenantIds) {
      //   this.tenantIds.forEach(id => {
      //     // this.$refs.multipleTable.toggleRowSelection(row)
      //     const index = this.dataSourceTenant.findIndex((item, index) => item.id === id)
      //     console.log(this.dataSourceTenant[index])
      //     // this.$refs.multipleTable.toggleRowSelection(this.dataSourceTenant[index], true)
      //   })
      // }
    },
    clusterNext() {
      // if (this.clusterIds.length) {
      //   console.log(this.clusterIds)
        if (this.active++ > 5) this.active = 1
      // } else {
      //   this.$message({
      //     type: 'warning',
      //     message: '请选择您要导出的集群信息'
      //   })
      // }
    },
    envNext() {
      // if (this.envIds.length) {
      //   console.log(this.envIds)
        if (this.active++ > 5) this.active = 1
      // } else {
      //   this.$message({
      //     type: 'warning',
      //     message: '请选择您要导出的环境信息'
      //   })
      // }
    },
    certNext() {
      // if (this.certificateIds.length) {
      //   console.log(this.certificateIds)
        if (this.active++ > 5) this.active = 1
      // } else {
      //   this.$message({
      //     type: 'warning',
      //     message: '请选择您要导出的证书信息'
      //   })
      // }
    },
    osgiNext() {
      // if (this.osgiIds.length) {
        console.log(this.osgiIds)
        osgiExports({ 'tenantIds': this.tenantIds,
          'clusterIds': this.clusterIds,
          'envIds': this.envIds,
          'certificateIds': this.certificateIds,
          'osgiIds': this.osgiIds,
          'packSelect': this.packSelect
        }).then(res => {
          const { data } = res
          window.location.href = `/uihost/osgiExport/${data}`
          this.getList()
          this.mode = 0
          this.$message({
            type: 'success',
            message: '物料导出成功',
            duration: 3000
          })
        })
      // } else {
      //   this.$message({
      //     type: 'warning',
      //     message: '请选择您要导出的底座信息'
      //   })
      // }
    },
    handleFilter(dialogForm) {
      Object.assign(this.paramsList, dialogForm)
      this.paramsList.current = 1
      this.getList()
    },
    handleButton(data) {
      console.log(data)
    },
    getList() {
      this.listLoading = true
      fetchMaterialExports(this.paramsList).then(res => {
        if (!res.data) return
        this.total = res.total
        this.dataSource = res.data
        this.listLoading = false
      })
    },
    toDispose() {
      this.mode = 1
      this.fetchTenantListAll()
      this.fetchClusterListAll()
      this.fetchTabtenantListAll()
      this.fetchCertListAll()
      this.fetchOsgiListAll()
      this.active = 1
      this.tenantIds = this.clusterIds = this.envIds = this.certificateIds = this.certificateIds = this.osgiIds = []
    },
    handoff() {
      this.getList()
      this.mode = 0
    }
  }
}
</script>

<style scoped lang="scss">
.card-footer{
  display: inline-block;
  position: absolute;
  right: 16px;
  bottom: 25px;
}
.cutTable {
  display: flex;
  justify-content: flex-end;
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
