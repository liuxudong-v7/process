<template>
  <div class="app-container">
    <el-card class="box-card">
      <searchForm :form-list="formList" :disabled-if="disabled" @submitForm="handleFilter" />
    </el-card>

    <el-card class="box-card" style="margin-top:15px;">
      <reuse-table
        v-loading="listLoading"
        :list-query-page="paramsList.current"
        :list-query-limit="paramsList.pageSize"
        :data-source="dataSource"
        :columns="columns"
      />
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="paramsList.current"
        :limit.sync="paramsList.pageSize"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script>
import DateUtil from '@/utils/DateUtil'
import { fetchAuthLogsList } from '@/api/sys'
import ReuseTable from '@/components/ReuseTable/index'
import Pagination from '@/components/Pagination'
import searchForm from '@/components/searchForm'
export default ({
  components: { ReuseTable, Pagination, searchForm },
  data() {
    return {
      /** searchForm */
      disabled: false,
      formList: [
        { label: '日志日期区间', value: 'findDate', type: 'dateRange', clearable: true, placeholder: '',
          // eslint-disable-next-line no-irregular-whitespace
          dataSource: [DateUtil.getYesterDay(), DateUtil.getToday()] },
        { label: '登录名称', value: 'loginName', type: 'string', clearable: true, placeholder: '' },
        { label: '登录标志', value: 'authFlag', type: 'select', placeholder: '',
          defaultPorps: { value: 'code', label: 'text' },
          optionList: [{ code: '', text: '全部' }, { code: '0', text: '成功' }, { code: '1', text: '失败' }] },
        { label: '应用主机IP', value: 'appHostIp', type: 'string', clearable: true, placeholder: '' },
        { label: '客户端IP', value: 'clientIp', type: 'string', clearable: true, placeholder: '' }
      ],
      /** searchForm */
      list: null,
      listLoading: true,
      total: 1,
      listQuery: {
        page: 1,
        limit: 10,
        sorter: '',
        order: undefined
      },
      dataSource: [],
      columns: [
        { label: '登录名称', param: 'loginName' },
        // { label: '应用主机IP', param: 'appHostIp', width: 120 },
        { label: '客户端IP', param: 'clientIp' },
        { label: '登录标志', param: 'authFlag', align: 'center', valueEnum: { 0: '成功', 1: '失败' },
          render: (h, params) => {
            const authFlag = params.row.authFlag
            if (authFlag) {
              let type, data
              if (authFlag == '0') {
                type = 'success'; data = '成功'
              } else {
                type = 'danger'; data = '失败'
              }
              return h(
                'el-tag',
                {
                  attrs: {
                    type: type,
                    size: 'mini'
                  }
                },
                data
              )
            }
          }
        },
        { label: '响应信息', param: 'returnMsg' },
        { label: '登录开始时间', param: 'beginTime', align: 'center', valueType: 'dateTime' },
        { label: '登录结束时间', param: 'endTime', align: 'center', valueType: 'dateTime' },
        { label: '响应时间(ms)', param: 'tranTime', align: 'right' },
        { label: '保存时间', param: 'st', align: 'center', valueType: 'dateTime' }
      ],
      paramsList: {
        current: 1,
        pageSize: 10,
        r: true,
        q: '',
        sorter: '',
        order: undefined,
        findDate: [DateUtil.getYesterDay(), DateUtil.getToday()]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleFilter(dialogForm) {
      Object.assign(this.paramsList, dialogForm)
      this.getList()
    },
    async getList() {
      this.disabled = true
      this.listLoading = true
      await fetchAuthLogsList(this.paramsList).then(res => {
        if (!res.data) return
        this.total = res.total
        this.dataSource = res.data
        this.listLoading = false
        this.disabled = false
      }).catch(() => {
        this.listLoading = false
        this.disabled = false
      })
    }
  }
})
</script>
