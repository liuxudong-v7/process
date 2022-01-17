
<template>
  <div>
    <el-button type="primary" @click="getTableAllSelect">获取选中的数据</el-button>
    <el-table
      ref="table"
      :data="tableData"
      style="width: 100%;margin-bottom: 20px;"
      row-key="id"
      border
      :indent="50"
      :select-on-indeterminate="false"
      default-expand-all
      :tree-props="{children: 'childList'}"
      @select="select"
      @select-all="selectAll"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="title" label="菜单" sortable width="180" />
      <el-table-column prop="desc" label="用途" sortable width="180" />
      <el-table-column prop="path" label="路径" />
      <el-table-column prop="perms" label="权限" width="400">
        <template slot-scope="scope">
          <template v-if="scope.row.perms && scope.row.perms.length > 0">
            <!-- <el-checkbox v-model="scope.row.checkAll" :indeterminate="isIndeterminate && checkIndex === scope.$index" @change="val => handleCheckAllChange(val, scope)">全选</el-checkbox> -->
            <el-checkbox-group v-model="scope.row.checkbox" @change="val => handleCheckedPermsChange(val, scope)">
              <el-checkbox v-for="perm in activePerms(scope.row.perms)" :key="perm" :label="perm">{{ permNames[perm] }}</el-checkbox>
            </el-checkbox-group>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import permNames from '@/static_config/permsNames'

export default {
  data() {
    return {
      isIndeterminate: true,
      checkIndex: -1,
      checkedPerms: [],
      checkAll: false,
      permNames: permNames,
      tableData: [{
        id: 1,
        title: 'Dashboard',
        desc: 'Dashboard'
      }, {
        id: 2,
        title: '系统管理',
        desc: '系统管理',
        path: '/sys',
        childList: [{
          id: 31,
          title: '用户管理',
          desc: '用户管理',
          path: '/sys-users',
          checkAll: false,
          checkbox: [],
          perms: ['create', 'update', 'query', 'delete']
        }, {
          id: 32,
          title: '角色管理',
          desc: '角色管理',
          path: '/sys-roles',
          checkAll: false,
          checkbox: [],
          perms: ['create', 'update', 'query', 'delete']
        }]
      }],
      checkedKeys: false, // 是否全部选中
      isLoading: true,
      treeProps: { children: 'children', hasChildren: 'hasChildren' } // 树状图的配置项
    }
  },
  computed: {
    activePerms: function() { // v-for与v-if不能用在同级 故采用该方式
      return perms => {
        return perms.filter(perm => perm !== 'query')
      }
    }
  },
  methods: {
    getTableAllSelect() {
      console.log(this.multipleSelection)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleCheckAllChange(row, type) {
      row.checkAll = type
      row.checkbox = type && row.perms ? row.perms.filter(item => item !== 'query') : []
      this.isIndeterminate = false
    },
    handleCheckedPermsChange(value, scope) {
      const perms = scope.row.perms.filter(item => item !== 'query')
      const checkedCount = value.length
      scope.row.checkAll = checkedCount === perms.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < perms.length
    },
    setChildren(children, type) {
      // 编辑多个子层级
      children.map(j => {
        this.toggleSelection(j, type)
        this.handleCheckAllChange(j, type)
        if (j.childList) {
          this.setChildren(j.childList, type)
        }
      })
    },
    toggleSelection(row, select) {
      if (row) {
        this.$nextTick(() => {
          this.$refs.table?.toggleRowSelection(row, select)
        })
      }
    },
    // 选中父节点时，子节点一起选中取消
    select(selection, row) {
      if (selection.some(el => row.id === el.id)) {
        this.handleCheckAllChange(row, true)
        // 解决子组件没有被勾选到
        this.setChildren(row.childList || [], true)
      } else {
        this.handleCheckAllChange(row, false)
        this.setChildren(row.childList || [], false)
      }
    },
    // 选择全部
    selectAll(selection) {
      // tabledata第一层只要有在selection里面就是全选
      const isSelect = selection.some(el => {
        const tableDataIds = this.tableData.map(j => j.id)
        return tableDataIds.includes(el.id)
      })
      // tableDate第一层只要有不在selection里面就是全不选
      const isCancel = !this.tableData.every(el => {
        const selectIds = selection.map(j => j.id)
        return selectIds.includes(el.id)
      })
      if (isSelect) {
        selection.map(el => {
          // 解决子组件没有被勾选到
          this.setChildren(el.childList || [], true)
        })
      }
      if (isCancel) {
        this.tableData.map(el => {
          // 解决子组件没有被勾选到
          this.setChildren(el.childList || [], false)
        })
      }
    }
  }
}
</script>
