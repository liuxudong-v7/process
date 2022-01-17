<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{ action=='check'?'待审信息':'待撤信息' }}</span>
      </div>
      <div>
          <HorizontalTable :config="config"/>
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
                <span ><b>{{ item.actName }}人:</b> </span><span class="msg">{{ item.assigneeName }} </span><br><br>
                <span ><b>{{ item.actName }}意见: </b></span><span class="msg">{{ item.advice }}</span>
              </el-card>
            </el-timeline-item>
          </el-timeline>

        </div>
        <div class="examine-left">
          <el-form ref="opinionForm" :rules="opinionRules" :model="opinionForm" style="width:600px;">
            <el-form-item :label="action=='check'?'您的意见':'撤销原因'" prop="advice">
              <div>
                <el-button v-if="action=='check'" size="mini" @click="changeText">已更正</el-button>
                <el-button v-if="action=='check'" size="mini" @click="changeText">好像没问题</el-button>
              </div>
              <el-input v-model="opinionForm.advice" :rows="8"  type="textarea" clearable />
            </el-form-item>
            <el-form-item>
              <el-button v-if="action=='check'" size="small" type="primary" @click="onPass('opinionForm')">核准</el-button>
              <el-button v-if="action=='check'" size="small" type="danger" @click="veto">否决</el-button>
              <el-button v-if="action=='revoke'" size="small" type="danger" @click="repeal">撤销</el-button>
              <el-button v-if="action=='check'" type="primary" size="small" @click="isTurnover">指派审核人</el-button>
              <!-- <el-button v-if="loginId != detailData.c1" type="warning" size="small" @click="solve">撤回审核人</el-button> -->
              <el-button size="small" @click="goBack">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
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
import { fetchTabtenantItem, tenantEnvApply, tenantEnvHistory, deleteTabtenant, tenantsEnvsExchange, tenantsEnvsSolve } from '@/api/sys'
import { parseTime } from '@/utils/index.js'
// import userImg from '@/assets/images/user.png'
import user from '@/store/modules/user'
const checkTenantId = (rule, value, callback) => {
  if (value) {
    const reg = /^[0-9]*$/
    if (reg.test(value)) {
      callback()
    } else {
      callback(new Error('格式错误，请重新填写！'))
    }
  } else {
    callback(new Error('请输入'))
  }
}

export default {
  name: 'Audit',
  components: {HorizontalTable},
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
      config: {
        headers: [
          {prop: 'envid', label: '系统标识'},
          {prop: 'name', label: '系统名称'},
          {prop: 'remark', label: '备注'}
        ],
        rowSize: 2,
        originData: {},
        currentData: {}
      },
      // userImg,
      historyList: [],
      detailData: {},
      opinionForm: {
        advice: ''
      },
      turnoverVisible: false,
      opinionRules: {
        advice: [{ required: true, message: '请输入', trigger: 'blur' }]
      },
      turnover: {
        id: '',
        advice: ''
      },
      passFormRules: {
        tenantNo: [{ required: true, message: '请输入', trigger: 'blur' }],
        id: [{ required: true, message: '请选择', trigger: 'change' }]
      },
      loginId: ''
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
  },
  methods: {
    async getList() {
      await fetchTabtenantItem(this.auditId).then(res => {
        if (res.data) {
          this.detailData = Object.assign(res.data, this.detailData)
          for (const i in res.data) {
            this.$set(this.config.originData, i, res.data[i])
          }
          const {taskId, procInstId} = res.data;
          taskVariable({taskId, procInstId, v: 'entity'}).then(r2 => {
            if (r2.data) {
              r2.data = JSON.parse(r2.data);
              for (const i in r2.data) {
                this.$set(this.config.currentData, i, r2.data[i]);
              }
            }
          })
        }
      }).catch(err => {
        console.log(err)
      })
    },
    async getHistory() {
      const { data } = await tenantEnvHistory(this.auditId)
      data.forEach(item => {
        item.endTime = parseTime(item.endTime)
      })
      this.historyList = data
    },
    changeText(e) {
      this.opinionForm.advice = e.target.innerText
    },
    onPass(form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.opinionForm.pass = true
          tenantEnvApply(this.detailData.id, this.opinionForm).then(() => {
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
          tenantsEnvsExchange(this.detailData.id, this.turnover).then(() => {
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
          tenantEnvApply(this.detailData.id, this.opinionForm).then(() => {
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
          deleteTabtenant(this.detailData.id, this.opinionForm).then(() => {
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
          tenantsEnvsSolve(this.detailData.id, this.opinionForm).then(() => {
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
.examine-right /deep/.el-form-item__content {
  margin-left: 0px !important;
}

::v-deep .el-form-item__label {
  font-weight: normal;
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
