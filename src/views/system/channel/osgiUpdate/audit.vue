<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{ action=='check'?'待审信息':'待撤信息' }}</span>
        <!-- <el-button style="float: right; padding: 3px 0" type="text" @click="update">修改</el-button> -->
      </div>
      <div>
        <table height="120" width="100%" cellspacing="0" align="center" cellpadding="10px" style="backgroundColor: #FFFFFF;">
          <tr>
            <td bgcolor="#FAFAFA">底座名称</td>
            <td>{{ detailData.name }}</td>
            <td bgcolor="#FAFAFA">申请人</td>
            <td>{{ detailData.applicant }}</td>
            <td bgcolor="#FAFAFA">物理子系统id</td>
            <td>{{ detailData.envid }}</td>
          </tr>
          <tr>
            <td bgcolor="#FAFAFA">报告文件名</td>
            <td><div v-for="item in rptFiles" :key="item.id" style="cursor:pointer">{{ item.fileName }}</div></td>
            <td bgcolor="#FAFAFA">升级文件名</td>
            <td><span v-for="item in osgiFiles" :key="item.id" style="cursor:pointer">{{ item.fileName }}</span></td>
            <td bgcolor="#FAFAFA">插件文件名</td>
            <td><span v-for="item in osgiFiles" :key="item.id" style="cursor:pointer">{{ item.fileName }}</span></td>
          </tr>
          <tr>
            <td bgcolor="#FAFAFA">提供时间</td>
            <td>{{ detailData.publishTime }}</td>
            <td bgcolor="#FAFAFA">备注</td>
            <td colspan="3">{{ detailData.remark }}</td>
          </tr>
        </table>
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
          <el-form ref="opinionForm" :rules="opinionRules" :model="opinionForm" style="width:600px;">
            <el-form-item :label="action=='check'?'您的意见':'撤销原因'" prop="advice">
              <div>
                <el-button v-if="action=='check'" size="mini" @click="changeText">已更正</el-button>
                <el-button v-if="action=='check'" size="mini" @click="changeText">好像没问题</el-button>
              </div>
              <el-input v-model="opinionForm.advice" :rows="8" type="textarea" clearable />
            </el-form-item>
            <el-form-item>
              <el-button v-if="action=='check'" size="small" type="primary" @click="submitPass">核准</el-button>
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
import { fetchOsgiUpdateItem, updateOsgiUpdateApply, osgiUpdateHistory, deleteOsgiUpdate, osgisExchange, osgisSolve, getFileUpdate } from '@/api/sys'
import { parseTime } from '@/utils/index.js'
// import userImg from '@/assets/images/user.png'
import user from '@/store/modules/user'
export default {
  name: 'Audit',
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
      // userImg,
      historyList: [],
      detailData: {},
      opinionForm: {
        advice: ''
      },
      opinionRules: {
        advice: [{ required: true, message: '请输入', trigger: 'blur' }]
      },
      temp: {
        name: '',
        address: '',
        contact: '',
        phone: '',
        remark: ''
      },
      dialogFormVisible: false,
      turnoverVisible: false,
      dataForm: {},
      rptFiles: [],
      osgiFiles: [],
      pluginFiles: [],
      turnover: {
        id: '',
        advice: ''
      },
      // rules: {
      //   name: [{ required: true, message: '请输入用户姓名！', trigger: 'blur' }],
      //   address: [{ required: true, message: '请输入登录名称！', trigger: 'blur' }],
      //   contact: [{ required: true, message: '请输入登录密码！', trigger: 'blur' }],
      //   phone: [{ required: true, message: '请输入证件号码！', trigger: 'blur' }]
      // }
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
    update() {
      this.temp = Object.assign({}, this.detailData)
      this.dialogFormVisible = true
    },
    async getList() {
      await fetchOsgiUpdateItem(this.auditId).then(res => {
        if (res.data) {
          this.detailData = Object.assign(res.data, this.detailData)
          this.rptFiles = JSON.parse(this.detailData.rptFile)
          this.osgiFiles = JSON.parse(this.detailData.osgiFile)
          this.pluginFiles = JSON.parse(this.detailData.pluginFile)
        }
      }).catch(err => {
        console.log(err)
      })
      const { data } = await getFileUpdate(this.auditId)
      console.log(data)
    },
    async getHistory() {
      const { data } = await osgiUpdateHistory(this.auditId)
      data.forEach(item => {
        item.endTime = parseTime(item.endTime)
      })
      this.historyList = data
    },
    // updateData() {
    //   this.$refs['dataForm'].validate((valid) => {
    //     if (valid) {
    //       // eslint-disable-next-line no-unused-vars
    //       const tempData = Object.assign({}, this.temp)
    //       tempData.agentId = this.$route.query.id
    //       updateTenant(tempData.id, tempData).then(() => {
    //         this.dialogFormVisible = false
    //         this.detailData = Object.assign(this.temp, {})
    //         this.$notify({
    //           title: 'Success',
    //           message: '修改成功',
    //           type: 'success',
    //           duration: 2000
    //         })
    //       })
    //     }
    //   })
    // },
    changeText(e) {
      this.opinionForm.advice = e.target.innerText
    },
    submitPass() {
      this.$refs['opinionForm'].validate((valid) => {
        if (valid) {
          this.opinionForm.pass = true
          updateOsgiUpdateApply(this.detailData.id, this.opinionForm).then(() => {
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
          osgisExchange(this.detailData.id, this.turnover).then(() => {
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
          updateOsgiUpdateApply(this.detailData.id, this.opinionForm).then(() => {
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
          deleteOsgiUpdate(this.detailData.id, this.opinionForm).then(() => {
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
          osgisSolve(this.detailData.id, this.opinionForm).then(() => {
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
  width: 17%;
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
