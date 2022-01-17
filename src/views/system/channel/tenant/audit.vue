<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{ action=='check'?'待审信息':'待撤信息' }}</span>
      </div>
      <div>
        <HorizontalTable :config="config" />
      </div>
    </el-card>

    <el-card class="box-card" style="margin-top:15px;">
      <div slot="header" class="clearfix">
        <span>审批意见</span>
      </div>
      <div class="opinion">
        <div class="examine-left">
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in historyList"
              :key="index"
              placement="top"
              size="large"
              type="primary"
              icon="el-icon-more"
              color="hsl"
              :timestamp="item.endTime"
            >
              <el-card style="width: 98%">
                <span><b>{{ item.actName }}人:</b> </span><span class="msg">{{ item.assigneeName }} </span><br><br>
                <span><b>{{ item.actName }}意见: </b></span><span class="msg">{{ item.advice }}</span>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
        <div class="examine-left">
          <el-form
            ref="opinionForm"
            :rules="opinionRules"
            :model="opinionForm"
            style="width:600px;"
          >
            <el-form-item :label="action=='check'?'您的意见':'撤销原因'" prop="advice">
              <div>
                <el-button v-if="action=='check'" size="mini" @click="changeText">已更正</el-button>
                <el-button v-if="action=='check'" size="mini" @click="changeText">好像没问题</el-button>
              </div>
              <el-input v-model="opinionForm.advice" :rows="8" type="textarea" clearable />
            </el-form-item>
            <el-form-item>
              <el-button v-if="action=='check'" size="small" type="primary" @click="onPass">核准</el-button>
              <el-button v-if="action=='check'" size="small" type="danger" @click="veto">否决</el-button>
              <el-button v-if="action=='revoke'" size="small" type="danger" @click="repeal">撤销</el-button>
              <el-button v-if="action=='check'" type="primary" size="small" @click="isTurnover">指派审核人
              </el-button>
              <!-- <el-button v-if="loginId != detailData.c1" type="warning" size="small" @click="solve">撤回审核人</el-button> -->
              <el-button size="small" @click="goBack">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>

    <el-dialog class="dialog" :visible.sync="passFormVisible" width="500px" :close-on-click-modal="false">
      <el-form ref="passForm" :model="passForm" :rules="passFormRules" label-position="right" label-width="80px">
        <el-form-item label="租户名称:">
          {{ detailData.name }}
        </el-form-item>
        <el-form-item label="账户类型:">
          <el-select v-model="zhlxValue" placeholder="请选择">
            <el-option
              v-for="item in zhlxList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item><br>
        <el-form-item label="部署区域:">
          <el-select v-model="bsqyValue" placeholder="请选择">
            <el-option
              v-for="item in bsqyList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item><br>
        <el-form-item label="业务单位:">
          <el-select v-model="ywdwValue" placeholder="请选择" @change="getUnitCode">
            <el-option
              v-for="item in ywdwList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item><br>
        <el-form-item label="业务线:">
          <el-select v-model="unitCodeValue" placeholder="请选择" @change="setTenantNo">
            <el-option
              v-for="item in unitCodeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="unitCodeName" style="width: 200px" />
          <el-button type="primary" size="small" @click="setUnitCode">添加业务线</el-button>
        </el-form-item>
        <br>
        <el-form-item label="租户编号:" prop="tenantNo">
          <el-input v-model="passForm.tenantNo" />
        </el-form-item><br>
        <el-form-item label="集群编号:" prop="clusterNo">
          <el-cascader
            v-model="passForm.clusterNo"
            :show-all-levels="false"
            :options="options"
            :props="props"
            @change="handleChange"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="medium" @click="submitPass('passForm')">确 定</el-button>
        <el-button size="medium" @click="passFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="指派审核人" :visible.sync="turnoverVisible" width="550px" :close-on-click-modal="false">
      <el-form ref="turnover" :model="turnover" :rules="passFormRules" label-position="right" label-width="110px">
        <el-form-item label="审核人用户id" prop="id">
          <el-select v-model="turnover.id" placeholder="请选择" style="width: 100%;" size="small">
            <el-option
              v-for="item in usersList"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="指派审核人意见" prop="advice">
          <el-input v-model="turnover.advice" type="textarea" clearable placeholder="请输入指派审核人意见" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="medium" @click="submitTurnover()">确 定</el-button>
        <el-button size="medium" @click="turnoverVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import HorizontalTable from '@/components/HorizontalTable'
