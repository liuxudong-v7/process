<template>
  <div class="app-container" style="padding: 0px;">
    <el-header style="height: 60px;padding: 0 0">
      <el-card class="box-card">
        <div style="background-color: #fff;">
          <span style="font-weight: 600; font-size: 20px; margin-top: -10px;" title="授权管理">授权管理</span>
          <span style="float: right; margin-top: -4px;">
            <el-button type="primary" @click="closeClick">关闭</el-button>
          </span>
        </div>
      </el-card>
    </el-header>
    <el-main style="padding: 10px;">
      <el-card class="box-card">
        <div>
          <el-table
            ref="table"
            v-loading="listLoading"
            :data="tableData"
            style="width: 100%;margin-bottom: 20px;"
            row-key="title"
            border
            :indent="50"
            :select-on-indeterminate="false"
            :default-expand-all="true"
            :tree-props="{children: 'children'}"
            :header-cell-style="{fontSize: '16px', 'font-weight': 'lighter !important',color: '#000000'}"
            @select="select"
            @select-all="selectAll"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="title" label="菜单" width="240" />
            <el-table-column prop="desc" label="用途" width="230" />
            <el-table-column prop="path" label="路径" width="250" />
            <el-table-column prop="perms" label="权限">
              <template slot-scope="scope">
                <template v-if="scope.row.perms && scope.row.perms.length > 0">
                  <!-- <el-checkbox v-model="scope.row.checkAll" :indeterminate="scope.row.isIndeterminate && checkIndex === scope.$index" @change="val => handleCheckAllChange(val, scope)">全选</el-checkbox> -->
                  <el-checkbox-group
                    v-model="scope.row.checkbox"
                    @change="val => handleCheckedPermsChange(val, scope)"
                  >
                    <el-checkbox v-for="perm in scope.row.perms" :key="perm" :label="perm">{{ permNames[perm] ? permNames[perm] : perm }}
                    </el-checkbox>
                  </el-checkbox-group>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </el-main>
    <el-footer>
      <div style="padding:0 12px;">
        <el-button type="primary" :disabled="disabled" @click="savePerms">保存</el-button>
      </div>
    </el-footer>
  </div>
</template>

<script>
import permNames from '@/static_config/permsNames'
import { sysRolesPermsConfigList, updaSysRolesId, sysRolesPermsById } from '@/api/sys'

