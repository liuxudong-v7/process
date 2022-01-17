<template>
  <div class="custom-table" :class="{ 'w-table w-table_moving': dragState.dragging && isDrag }">
    <el-table
      ref="table"
      :data="dataSource"
      :cell-class-name="cellClassName"
      :header-cell-class-name="headerCellClassName"
      element-loading-text="Loading"
      border
      fit
      :max-height="tableHeight || 'auto'"
      highlight-current-row
      tooltip-effect="dark"
      size="medium"
      style="width:100%"
      :header-cell-style="{fontSize: '16px', 'font-weight': 'lighter !important',color: '#000000'}"
      @selection-change="handleSelectionChange"
    >
      <slot name="fixed" />
      <slot name="selectionTenant" />
      <slot name="selectionCluster" />
      <slot name="selectionEnv" />
      <slot name="selectionOsgi" />
      <slot name="selectionCert" />
      <el-table-column
        label="序号"
        type="index"
        width="60"
        :show-overflow-tooltip="true"
      >
        <template scope="scope">
          <span>{{ (listQueryPage - 1) * listQueryLimit + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(column, index) in tableHeader"
        v-if="column.showTable !== false"
        :key="index"
        :width="column.width ? column.width : ''"
        :align="column.align || 'left'"
        :label="column.label"
        :prop="column.param"
        :sortable="column.sortable ? true : false"
        :column-key="index.toString()"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <!-- 自定义组件 start -->
          <ExSolt
            v-if="column.render"
            :render="column.render"
            :row="scope.row"
            :index="scope.$index"
            :column="column"
          />
          <!-- 自定义组件 end -->
          <span v-else-if="column.valueEnum">
            {{
              column.valueEnum && column.valueEnum[scope.row[column.param]]
                ? column.valueEnum[scope.row[column.param]]
                : scope.row[column.param]
            }}
          </span>
          <span v-else>{{
            scope.row[column.param] | renderText(column.valueType || "text")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="tableOption.label"
        :width="tableOption.width"
        :label="tableOption.label"
        :fixed="tableOption.fixed"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <!-- <el-button
            v-for="(item, index) in tableOption.options"
            v-show="item.showTable !== false && scope.row.checked !== 1"
            :key="index"
            size="small"
            :type="item.type"
            :icon="item.icon"
            @click="handleButton(item.methods, scope.row, index)"
          >
            {{ item.label }}
          </el-button> -->
          <div
            v-for="(item, index) in perms"
            v-show="item.showTable !== false"
            :key="index"
            style="display: inline-block;"
          >
            <el-button
              v-permission="[item.methods]"
              size="small"
              :type="item.type"
              :icon="item.icon"
              style="margin: 0 5px;"
              @click="handleButton(item.methods, scope.row, index)"
            >
              {{ item.label }}
            </el-button>
            <span v-if="index < perms.length - 1 && item.type == 'text'" v-permission="[item.methods]">
              <el-divider direction="vertical" />
            </span>
          </div>
          <slot name="passwdReset" :passwdReset="scope.row" />
          <slot name="check" :check="scope.row" />
          <slot name="create" :create="scope.row" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import defaultRenderText from './DefaultRenderText.js'
import ExSolt from './ExSolt.vue'
import permission from '@/directive/permission'
export default {
  directives: { permission },
  filters: {
    renderText: defaultRenderText
  },
  components: {
    ExSolt
  },
  props: {
    isDrag: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    dataSource: {
      type: Array,
      default: () => {
        return []
      }
    },
    columns: {
      type: Array,
      default: () => {
        return []
      }
    },
    listQueryPage: {
      type: Number,
      default: Number
    },
    listQueryLimit: {
      type: Number,
      default: Number
    },
    tableOption: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // eslint-disable-next-line vue/require-default-prop
    tableHeight: {
      type: Number,
      default: Number
    }
  },
  data() {
    return {
      tableHeader: this.columns,
      dragState: {
        start: -9, // 起始元素的 index
        end: -9, // 移动鼠标时所覆盖的元素 index
        dragging: false, // 是否正在拖动
        direction: undefined // 拖动方向
      }
      // tableHeight: (document.documentElement.clientHeight) * 0.6
    }
  },
  computed: {
    perms() {
      const perms = this.$store.getters.perms[this.$route.path]
      if (this.tableOption.options.length > 0 && perms && perms.length > 0) {
        return this.tableOption.options.filter(item => perms.indexOf(item.methods) !== -1)
      } else {
        return []
      }
    }
  },
  watch: {
    columns(val, oldVal) {
      this.tableHeader = val
    }
  },
  methods: {
    handleButton(methods, row, index) {
      console.log(this.$route)
      // 按钮事件
      this.$emit('handleButton', { methods: methods, row: row, index: index })
    },
    handleSortChange(val) {
      // 排序
      this.$emit('handleSortChange', val)
    },
    handleSelectionChange(val) {
      this.$emit('handleSelectionChange', val)
    },
    renderHeader(createElement, { column }) {
      return [
        createElement(
          'div',
          {
            class: ['thead-cell'],
            on: {
              mousedown: $event => {
                this.handleMouseDown($event, column)
              },
              mousemove: $event => {
                this.handleMouseMove($event, column)
              }
            }
          },
          [
            // 添加 <a> 用于显示表头 label
            createElement('a', column.label)
          ]
        ),
        // 添加一个空标签用于显示拖动动画
        createElement('span', {
          class: ['virtual']
        })
      ]
    },
    headerCellClassName({ column, columnIndex }) {
      const active =
        columnIndex === this.dragState.end
          ? `darg_active_${this.dragState.direction}`
          : ''
      const start = columnIndex === this.dragState.start ? `darg_start` : ''
      return `${active} ${start}`
    },
    cellClassName({ column, columnIndex }) {
      return columnIndex === this.dragState.start ? `darg_start` : ''
    },
    // 按下鼠标开始拖动
    handleMouseDown(e, column) {
      if (!this.isDrag) return
      this.dragState.dragging = true
      this.dragState.start = parseInt(column.columnKey)
      // 给拖动时的虚拟容器添加宽高
      const table = document.getElementsByClassName('w-table')[0]
      const virtual = document.getElementsByClassName('virtual')
      for (const item of virtual) {
        item.style.height = table.clientHeight - 1 + 'px'
        item.style.width = item.parentElement.parentElement.clientWidth + 'px'
      }
      document.addEventListener('mouseup', this.handleMouseUp)
    },
    // 鼠标放开结束拖动
    handleMouseUp() {
      this.dragColumn(this.dragState)
      // 初始化拖动状态
      this.dragState = {
        start: -9,
        end: -9,
        dragging: false,
        direction: undefined
      }
      document.removeEventListener('mouseup', this.handleMouseUp)
    },
    // 拖动中
    handleMouseMove(e, column) {
      if (this.dragState.dragging) {
        const index = parseInt(column.columnKey) // 记录起始列
        if (index - this.dragState.start !== 0) {
          this.dragState.direction =
            index - this.dragState.start < 0 ? 'left' : 'right' // 判断拖动方向
          this.dragState.end = parseInt(column.columnKey)
        } else {
          this.dragState.direction = undefined
        }
      } else {
        return false
      }
    },
    // 拖动易位
    dragColumn({ start, end, direction }) {
      const tempData = []
      const left = direction === 'left'
      const min = left ? end : start - 1
      const max = left ? start + 1 : end
      for (let i = 0; i < this.tableHeader.length; i++) {
        if (i === end) {
          tempData.push(this.tableHeader[start])
        } else if (i > min && i < max) {
          tempData.push(this.tableHeader[left ? i - 1 : i + 1])
        } else {
          tempData.push(this.tableHeader[i])
        }
      }
      this.tableHeader = tempData
    }
  }
}
</script>
<style lang="scss" scoped>
.custom-table {
  ::v-deep .thead-cell {
    padding: 0;
    display: inline-flex;
    flex-direction: column;
    align-items: left;
    // cursor: pointer;
    overflow: initial;
    &:before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }
  }
}
.w-table {
  background-color: red;
  ::v-deep .el-table .darg_start {
    background-color: #f3f3f3;
  }
  ::v-deep .el-table th {
    padding: 0;
    .virtual {
      position: fixed;
      top: 0;
      display: block;
      width: 0;
      height: 0;
      margin-left: -10px;
      background: none;
      border: none;
      z-index: -1;
    }
    &.darg_active_left {
      .virtual {
        border-left: 2px dotted #409eff;
        z-index: 99;
      }
    }
    &.darg_active_right {
      .virtual {
        border-right: 2px dotted #409eff;
        z-index: 99;
      }
    }
  }
  ::v-deep .thead-cell {
    padding: 0;
    display: inline-flex;
    flex-direction: column;
    align-items: left;
    cursor: pointer;
    overflow: initial;
    &:before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }
  }
  &.w-table_moving {
    ::v-deep .el-table th .thead-cell {
      cursor: move !important;
    }
    ::v-deep .el-table__fixed {
      cursor: not-allowed;
    }
  }
}
</style>
