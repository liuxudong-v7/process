<template>
  <div class="app-container">
    <div class="filter-container" style="margin-top: 15px;display: flex;justify-content: flex-end;">
      <el-input v-model="paramsList.q" placeholder="" style="width: 300px;" class="input-with-select" @keyup.enter.native="handleFilter">
        <el-button slot="append" icon="el-icon-search" @click="handleFilter" />
      </el-input>
    </div>

    <reuse-table
      v-loading="listLoading"
      :data-source="dataSource"
      :columns="columns"
    />
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { fetchTenantHostRegList } from '@/api/sys'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
export default ({
  components: { ReuseTable, Pagination },
  data() {
    return {
      list: null,
      listLoading: true,
      total: 1,
      listQuery: {
        page: 1,
        limit: 20,
        sorter: '',
        order: undefined
      },
      dataSource: [],
      columns: [
        { label: '物理子系统id', param: 'envid' },
        { label: '服务地址', param: 'url' },
        { label: '活动状态', param: 'state', valueEnum: { 0: 'ONLINE', 1: 'OFFLINE' }},
        { label: '变更时间', param: 'utime', sortable: true }
      ],
      paramsList: {
        current: 1,
        pageSize: 20,
        r: true,
        q: '',
        sorter: '',
        order: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    async getList() {
      this.listLoading = true
      this.paramsList.current = this.listQuery.page
      this.paramsList.pageSize = this.listQuery.limit
      this.paramsList.q = ''
      await fetchTenantHostRegList(this.paramsList).then(res => {
        if (!res.data) return
        this.total = res.total
        this.dataSource = res.data
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    }
  }
})
</script>
