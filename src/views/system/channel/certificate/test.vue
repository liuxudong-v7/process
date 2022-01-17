<template>
  <div>
    <div class="app-container">
        <div style="text-align:left;">
          <span style="float:left"><b>查询条件</b></span>
        </div><br><br>
      <div>
        流程码:
        <el-autocomplete
          class="inline-input"
          v-model="state2"
          :fetch-suggestions="querySearch"
          placeholder="请输入内容"
          :trigger-on-focus="false"
          @select="handleSelect"
        ></el-autocomplete>&nbsp;
        <el-button type="primary" @click="handleCreate">
          查询
        </el-button>
        <el-button style="" @click="handleCreate">
          重置
        </el-button>
      </div>
    </div>

  <div class="app-container">
      <div style="text-align:left;">
        <span style="float:left"><b>耗时统计列表</b></span>
      </div>

    <el-table
      :data="listData"
      :span-method="objectSpanMethod"
      border
      class="tableArea"

    >
      <el-table-column label="流程码" prop="productType" align="center" width="200"></el-table-column>
      <el-table-column label="nodes.type" prop="amount" align="center"></el-table-column>
      <el-table-column label="nodes.id" prop="price" align="center"></el-table-column>
      <el-table-column label="nodes.name" prop="productName" width="200px" align="center"></el-table-column>
      <el-table-column label="process.source" prop="updateTime" align="center"></el-table-column>
      <el-table-column label="process.target" prop="target" align="center"></el-table-column>
    </el-table>

    </div>
 </div>
</template>

<script>

import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'User',
  data() {
    return {
      listData: [],
      testArr1: [],
      testArr2: [],
      testPosition1: 0,
      testPosition2: 0,


      restaurants: [],
      state2: '',
      tableData: [{
        id: '12987122',
        name: '王小虎',
        amount1: '234',
        amount2: '3.2',
        amount3: 10,
        amount4: 101
      }, {
        id: '12987123',
        name: '王小虎',
        amount1: '165',
        amount2: '4.43',
        amount3: 12,
        amount4: 101
      }, {
        id: '12987124',
        name: '王小虎',
        amount1: '324',
        amount2: '1.9',
        amount3: 9,
        amount4: 101
      }, {
        id: '12987125',
        name: '王小虎',
        amount1: '621',
        amount2: '2.2',
        amount3: 17,
        amount4: 101
      }, {
        id: '12987126',
        name: '王小虎',
        amount1: '539',
        amount2: '4.1',
        amount3: 15,
        amount4: 101
      }],
      loadAll: [
        { 'value': '1100001', 'address': '1100001' },
        { 'value': '1100002', 'address': '1100002' },
        { 'value': '1200003', 'address': '1200003' },
        { 'value': '1200004', 'address': '1200004' },
        { 'value': '1300005', 'address': '1300005' },
        { 'value': '1300006', 'address': '1300006' },
        { 'value': '1000007', 'address': '1000007' },
        { 'value': '2100001', 'address': '2100001' },
        { 'value': '2100002', 'address': '2100002' },
        { 'value': '2200003', 'address': '2200003' },
        { 'value': '2200004', 'address': '2200004' },
        { 'value': '2300005', 'address': '2300005' },
        { 'value': '2300006', 'address': '2300006' },
        { 'value': '2000007', 'address': '2000007' }
      ],
    }
  },
  created() {

  },
  mounted() {
    this.queryData()
    this.restaurants = this.loadAll

  },
  methods: {
    queryData() {
      this.listData = [
        {
          id: '1100001',
          productType: '1100001',
          amount: 'outboundTask',
          productName: '测试http接出',
          price: 'n4',
          updateTime: 'start',
          target: 'end2'
        },
        {
          id: '1100001',
          productType: '1100001',
          amount: 'outboundTask',
          productName: '测试http接出',
          price: 'n4',
          updateTime: 'start',
          target: 'end2'
        },
        {
          id: '1100001',
          productType: '1100001',
          amount: 'outbound',
          productName: '测试http接出',
          price: 'n5',
          updateTime: 'start',
          target: 'end2'
        },

        {
          id: '1100002',
          productType: '1100002',
          amount: 'outboundTask',
          productName: '测试http接出',
          price: 'n5',
          updateTime: 'start',
          target: 'end2'
        },
        {
          id: '1100002',
          productType: '1100002',
          amount: 'outboundTask',
          productName: '测试http接出',
          price: 'n5',
          updateTime: 'start',
          target: 'end2'
        },
        {
          id: '2100002',
          productType: '2100002',
          amount: 'outboundTask33',
          productName: '测试http接出',
          price: 'n5',
          updateTime: 'start',
          target: 'end2'
        },
        {
          id: '2100002',
          productType: '2100002',
          amount: 'outboundTask123',
          productName: '测试http接出',
          price: 'n5',
          updateTime: 'start',
          target: 'end2'
        },
        {
          id: '2100001',
          productType: '2100001',
          amount: 'outboundTask',
          productName: '测试http接出',
          price: 'n5',
          updateTime: 'start',
          target: 'end2'
        },
        {
          id: '2100003',
          productType: '2100003',
          amount: 'outboundTask23',
          productName: '测试http接出',
          price: 'n5',
          updateTime: 'start',
          target: 'end2'
        },
        {
          id: '2100003',
          productType: '2100003',
          amount: 'outboundTask24',
          productName: '测试http接出',
          price: 'n5',
          updateTime: 'start',
          target: 'end2'
        },
        {
          id: '1100004',
          productType: '1100004',
          amount: 'outboundTask',
          productName: '测试http接出',
          price: 'n5',
          updateTime: 'start',
          target: 'end2'
        },
        {
          id: '1100004',
          productType: '1100004',
          amount: 'outboundTask3',
          productName: '测试http接出',
          price: 'n5',
          updateTime: 'start',
          target: 'end2'
        },
        {
          id: '1100004',
          productType: '1100004',
          amount: 'outboundTask44',
          productName: '测试http接出',
          price: 'n5',
          updateTime: 'start',
          target: 'end2'
        }
      ]

      this.rowspan(this.testArr1, this.testPosition1, 'productType')
      this.rowspan(this.testArr2, this.testPosition2, 'amount')
    },
    rowspan(spanArr, position, spanName) {
      this.listData.forEach((item, index) => {
        if (index === 0) {
          spanArr.push(1);
          position = 0;
        } else {
          if (
            this.listData[index][spanName] ===
            this.listData[index - 1][spanName]
          ) {
            spanArr[position] += 1;
            spanArr.push(0);
          } else {
            spanArr.push(1);
            position = index;
          }
        }
      });
    },
    // 表格合并行
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        const _row = this.testArr1[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col,
        };
      }
      if (columnIndex === 1) {
        const _row = this.testArr2[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col,
        };
      }
    },
    querySearch(queryString, cb) {
      var restaurants = this.restaurants
      var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      }
    },
    handleSelect(item) {
      console.log(item);
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
  }
}
</script>

<style scoped>

</style>
