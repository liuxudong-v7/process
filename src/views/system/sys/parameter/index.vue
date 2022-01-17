<template>
  <div class="app-container">
    <el-card class="box-card">
      <searchForm :form-list="formList" @submitForm="handleFilter" />
    </el-card>
    <el-card class="box-card" style="margin-top:15px;">
      <div class="filter-container" style="margin-top: 15px;display: flex;justify-content: flex-end;">
        <el-button v-permission="['create']" size="small" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
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

    <el-dialog title="字典条目" :visible.sync="dictEntryFormVisible" top="80px" :close-on-click-modal="false">
      <div style="height: 700px">
        <el-form
          ref="dictEntryForm"
          :model="temp"
          label-width="100px"
          :rules="dictEntryFormRules"
          class="demo-ruleForm"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item label="条目内容"><br>
                <el-table
                  height="350"
                  :data="dictEntryList"
                  size="small"
                  style="width: 100%"
                  highlight-current-row
                  @row-click="handleSelectionChange"
                >
                  <!--<el-table-column type="selection" align="center" width="55"/>-->
                  <el-table-column
                    prop="code"
                    label="参数取值"
                    width="160"
                    align="left"
                  >
                    <template slot-scope="scope">
                      <el-radio v-model="radioSelected" :label="scope.row.code" @change.native="handleSelectionChange(scope.row)" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="name"
                    label="参数名称"
                    width="200"
                  />
                  <el-table-column
                    prop="parentId"
                    label="上级条目"
                    :formatter="parentIdFormat"
                    width="160"
                  />
                  <el-table-column
                    prop="seqno"
                    label="排序序号"
                    width="80"
                  />
                  <el-table-column
                    prop="rank"
                    label="参数级别"
                    width="80"
                    align="center"
                  />
                  <!--
                                    <el-table-column
                                            fixed="right"
                                            width="100"
                                            label="操作">
                                        <template #default="scope">
                                            <el-button @click="deleteTemp(scope.row)" type="text" size="small">删除</el-button>
                                        </template>
                                    </el-table-column>
-->
                </el-table>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <el-form :inline="true" label-width="150px" :model="dictEntryForm">
          <el-row style="text-align: left">
            <el-col :span="12">
              <div v-if="dictEntryFormAddnewStatus">
                <el-form-item label="新增条目" label-width="100px" style="position: absolute; left: 10px" />
              </div>
              <div v-else>
                <el-form-item label="修改条目" label-width="100px" style="position: absolute; left: 10px" />
              </div>
            </el-col>
          </el-row>
          <br><br>
          <el-row style="text-align: left">
            <el-col :span="12">
              <el-form-item label="字典类型" prop="dictType">
                <el-input v-model="dictEntryForm.dictType" type="text" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="参数取值" prop="code">
                <el-input v-model="dictEntryForm.code" type="text" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="上级条目" prop="parentId">
                <Treeselect
                  v-model="dictEntryForm.parentId"
                  :options="dictEntryIdOptions"
                  :searchable="true"
                  placeholder="请选择"
                  style="width: 190px; height: 40px"
                  @input="onChangeParentId"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="参数名称" prop="name">
                <el-input v-model="dictEntryForm.name" type="text" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="参数级别" prop="rank">
                <el-input v-model="dictEntryForm.rank" type="text" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="排序序号" prop="seqno">
                <el-input v-model="dictEntryForm.seqno" type="text" />
              </el-form-item>
            </el-col>
            <!--
                        <el-col :span="12">
                            <el-form-item label="单位条线" prop="lineCode">
                              <el-select v-model="dictEntryForm.lineCode"
                                  multiple
                                  clearable
                                  filterable
                                  allow-create
                                  default-first-option
                                  style="width:190px"
                                  placeholder="请选择">
                                <el-option
                                  v-for="item in lineCodeOptions"
                                  :key="item.value"
                                  :label="item.label"
                                  :value="item.value">
                                </el-option>
                              </el-select>
                            </el-form-item>
                        </el-col>
