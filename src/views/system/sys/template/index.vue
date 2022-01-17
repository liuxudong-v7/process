<template>
  <div class="app-container">
    <div class="filter-container" style="margin-top: 15px;display: flex;justify-content: flex-end;">
      <el-input v-model="paramsList.q" placeholder="" style="width: 300px;" class="input-with-select" @keyup.enter.native="handleFilter">
        <el-button slot="append" icon="el-icon-search" @click="handleFilter" />
      </el-input>
      <el-button v-permission="['create']" size="small" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        新 建
      </el-button>
    </div>
    <el-table
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column
        type="index"
        width="50"
      />
      <el-table-column
        prop="name"
        label="模板名称"
      />
      <el-table-column
        prop="category"
        label="模板类型"
        width="150"
      />
      <el-table-column
        prop="tplDsc"
        label="模板描述"
      />
      <el-table-column
        prop="st"
        :formatter="dateFormat"
        label="时间"
      />
      <el-table-column
        fixed="right"
        label="操作"
        width="200"
      >
        <template #default="scope">
          <el-button type="text" size="small" @click="handleClick(scope.row)">查看</el-button>
          <el-button type="text" size="small" @click="updeClick(scope.row)">编辑</el-button>
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

    <el-dialog :title="titleName" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px" class="demo-ruleForm">
        <el-row>
          <el-col :span="12">
            <div v-if="titleName != '详情'">
              <el-form-item label="模板名称" prop="name">
                <el-input v-model="ruleForm.name" />
              </el-form-item>
            </div>
            <div v-if="titleName == '详情'">
              <el-form-item label="模板名称">
                {{ ruleForm.name }}
              </el-form-item>
            </div>
          </el-col>
          <el-col :span="12">
            <div v-if="titleName != '详情'">
              <el-form-item label="模板类型" prop="category">
                <el-input v-model="ruleForm.category" />
              </el-form-item>
            </div>
            <div v-if="titleName == '详情'">
              <el-form-item label="模板类型">
                {{ ruleForm.category }}
              </el-form-item>
            </div>
          </el-col>
          <el-col :span="12">
            <div v-if="titleName != '详情'">
              <el-form-item label="模板描述" prop="tplDsc">
                <el-input v-model="ruleForm.tplDsc" />
              </el-form-item>
            </div>
            <div v-if="titleName == '详情'">
              <el-form-item label="模板描述">
                {{ ruleForm.tplDsc }}
              </el-form-item>
            </div>
          </el-col>
          <el-col :span="12">
            <div v-if="titleName != '详情'">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="ruleForm.remark" />
              </el-form-item>
            </div>
            <div v-if="titleName == '详情'">
              <el-form-item label="备注">
                {{ ruleForm.remark }}
              </el-form-item>
            </div>
          </el-col>
          <el-col :span="24">
            <el-form-item label="模板内容"><br>
              <el-form v-if="titleName != '详情'" :inline="true" :model="formInline" class="demo-form-inline">
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="标签名称">
                      <el-input v-model="formInline.labelName" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="字段名称">
                      <el-input v-model="formInline.fieldName" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="标签类型">
                      <el-select v-model="formInline.type" placeholder="请选择" @change="getType">
                        <el-option
                          v-for="item in typeOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="标签备注">
                      <el-input v-if="remarksIf == 'String'" v-model="formInline.remarks" placeholder="请输入备注" />
                      <el-input v-if="remarksIf == 'number'" v-model="formInline.remarks" oninput="value=value.replace(/^\.+|[^\d.]/g,'')" placeholder="输入保留小数位数" />
                      <el-input v-if="remarksIf == 'money'" v-model="formInline.remarks" placeholder="请输入备注" />
                      <el-select v-if="remarksIf == 'date'" v-model="formInline.remarks" placeholder="请选择日期类型">
                        <el-option
                          v-for="item in dateOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </el-select>

                      <el-select v-if="remarksIf == 'combo'" v-model="formInline.remarks" placeholder="点击查看以添加列表">
                        <el-option
                          v-for="item in comboOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </el-select>

                      <el-input v-if="remarksIf == 'memo'" v-model="formInline.remarks" placeholder="请输入备注" />
                    </el-form-item>
                  </el-col>
                  <el-col v-if="remarksIf == 'combo'" :span="12">
                    <el-form-item v-if="remarksIf == 'combo'" label="列表code">
                      <el-input v-model="comboCode" placeholder="请输入code" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item v-if="remarksIf == 'combo'" label="列表名称">
                      <el-input v-model="comboName" placeholder="请输入名称" /><br>
                    </el-form-item>
                    <el-button v-if="remarksIf == 'combo'" type="primary" @click="setCombo">添加至备注</el-button>
                  </el-col>
                  <el-button type="primary" @click="addTemplateList">增加</el-button>
                </el-row>
              </el-form>
              <el-table height="350" :data="templateList" >
                <el-table-column
                  prop="labelName"
                  label="标签名称"
                  width="180"
                />
                <el-table-column
                  prop="fieldName"
                  label="字段名称"
                  width="150"
                />
                <el-table-column
                  prop="type"
                  label="标签类型"
                  width="100"
                />
                <el-table-column
                  prop="remarks"
                  label="标签备注"
                  width="180"
                />
                <el-table-column
                  v-if="titleName != '详情'"
                  fixed="right"
                  width="100"
                  label="操作"
                >
                  <template #default="scope">
                    <el-button type="text" size="small" @click="deleteTemp(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="titleName==='新增'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import Sortable from 'sortablejs'