import {
  fetchTenantItem,
  updateTenantApply,
  updateHistory,
  deleteTenant,
  tenantsExchange,
  tenantsSolve,
  getClusters
} from '@/api/sys'
import { taskVariable, getDictType, getUnitCode } from '@/api/task'
import { parseTime } from '@/utils/index.js'
import userImg from '@/assets/images/user.png'
import user from '@/store/modules/user'

export default {
  name: 'Audit',
  components: { HorizontalTable },
  props: {
    action: {
      type: String,
      default: ''
    },
    auditId: {
      type: String,
      default: ''
    },
    usersList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      unitCodeName: '',
      dictType: 'zhlx',
      config: {
        headers: [
          { prop: 'name', label: '租户名称' },
          { prop: 'tenantDsc', label: '租户描述' },
          { prop: 'phone', label: '联系电话' },
          { prop: 'clusterNo', label: '集群编号' },
          { prop: 'tenantNo', label: '租户编号' },
          { prop: 'deployArea', label: '部署区域', type: 'Enum', Enum: { name: 'deployArea' }},
          { prop: 'register', label: '登记人' }
        ],
        rowSize: 3,
        originData: {},
        currentData: {}
      },
      userImg,
      historyList: [],
      detailData: {},
      opinionForm: {
        advice: '',
        clusterNo: ''
      },
      opinionRules: {
        advice: [{ required: true, message: '请输入', trigger: 'blur' }]
      },
      passFormVisible: false,
      turnoverVisible: false,
      passForm: {
        tenantNo: '',
        clusterNo: ''
      },
      turnover: {
        id: '',
        advice: ''
      },
      passFormRules: {
        tenantNo: [{ required: true, message: '请选择业务线获取租户编号', trigger: 'blur' }],
        clusterNo: [{ required: true, message: '请选择', trigger: 'change' }]
      },
      loginId: '',
      options: [],
      props: { expandTrigger: 'hover' },
      zhlxList: '',
      bsqyList: '',
      ywdwList: '',
      unitCodeList: '',
      zhlxValue: '',
      bsqyValue: '',
      ywdwValue: '',
      unitCodeValue: ''
    }
  },
  computed: {
    ...mapGetters([
      'avatar'
    ])
  },
  watch: {},
  created() {
    this.loginId = user.state.userId
    this.getList()
    this.getHistory()
    this.getClusters()
    this.getDictType()
  },
  methods: {
    setUnitCode() {

    },
    getDictType() {
      // 查询账户类型
      getDictType(this.dictType).then(res => {
        if (res.status === 0) {
          this.zhlxList = res.data
          this.zhlxValue = this.zhlxList[0].code
        }
      })

      // 查询部署区域
      this.dictType = 'bsqy'
      getDictType(this.dictType).then(res => {
        if (res.status === 0) {
          this.bsqyList = res.data
          this.bsqyValue = this.bsqyList[0].code
        }
      })

      // 查询业务单位
      this.dictType = 'ywdw'
      getDictType(this.dictType).then(res => {
        if (res.status === 0) {
          this.ywdwList = res.data
          console.log(this.ywdwList)
          this.ywdwValue = this.ywdwList[0].code
          this.getUnitCode()
        }
      })
    },
    getUnitCode() {
      getUnitCode(this.ywdwValue).then(res => {
        if (res.status === 0) {
          this.unitCodeList = []
          this.unitCodeValue = ''
          if (res.data.length !== 0) {
            this.unitCodeList = res.data
            this.unitCodeValue = this.unitCodeList[0].code
            this.setTenantNo()
          } else {
            this.passForm.tenantNo = ''
          }
        }
      })
    },
    setTenantNo() {
      this.passForm.tenantNo = this.zhlxValue + '' + this.bsqyValue + '' + this.ywdwValue + '' + this.unitCodeValue
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
      this.options = clustersList
    },
    async getList() {
      await fetchTenantItem(this.auditId).then(res => {
        if (res.data) {
          this.detailData = Object.assign(res.data, this.detailData)
          for (const i in res.data) {
            this.$set(this.config.originData, i, res.data[i])
          }
          const { taskId, procInstId } = res.data
          taskVariable({ taskId, procInstId, v: 'entity' }).then(r2 => {
            if (r2.data) {
              r2.data = JSON.parse(r2.data)
              for (const i in r2.data) {
                this.$set(this.config.currentData, i, r2.data[i])
              }
            }
          })
        }
      }).catch(err => {
        console.log(err)
      })
    },
    async getHistory() {
      const { data } = await updateHistory(this.auditId)
      data.forEach(item => {
        item.endTime = parseTime(item.endTime)
      })
      this.historyList = data
    },
    changeText(e) {
      this.opinionForm.advice = e.target.innerText
    },
    onPass() {
      this.$refs['opinionForm'].validate((valid) => {
        if (valid) {
          this.passFormVisible = true
        }
      })
    },
    handleChange(value) {
      // this.this.opinionForm.clusterNo = value[1]
    },
    submitPass(form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.opinionForm.tenantNo = this.passForm.tenantNo
          this.opinionForm.clusterNo = this.passForm.clusterNo[1]
          this.opinionForm.pass = true
          updateTenantApply(this.detailData.id, this.opinionForm).then(() => {
            this.opinionForm.advice = ''
            this.$message({
              type: 'success',
              message: '审核成功',
              duration: 2000
            })
            this.$emit('fatherMethod')
          })
        }
      })
    },
    submitTurnover() {
      this.$refs['turnover'].validate(valid => {
        if (valid) {
          tenantsExchange(this.detailData.id, this.turnover).then(() => {
            this.turnoverVisible = false
            this.$message({
              type: 'success',
              message: '流转成功',
              duration: 2000
            })
            this.$emit('fatherMethod')
          })
        }
      })
    },
    veto() {
      this.$refs['opinionForm'].validate((valid) => {
        if (valid) {
          this.opinionForm.pass = false
          updateTenantApply(this.detailData.id, this.opinionForm).then(() => {
            this.opinionForm.advice = ''
            this.$message({
              type: 'success',
              message: '否决成功',
              duration: 2000
            })
            this.$emit('fatherMethod')
          })
        }
      })
    },
    repeal() {
      this.$refs['opinionForm'].validate((valid) => {
        if (valid) {
          deleteTenant(this.detailData.id, this.opinionForm).then(() => {
            this.opinionForm.advice = ''
            this.$message({
              type: 'success',
              message: '撤销成功',
              duration: 2000
            })
            this.$emit('fatherMethod')
          })
        }
      })
    },
    solve() {
      this.$refs['opinionForm'].validate((valid) => {
        if (valid) {
          // this.opinionForm.pass = false
          tenantsSolve(this.detailData.id, this.opinionForm).then(() => {
            this.opinionForm.advice = ''
            this.$message({
              type: 'success',
              message: '解签成功',
              duration: 2000
            })
            this.$emit('fatherMethod')
          })
        }
      })
    },
    isTurnover() {
      this.turnoverVisible = true
    },
    goBack() {
      this.$emit('fatherMethod')
    }
  }
}
</script>