-->
            <div style="position: absolute; top: 210px; left: 222px">
              <!--<el-button @click="addDictEntryList" type="primary">修改</el-button>-->
              <el-button type="primary" size="medium" :disabled="notRecordDisabled || !hasSelected" @click="dictEntryFormStatusChange">{{ this.dictEntryFormStateName }}</el-button>
              <el-button @click="saveDictEntry">保存</el-button>
              <el-button :disabled="notRecordDisabled || !hasSelected" @click="removeDictEntry">删除</el-button>
              <el-button @click="dictEntryFormVisible = false">关闭</el-button>
            </div>
          </el-row>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createDictType, updateDictType, deleteDictType, fetchDictTypeList } from '@/api/sys'
import { createDictEntry, updateDictEntry, deleteDictEntry, getDictEntryByDictType, getDictEntryTreeByDictType, getDictEntrysTree } from '@/api/sys'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import FormTemplate from '@/components/FormTemplate'
import searchForm from '@/components/searchForm'
import { setTreeData, setMapValue, setMap } from '@/utils/service'

export default {
  components: { ReuseTable, Pagination, Treeselect, FormTemplate, searchForm },
  data() {
    return {
      /** searchForm */
      formList: [
        { label: '字典类型', value: 'dictType', type: 'string', clearable: true, placeholder: '' },
        { label: '类型名称', value: 'typeName', type: 'string', clearable: true, placeholder: '' }
      ],
      /** searchForm */
      list: null,
      listLoading: true,
      total: 1,
      temp: {
        id: '',
        dictType: '',
        typeName: ''
      }, // 传输数据
      listQuery: {
        page: 1,
        limit: 10
      }, // 搜索条件
      dialog: {}, // 弹出框
      dataSource: [],
      columns: [
        { label: '字典类型', param: 'dictType', width: '500', align: 'left', editor: 'text' },
        { label: '类型名称', param: 'typeName', align: 'left', editor: 'text' }
      ],
      tableOption: {
        label: '操作', fixed: 'right',
        width: '160',
        options: [
          { type: 'text', label: '编辑', methods: 'update' },
          { type: 'text', label: '删除', methods: 'delete' },
          { type: 'text', label: '字典条目', methods: 'editDictEntry' }
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
        dictType: [{ required: true, message: '请输入字典类型！', trigger: 'blur' }],
        typeName: [{ required: true, message: '请输入类型名称！', trigger: 'blur' }]
      },
      paramsList: {
        current: 1,
        pageSize: 10,
        r: true,
        q: '',
        sorter: '',
        order: undefined,
        hasPerm: true
      },
      dictEntryFormVisible: false,
      dictEntryForm: {
        id: '',
        dictType: '',
        parentId: undefined,
        code: '',
        name: '',
        seqno: '',
        rank: 0,
        lineCode: '123'
      },
      lineCodeOptions: [
        { value: '123', label: '123' },
        { value: '456', label: '456' }
      ],
      dictEntryFormRules: {
        dictType: [{ required: true, message: '请输入字典类型！', trigger: 'blur' }],
        parentId: [{ required: false, message: '请选择上级条目', trigger: 'change' }]
      },
      notRecordDisabled: false,
      hasSelected: false,
      // 单选绑定
      radioSelected: null,
      // 表格选中row数据
      multipleSelection: {},
      dictEntryIdOptions: [],
      dictEntryIdList: null,
      dictEntryList: [],
      dictEntryFormAddnewStatus: true,
      dictEntryFormStateName: '修改'
    }
  },
  created() {
    this.getList()
  },
  methods: {
    selectBlur(e) {
      // 意见类型
      if (e.target.value !== '') {
        this.value = e.target.value + '(其他)'
        this.$forceUpdate() // 强制更新
      }
    },
    // 表格序号
    getIndex(index) {
      return (this.currentPage - 1) * this.pageSize + index + 1
    },
    // 点击行选中,绑定数据
    handleSelectionChange(row) {
      this.radioSelected = row.code // 选中行的name
      this.multipleSelection = row // 选中的一行数据
      this.hasSelected = true

      this.dictEntryFormAddnewStatus = false
      this.dictEntryFormStateName = '新增'
      if (row.parentId == null || row.parentId == '') {
        this.multipleSelection.parentId = undefined
      }
      const index = this.dictEntryList.findIndex((item, index) => item.code === row.code)
      if (index != -1) {
        this.dictEntryForm.id = this.dictEntryList[index].id
      }
      this.dictEntryForm.parentId = this.multipleSelection.parentId
      this.dictEntryForm.code = this.multipleSelection.code
      this.dictEntryForm.name = this.multipleSelection.name
      this.dictEntryForm.seqno = this.multipleSelection.seqno
      this.dictEntryForm.rank = this.multipleSelection.rank
    },
    dictEntryFormStatusChange() {
      this.dictEntryFormAddnewStatus = !this.dictEntryFormAddnewStatus
      if (this.dictEntryFormAddnewStatus) {
        this.resetDictEntryForm()
      } else {
        this.dictEntryFormStateName = '新增'
        if (this.hasSelected) {
          this.dictEntryForm.id = this.multipleSelection.id
          this.dictEntryForm.parentId = this.multipleSelection.parentId
          this.dictEntryForm.code = this.multipleSelection.code
          this.dictEntryForm.name = this.multipleSelection.name
          this.dictEntryForm.seqno = this.multipleSelection.seqno
          this.dictEntryForm.rank = this.multipleSelection.rank
        }
      }
    },
    parentIdFormat(row, column) {
      if (row.parentId) {
        var parentName = ''
        var parentId = parseInt(row.parentId)
        const index = this.dictEntryList.findIndex((item, index) => item.id === parentId)
        if (index != -1) {
          parentName = this.dictEntryList[index].name
        }
        return parentName
      }
    },
    onChangeParentId(value) {
      if (value != undefined) {
        const parentId = parseInt(value)
        const index = this.dictEntryList.findIndex((item, index) => item.id === parentId)
        console.log(index)
        if (index != -1) {
          this.dictEntryForm.rank = parseInt(this.dictEntryList[index].rank) + 1
        }
      } else {
        this.dictEntryForm.rank = 0
      }
    },
    handleFilter(dialogForm) {
      Object.assign(this.paramsList, dialogForm)
      this.listQuery.page = 1
      this.getList()
    },
    handleButton(data, type) {
      this.temp = Object.assign({}, data.row)
      if (data.methods === 'update') {
        this.columns[0].disabled = true
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.dictEntryFormVisible = false
        if (this.$refs['dataForm'] != null) {
          this.$refs['dataForm'].resetFields()
        }
      } else if (data.methods === 'editDictEntry') {
        this.dialogFormVisible = false
        this.dictEntryFormVisible = true
        this.dictEntryForm = {
          dictType: data.row.dictType,
          rank: 0
        }
        this.initDictEntrys(data.row.dictType)
        this.refreshDictEntryTree(data.row.dictType)
      } else {
        this.openMessage()
      }
    },
    initDictEntrys(dictType) {
      this.listLoading = true
      getDictEntryByDictType(dictType).then(res => {
        this.dictEntryIdList = setMapValue(res.data)
        this.dictEntryList = res.data
        this.resetDictEntryForm()

        if (res.data && res.data.length > 0) {
          this.notRecordDisabled = false
        } else {
          this.notRecordDisabled = true
        }
        this.radioSelected = null
        this.hasSelected = false
        this.multipleSelection = {}
        this.listLoading = false
      }).catch(err => {
        console.log(err)
        this.listLoading = false
      })
    },
    refreshDictEntryTree(dictTye) {
      this.listLoading = true
      getDictEntryTreeByDictType(dictTye).then(res => {
        if (!res.data) return
        res.data.forEach(item => {
          item.label = item.name
        })
        if (res.data.length > 0) {
          this.dictEntryIdOptions = setTreeData(res.data)
        } else {
          this.dictEntryIdOptions = []
        }
        this.listLoading = false
      }).catch(err => {
        console.log(err)
        this.listLoading = false
      })
    },
    async getList() {
      this.listLoading = true
      this.paramsList.current = this.listQuery.page
      this.paramsList.pageSize = this.listQuery.limit
      this.paramsList.q = ''
      await fetchDictTypeList(this.paramsList).then(res => {
        if (!res.data) return
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
        id: '',
        dictType: '',
        typeName: ''
      }
    },
    resetDictEntryForm() {
      this.dictEntryForm = {
        id: '',
        dictType: this.dictEntryForm.dictType,
        parentId: undefined,
        code: '',
        name: '',
        seqno: '',
        rank: 0
      }
      this.dictEntryFormAddnewStatus = true
      this.dictEntryFormStateName = '修改'
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
          createDictType(this.temp).then(res => {
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
          updateDictType(tempData.id, tempData).then(() => {
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
          deleteDictType(this.temp.id).then(() => {
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
    },
    deleteTemp(row) {
      const index = this.dictEntryList.findIndex((item, index) => item.code === row.code)
      if (index != -1) {
        console.log(this.dictEntryList[index])
      }
      for (var i = 0; i < this.dictEntryList.length; i++) {
        if (this.dictEntryList[i] === row) {
          const id = this.dictEntryList[i].id
          const dictType = this.dictEntryForm.dictType
          deleteDictEntry(id).then(res => {
            this.initDictEntrys(dictType)
            this.$notify({
              title: 'Success',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
          })
          this.dictEntryList.splice(i, 1)
        }
      }
    },
    addDictEntryList() {
      if (this.dictEntryForm.code === '') {
        this.$message.error('参数取值不能为空')
        return
      }
      if (this.dictEntryForm.name === '') {
        this.$message.error('参数名称不能为空')
        return
      }
      if (this.dictEntryForm.seqno === '') {
        this.$message.error('排序序号不能为空')
        return
      }
      this.dictEntryList.push(JSON.parse(JSON.stringify(this.dictEntryForm)))
      this.dictEntryForm.code = ''
      this.dictEntryForm.name = ''
      this.dictEntryForm.seqno = ''
      this.dictEntryForm.rank = 0
      if (this.dictEntryIdOptions.length > 0) {
        this.dictEntryForm.parentId = this.dictEntryIdOptions[0].id
      } else {
        this.dictEntryForm.parentId = undefined
      }
    },
    saveDictEntry() {
      if (this.dictEntryForm.code === '') {
        this.$message.error('参数取值不能为空')
        return
      }
      if (this.dictEntryForm.name === '') {
        this.$message.error('参数名称不能为空')
        return
      }
      if (this.dictEntryForm.seqno === '') {
        this.$message.error('排序序号不能为空')
        return
      }
      if (this.dictEntryFormAddnewStatus) {
        createDictEntry(this.dictEntryForm).then(res => {
          this.initDictEntrys(this.dictEntryForm.dictType)
          this.$notify({
            title: 'Success',
            message: '新建成功',
            type: 'success',
            duration: 2000
          })
        })
      } else {
        updateDictEntry(this.dictEntryForm.id, this.dictEntryForm).then(res => {
          this.initDictEntrys(this.dictEntryForm.dictType)
          this.$notify({
            title: 'Success',
            message: '修改成功',
            type: 'success',
            duration: 2000
          })
        })
      }
    },
    removeDictEntry() {
      if (!this.dictEntryForm.id) {
        this.$message.error('请选中要删除记录')
        return
      }
      const id = this.dictEntryForm.id
      const index = this.dictEntryList.findIndex((item, index) => parseInt(item.parentId) === id)
      if (index != -1) {
        this.$message.error('存在下级条目的记录不能被删除')
        return
      }
      this.$confirm('此操作将永久删除选中记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(action => {
        if (action === 'confirm') {
          deleteDictEntry(this.dictEntryForm.id).then(res => {
            this.initDictEntrys(this.dictEntryForm.dictType)
            this.$notify({
              title: 'Success',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    saveDictEntryTable() {
      if (this.dictEntryList) {
        // const tempData = Object.assign({}, {rank:this.temp.rank}, this.dictEntryList)
        saveDictEntry(this.dictEntryList).then(() => {
          this.dialogFormVisible = false
          this.getList()
          this.$notify({
            title: '成功',
            message: '保存成功',
            type: 'success',
            duration: 2000
          })
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  ::v-deep .el-divider--vertical {
      margin: 0;
  }
</style>