export default {
  data() {
    return {
      disabled: false,
      listLoading: true,
      isIndeterminate: true,
      sysId: '',
      level: '',
      checkIndex: -1,
      checkedPerms: [],
      permNames: permNames,
      tableData: [],
      isLoading: true,
      treeProps: { children: 'children', hasChildren: 'hasChildren' } // 树状图的配置
    }
  },
  created() {
    // this.getList()
  },
  methods: {
    getList(level, sId) {
      this.sysId = sId
      sysRolesPermsConfigList({ 'level': level }).then(responseAll => {
        responseAll = this.reorder(responseAll)
        sysRolesPermsById(this.sysId).then(responseRole => {
          this.listLoading = false
          this.tableData = this.createTableData(0, responseAll.data, responseRole.data)
        })
      })
    },
    createTableData(id, allPerms, rolePerms) {
      allPerms.forEach(item => {
        item.id = ++id
        if (item.perms) {
          let rowPerms = []// 逐行构造已选权限
          for (const path in rolePerms) {
            if (path === item.path) {
              rowPerms = rolePerms[path]
              break
            }
          }
          Object.assign(item, {
            checkAll: false,
            isIndeterminate: true,
            path: item.path,
            perms: Object.keys(item.perms), // 当前行显示的权限
            checkbox: rowPerms // 选中的权限
            // perms: Object.keys(item.perms).filter(perm => perm !== 'query')
          })
          if (item.checkbox.length === item.perms.length) {
            item.checkAll = true
            this.toggleSelection(item, item.checkAll)
          }
        }
        if (item.children) {
          item.children = this.createTableData(item.id, item.children, rolePerms)
          id = item.children[item.children.length - 1].id
        }
      })
      return allPerms
    },
    savePerms() {
      this.disabled = true
      const perms = {}
      this.tableData.forEach(item0 => {
        const children = item0.children
        children.forEach(item => {
          if (item.checkbox.length > 0) {
            perms[item.path] = Object.values(item.checkbox)
          }
        })
      })
      const tempData = Object.assign({}, perms)
      updaSysRolesId(this.sysId, tempData).then(response => {
        this.disabled = false
        if (response.status === 0) {
          this.closeClick()
          this.$message({
            title: 'Success',
            message: '保存成功',
            type: 'success',
            duration: 2000
          })
        }
        if (response.status !== 0) {
          return this.$message({
            title: 'Success',
            message: '保存失败',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    handleSelectionChange(val, path) {
      this.multipleSelection = val
      this.multipleSelectionPath = path
    },
    handleCheckAllChange(row, type) {
      row.checkAll = type
      row.checkbox = type && row.perms ? row.perms : []
      this.isIndeterminate = false
    },
    handleCheckedPermsChange(value, scope) {
      const perms = scope.row.perms
      const checkedCount = value.length
      // this.checkIndex = scope.$index
      scope.row.checkAll = checkedCount === perms.length
      scope.row.isIndeterminate = checkedCount > 0 && checkedCount < perms.length
      this.handleSelectionChange(value, scope.row.path)
      this.toggleSelection(scope.row, scope.row.checkAll)
    },
    setChildren(children, type) {
      // 编辑多个子层级
      children.map(j => {
        this.toggleSelection(j, type)
        this.handleCheckAllChange(j, type)
        if (j.children) {
          this.setChildren(j.children, type)
        }
      })
    },
    toggleSelection(row, select) {
      if (row) {
        this.$nextTick(() => {
          this.$refs.table && this.$refs.table.toggleRowSelection(row, select)
        })
      }
    },
    // 选中父节点时，子节点一起选中取消
    select(selection, row) {
      if (selection.some(el => row.id === el.id)) {
        this.handleCheckAllChange(row, true)
        // 解决子组件没有被勾选到
        this.setChildren(row.children || [], true)
      } else {
        this.handleCheckAllChange(row, false)
        this.setChildren(row.children || [], false)
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
          this.setChildren(el.children || [], true)
        })
      }
      if (isCancel) {
        this.tableData.map(el => {
          // 解决子组件没有被勾选到
          this.setChildren(el.children || [], false)
        })
      }
    },
    closeClick() {
      this.$emit('fatherMethod')
    },
    reorder(Obj) {
      Obj.data.map(item => {
        item.children.map(cItem => {
          const sortArr = [] // 排序后的数组
          Object.keys(cItem.perms).sort().map(key => {
            switch (key) {
              case 'query':
                sortArr[0] = { 'query': cItem.perms['query'] }
                delete cItem.perms[`${key}`]
                break
              case 'create':
                sortArr[1] = { 'create': cItem.perms['create'] }
                delete cItem.perms[`${key}`]
                break
              case 'update':
                sortArr[2] = { 'update': cItem.perms['update'] }
                delete cItem.perms[`${key}`]
                break
              case 'delete':
                sortArr[3] = { 'delete': cItem.perms['delete'] }
                delete cItem.perms[`${key}`]
                break
              case 'bindRole':
                sortArr[4] = { 'bindRole': cItem.perms['bindRole'] }
                delete cItem.perms[`${key}`]
                break
              case 'export':
                sortArr[4] = { 'export': cItem.perms['export'] }
                delete cItem.perms[`${key}`]
                break
              default:
                sortArr.push(cItem.perms)
            }
          })
          cItem.perms = Object.assign(...sortArr)
        })
      })
      return Obj
    }
  }
}
</script>