import Pagination from '@/components/Pagination'
import { addTemplate, getTemplates, deleteTemplate, updateTemplate } from '@/api/sys'
export default {
  components: { Pagination },
  data() {
    return {
      remarksIf: '',
      comboCode: '',
      comboName: '',
      comboOptions: [],
      typeOptions: [{
        value: 'String',
        label: '字符串'
      }, {
        value: 'date',
        label: '时间'
      }, {
        value: 'number',
        label: '数值'
      }, {
        value: 'money',
        label: '金额'
      }, {
        value: 'combo',
        label: '下拉框'
      }, {
        value: 'memo',
        label: '说明'
      }],
      dateOptions: [{
        value: 'YYYY-MM-DD',
        label: '年月日'
      }, {
        value: 'YYYY-MM-DD HH:mm:ss',
        label: '年月日时分秒'
      }],
      formInline: {
        labelName: '',
        fieldName: '',
        type: '',
        remarks: ''
      },
      templateList: [],
      ruleForm: {
        id: '',
        name: '',
        category: '',
        tplDsc: '',
        property: '',
        remark: ''
      },
      rules: {
        name: [{ required: true, message: '请输入模板名称！', trigger: 'blur' }],
        category: [{ required: true, message: '请输入模板类型！', trigger: 'blur' }]
      },
      titleName: '新增',
      dialogFormVisible: false,
      paramsList: {
        current: 1,
        pageSize: 10,
        r: true,
        q: '',
        sorter: '',
        order: undefined,
        hasPerm: true
      },
      listQuery: {
        page: 1,
        limit: 10
      },
      total: 1,
      tableData: []
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    // const tbody = document.querySelector('.el-table__body-wrapper tbody')
    // const _this = this
    // Sortable.create(tbody, {
    //   onEnd({ newIndex, oldIndex }) {
    //     const currRow = _this.templateList.splice(oldIndex, 1)[0]
    //     _this.templateList.splice(newIndex, 0, currRow)
    //   }
    // })
  },
  methods: {
    getType() {
      this.remarksIf = this.formInline.type
      if (this.remarksIf === 'date') {
        this.formInline.remarks = 'YYYY-MM-DD'
      } else {
        this.formInline.remarks = ''
      }
    },
    dateFormat(row, column, cellValue, index) {
      var date = new Date(parseInt(cellValue))
      var Y = date.getFullYear() + '-'
      var M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) + '-' : date.getMonth() + 1 + '-'
      var D = date.getDate() < 10 ? '0' + date.getDate() + '' : date.getDate()
      var h = date.getHours() < 10 ? '0' + date.getHours() + '' : date.getHours() + ':'
      var m = date.getMinutes() < 10 ? '0' + date.getMinutes() + '' : date.getMinutes() + ':'
      var s = date.getSeconds() < 10 ? '0' + date.getSeconds() + '' : date.getSeconds()
      return Y + M + D + ' ' + h + m + s
    },
    setCombo() {
      if (this.comboCode === '') {
        this.$message.error('列表code不能为空')
        return
      }
      if (this.comboName === '') {
        this.$message.error('列表名称不能为空')
        return
      }
      this.comboOptions.push({
        value: this.comboCode,
        label: this.comboName
      })

      this.comboCode = ''
      this.comboName = ''
    },
    addTemplateList() {
      if (this.formInline.labelName === '') {
        this.$message.error('标签名称不能为空')
        return
      }
      if (this.formInline.fieldName === '') {
        this.$message.error('字段名称不能为空')
        return
      }
      if (this.formInline.type === '') {
        this.$message.error('类型不能为空')
        return
      }
      console.log(this.comboOptions)
      if (this.comboOptions !== '' && this.comboOptions.length > 0) {
        this.formInline.remarks = JSON.stringify(this.comboOptions)
      }
      this.templateList.push(JSON.parse(JSON.stringify(this.formInline)))
      this.formInline.fieldName = ''
      this.formInline.labelName = ''
      this.formInline.remarks = ''
      this.formInline.type = ''
      this.comboOptions = []
    },
    createData() {
      this.ruleForm.property = JSON.stringify(this.templateList)
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          addTemplate(this.ruleForm).then(res => {
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
      this.ruleForm.property = JSON.stringify(this.templateList)
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.ruleForm)
          updateTemplate(tempData.id, tempData).then(() => {
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

    getList() {
      this.paramsList.current = this.listQuery.page
      this.paramsList.pageSize = this.listQuery.limit
      this.paramsList.q = ''
      getTemplates(this.paramsList).then(res => {
        this.tableData = res.data
        this.total = res.total
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    removeDomain(item) {
      var index = this.dynamicValidateForm.domains.indexOf(item)
      if (index !== -1) {
        this.dynamicValidateForm.domains.splice(index, 1)
      }
    },
    addDomain() {
      this.dynamicValidateForm.domains.push({
        value: '',
        key: Date.now()
      })
    },
    handleCreate() {
      this.titleName = '新增'
      this.ruleForm.id = ''
      this.ruleForm.name = ''
      this.ruleForm.category = ''
      this.ruleForm.remark = ''
      this.ruleForm.tplDsc = ''
      this.ruleForm.st = ''

      this.templateList = []
      this.dialogFormVisible = true
    },
    handleFilter() {

    },
    handleClick(row) {
      this.titleName = '详情'
      this.dialogFormVisible = true

      this.ruleForm.id = row.id
      this.ruleForm.name = row.name
      this.ruleForm.category = row.category
      this.ruleForm.remark = row.remark
      this.ruleForm.tplDsc = row.tplDsc

      this.templateList = JSON.parse(row.property)
    },
    deleteTemp(row) {
      for (var i = 0; i < this.templateList.length; i++) {
        if (this.templateList[i] === row) {
          this.templateList.splice(i, 1)
        }
      }
    },
    updeClick(row) {
      this.formInline.fieldName = ''
      this.formInline.labelName = ''
      this.formInline.remarks = ''
      this.formInline.type = 'String'
      this.remarksIf = this.formInline.type
      this.comboCode = ''
      this.comboName = ''
      this.titleName = '编辑'
      this.dialogFormVisible = true
      this.ruleForm.id = row.id
      this.ruleForm.name = row.name
      this.ruleForm.category = row.category
      this.ruleForm.remark = row.remark
      this.ruleForm.tplDsc = row.tplDsc
      if (row.property !== 'null' && row.property !== '' && row.property !== null) {
        this.templateList = JSON.parse(row.property)
      }
    },
    deleteClick(row) {
      this.$confirm('此操作将永久删除该条信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(action => {
        if (action === 'confirm') {
          deleteTemplate(row.id).then(() => {
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
    }
  }
}
</script>