<style scoped>
    table {
        border-collapse: collapse;
        font-size: 15px;
    }

    td {
        width: 25%;
        border: 0.5px solid #F0F0F0;
        padding: 10px 18px;
    }

    .opinion {
        display: flex;
        height: 450px;
        justify-content: space-between;
    }

    .examine-left {
        margin: 0 !important;
        height: 100%;
        width: 45%;
        overflow: hidden;
        overflow-y: auto;
    }

    .examine-left section {
        margin-left: 10px;
    }

    .examine-left section .msg {
        font-size: 13px;
        color: #8C8C8C;
    }

    .examine-left section a {
        font-size: 12px;
        color: #CCCCCC;
    }

    .examine-left section .action {
        display: block;
        margin-top: 10px;
        font-size: 14px;
        color: #595959;
    }

    .examine-right /deep/ .el-form-item__content {
        margin-left: 0px !important;
    }

    ::v-deep .el-form-item__label {
        font-weight: normal;
        padding: 0 10px 0 0;
    }

    .dialog ::v-deep .el-dialog__body {
        padding: 15px 20px;
    }

    .dialog ::v-deep .el-form-item {
        margin-bottom: 0;
    }

    .dialog ::v-deep .el-form-item__content {
        width: calc(100% - 80px);
    }

</style>
