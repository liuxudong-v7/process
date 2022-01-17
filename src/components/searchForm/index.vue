<template>
  <el-form
    ref="dialogForm"
    :model="dialogForm"
    :rules="validataList"
    :inline="true"
    label-width="120px"
  >
    <div class="box" :class="boxshow==true?'active':''">
      <el-form-item
        v-for="(item, index) in formList || []"
        :key="index"
        :label="(item.label || item.value) + '：'"
        :prop="item.value"
        :style="{width: item.width}"
        :class="item.type === 'textarea' ? 'textarea-class': '' "
      >
        <slot :name="item.value" :model="dialogForm">
          <!-- 下拉框 -->
          <template v-if="item.type === 'select'">
            <el-select v-model="dialogForm[item.value]" filterable :placeholder="item.placeholder">
              <el-option
                v-for="(i, index) in item.optionList || []"
                :key="index"
                :label="i[item.defaultPorps.label]"
                :value="i[item.defaultPorps.value]"
              />
            </el-select>
          </template>
          <!-- 日期选择框 -->
          <template v-else-if="item.type === 'date'">
            <el-date-picker
              v-model="dialogForm[item.value]"
              type="date"
              :clearable="!!item.clearable"
              :placeholder="item.placeholder"
            />
          </template>
          <!-- 日期范围 -->
          <template v-else-if="item.type === 'dateRange'">
            <el-date-picker
              v-model="dialogForm[item.value]"
              type="daterange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"
              :clearable="!!item.clearable"
              :placeholder="item.placeholder"
            />
          </template>
          <!-- 文本域 -->
          <template v-else-if="item.type === 'textarea'">
            <el-input
              v-model="dialogForm[item.value]"
              type="textarea"
              :placeholder="item.placeholder"
              resize="none"
              :autosize="{minRows: 4}"
            />
          </template>
          <template v-else-if="item.type === 'number'">
            <el-input
              v-model="dialogForm[item.value]"
              :placeholder="item.placeholder"
              clearable
              onkeyup="this.value=this.value.replace(/\D/g,'')"
            />
          </template>
          <!-- 其余全是输入框 -->
          <template v-else>
            <el-input v-model="dialogForm[item.value]" :placeholder="item.placeholder" clearable />
          </template>
        </slot>
      </el-form-item>
    </div>

    <el-form-item class="dailog-btn-wrap">
      <el-button size="small" @click="resetForm('dialogForm')">重 置</el-button>
      <el-button type="primary" size="small" :disabled="disabledIf" @click="submitForm">查 询</el-button>
      <el-button
        type="text"
        size="small"
        style="font-size: 14px;"
        @click="togglebox"
      ><i :class="boxshow==true?'active':''" class="el-icon-arrow-down" /> {{ boxshow==true?"收起":"展开" }}</el-button>
    </el-form-item>
  </el-form>
</template>
<script>

export default {
  components: {
  },
  props: {
    formList: {
      // 弹窗表单
      type: Array,
      required: true,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: []
    },
    disabledIf: {
      // 弹窗表单
      type: Boolean,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: false
    },
    // eslint-disable-next-line vue/require-default-prop
    validataList: {
      type: Object
      // eslint-disable-next-line vue/require-valid-default-prop
      // default: {}
    }
  },
  data() {
    return {
      boxshow: false,
      // validataList: {}, // 表单校验
      dialogForm: {}, // 弹窗表单j
      promiseList: null, // 用来存储promise数组；防止串行
      pickerOptions: {
        shortcuts: [{
          text: '最近一天',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - 1)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            start.setDate(start.getDate() - 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            // start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            start.setMonth(start.getMonth() - 1)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            // start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            start.setMonth(start.getMonth() - 3)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近半年',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 6)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一年',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            // start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            start.setFullYear(start.getFullYear() - 1)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  computed: {
  },
  watch: {
  },
  created() {
    this.getDialogForm()
  },
  methods: {
    // 点击确定按钮
    submitForm() {
      // 校验表单
      this.$refs['dialogForm'].validate(valid => {
        if (!valid) return
        // 把数据暴露出去
        this.$emit('submitForm', this.dialogForm)
      })
    },
    togglebox: function() {
      this.boxshow = !this.boxshow
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    // 生成表单和校验规则 及获取数据
    getDialogForm() {
      this.promiseList = [] // 重置数组
      this.dialogForm = this.formList.reduce(
        (
          prv,
          { value, required = false, message = '', type, dataSource },
          index
        ) => {
          // 表单
          prv[value] = dataSource || ''
          // 校验
          // this.validataList[value] = {
          //   required,
          //   message,
          //   trigger: 'blur'
          // }
          return prv
        },
        {}
      )
      // 获取数据
      this.getSelectData()
      console.log(this.dialogForm, '生成的表单')
    },
    // 获取下拉框数据
    async getSelectData() {
      for (const promise of this.promiseList) {
        // 当前索引没有值时，跳过当前循环
        if (!promise) continue
        const { data } = await promise
        // set进数组中
        this.$set(
          this.formList[this.promiseList.indexOf(promise)],
          'optionList',
          data || []
        )
      }
    }
  }
}
</script>
<style scoped lang="scss">
.el-form-item {
  width: calc(33.3% - 10px);
  ::v-deep .el-form-item__content {
    width: calc(100% - 120px);
  }
  ::v-deep .el-form-item__label {
    font-weight: normal;
  }
  .el-date-editor,
  .el-input,
  .el-select {
    width: 100%;
  }
}
.textarea-class {
  display: block;
  width: 100%;
  .el-form-item {
    width: 100%;
  }
}
.dailog-btn-wrap {
  float: right;
  text-align: right;
  .dailog-btn {
    margin-right: 10px;

    &:last-child {
      margin-right: 0px;
    }
  }
}
// 展开收缩
.box {
  max-height: 62.8px;
  overflow: hidden;
  transition: max-height 0.5s;
}
.box.active {
  max-height: 164.8px;
}
i {
  // transform:rotate(0deg);
  transition:transform 0.5s;
}
i.active {
  transform:rotate(180deg);
}

/*.custom-dailog-class {
  // /deep/ .el-dialog__header {
  //   text-align: left;
  // }
  ::v-deep .el-form-item {
    width: calc(50% - 10px);
    .el-form-item__content {
      width: calc(100% - 93px);
    }
    .el-date-editor,
    .el-input,
    .el-select {
      width: 100%;
    }
  }
  ::v-deep .textarea-class {
    display: block;
    width: 100%;
    .el-form-item {
      width: 100%;
    }
  }
  ::v-deep .dailog-btn-wrap {
    display: block;
    width: 100%;
    text-align: right;
    margin-bottom: 0;
    padding-top: 8px;
    .el-form-item__content {
      width: calc(100% - 103px);
    }
    .dailog-btn {
      width: 86px;
      height: 28px;
      margin-right: 10px;

      &:last-child {
        margin-right: 0px;
      }
    }
  }
}*/
</style>
