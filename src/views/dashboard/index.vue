9<template>
  <div class="app-container">
    <el-card class="box-card ">
      <div class="box-container">
        <el-card class="box-card" style="width: 25%;">
          <div slot="header" class="clearfix">
            <span>我的待办事项</span>
          </div>
          <div>
            <el-tree
              :data="manageList"
              :props="defaultProps"
              accordion
              :render-content="renderContent"
              @node-click="handleNodeClick"
            />
          </div>
        </el-card>
        <el-card class="box-card" style="width: 73%;">
          <reuse-table
            v-loading="listLoading"
            :data-source="dataSource"
            :columns="columns"
            :table-option="tableOption"
            @handleButton="handleButton"
          >
            <template v-if="level === '0' || level === '1'" slot="check" slot-scope="props">
              <el-button type="text" size="mini" style="margin: 0 5px;" @click="checkBtn(props.check)">处理</el-button>
            </template>
            <template v-if="level !== '0'&& level !== '1'" slot="create" slot-scope="props">
              <el-button type="text" size="mini" style="margin: 0 5px;" @click="createBtn(props.create)">处理</el-button>
            </template>
          </reuse-table>
          <pagination
            v-show="total > 0"
            :total="total"
            :page.sync="paramsList.current"
            :limit.sync="paramsList.pageSize"
            @pagination="getList"
          />
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getWorkbenchMydealt, fetchTenantList, fetchTabtenantList, fetchOsgiUpdateList } from '@/api/sys'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
export default {
  components: { ReuseTable, Pagination },
  data() {
    return {
      manageList: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      listLoading: false,
      total: 1,
      dataSource: [],
      columns: [
        { label: '名称', param: 'name', align: 'center', editor: 'text' },
        { label: '流程环节', param: 'c4', align: 'center', editor: 'select',
          valueEnum: { check: '审批环节', update: '编辑环节' }
        },
        { label: '发起人', param: 'register', align: 'center', editor: 'text' },
        { label: '发起时间', param: 'st', align: 'center', sortable: true, valueType: 'dateTime' }

      ],
      paramsList: {
        current: 1,
        pageSize: 10,
        r: true,
        q: '',
        sorter: '',
        order: undefined,
        mode: 1
      },
      tableOption: {
        label: '操作',
        width: '200',
        fixed: 'right',
        options: []
      },
      tableBrowse: [
        { type: 'text', label: '申请', methods: 'create' }
      ],
      tableCommission: [
        { type: 'text', label: '处理', methods: 'checck' }
      ],
      active: null,
      level: null
    }
  },
  async created() {
    await getWorkbenchMydealt({ mode: '1' }).then(res => {
      const { data } = res
      const object = {}
      object['/channel/tenantEnv'] = data['/channel/tenantEnv']
      object['/channel/osgi'] = data['/channel/osgi']
      object['/channel/tenants'] = data['/channel/tenants']
      for (const key in object) {
        const manageItem = {}
        manageItem.count = `${data[key]}`
        switch (key) {
          case '/channel/tenants':
            manageItem.label = '租户流程'
            manageItem.router = 'channel/tenants'
            break
          case '/channel/tenantEnv':
            manageItem.label = '物理子系统流程'
            manageItem.router = 'channel/tenantEnv'
            break
          case '/channel/osgi':
            manageItem.label = '底座流程'
            manageItem.router = 'channel/osgi'
            break
          default:
            break
        }
        this.manageList.push(manageItem)
      }
      this.active = null
      this.level = this.$store.state.user.level
      const manageItemL = this.manageList[0].label
      this.getList(manageItemL)
    })
  },
  methods: {
    handleNodeClick(data) {
      const manageItemL = data.label
      this.getList(manageItemL)
    },
    renderContent(h, { node, data, store }) {
      return (
        <span class='custom-tree-node'>
          <span>{node.label}</span>
          <el-badge class='mark' value={node.data.count}/>
        </span>
      )
    },
    handleButton(data) {},
    async getList(manageItemL) {
      this.listLoading = true
      this.dataSource = []
      if (manageItemL === '租户流程') {
        this.active = 'channel/tenants'
        this.fetchTableList(fetchTenantList)
      } else if (manageItemL === '物理子系统流程') {
        this.active = 'channel/tenantEnv'
        this.fetchTableList(fetchTabtenantList)
      } else {
        this.active = 'channel/osgi'
        this.fetchTableList(fetchOsgiUpdateList)
      }
    },
    async fetchTableList(functionType) {
      functionType(this.paramsList).then(res => {
        if (!res.data) return
        // res.data.forEach(item => {
        //   item.label = item.name
        // })
        this.total = res.total
        this.dataSource = res.data
        this.listLoading = false
      }).catch(() => {
        this.dataSource = []
        this.listLoading = false
      })
    },
    checkBtn(data) {
      this.$router.push({ path: this.active, query: { Id: data.id, c4: data.c4 }})
    },
    createBtn(data) {
      this.$router.push(this.active)
      // this.$router.push({ path: '/sysRoles', query: { Id: this.temp.id }})
    }
  }
}

</script>

<style lang="scss" scoped>
  .box-container{
    display: flex;
    justify-content: space-between;
  }
</style>
