<template>
  <div class="pdf-container">
    <div class="tools">
      <el-button :theme="'default'" type="submit" :title="'基础按钮'" class="mr10" @click.stop="prePage">
        上一页
      </el-button>
      <span class="pageNum">
        <el-input style="width: 100px;" :value="pageNum" type="number" @input="handleChange" /> / {{ pageTotalNum || 1 }}
      </span>
      <el-button :theme="'default'" type="submit" :title="'基础按钮'" class="mr10" @click.stop="nextPage">
        下一页
      </el-button>
    </div>
    <div class="content" :style="{height: viewHeight + 'px'}">
      <pdf
        ref="pdf"
        :src="url"
        :page="pageNum"
        @progress="loadedRatio = $event"
        @page-loaded="pageLoaded($event)"
        @num-pages="pageTotalNum = $event"
        @error="pdfError($event)"
        @link-clicked="page = $event"
      />
    </div>
  </div>
</template>

<script>
// https://github.com/FranckFreiburger/vue-pdf 文档地址
import pdf from 'vue-pdf'
export default {
  name: 'PDF',
  components: {
    pdf
  },
  data() {
    return {
      url: 'http://192.168.2.104:8080/preview?filename=测试用2M.xlsx',
      pageNum: 1,
      pageTotalNum: 1,
      // 加载进度
      loadedRatio: 0,
      curPageNum: 0,
      loading: null
    }
  },
  computed: {
    viewHeight() {
      // 50 navbar 40 pagetools 40 padding 22 margin + border 50 footer
      return document.body.clientHeight - 50 - 40 - 40 - 22 - 50
    }
  },
  mounted() {
    this.pageLoading()
  },
  methods: {
    // 上一页函数，
    prePage() {
      var page = this.pageNum
      page = page > 1 ? page - 1 : this.pageTotalNum
      this.pageNum = page
    },
    // 下一页函数
    nextPage() {
      var page = this.pageNum
      page = page < this.pageTotalNum ? page + 1 : 1
      this.pageNum = page
    },
    handleChange(value) {
      let page = Number(value)
      if (Number(value) < 1) {
        page = 1
      }
      if (Number(value) > this.pageTotalNum) {
        page = this.pageTotalNum
      }
      this.pageNum = page
    },
    // 页面加载回调函数，其中e为当前页数
    pageLoaded(e) {
      this.curPageNum = e
      this.loading.close()
    },
    // 其他的一些回调函数。
    pdfError(error) {
      console.error(error)
      this.loading.close()
    },
    pageLoading() {
      this.loading = this.$loading({
        target: '.pdf-container',
        lock: true,
        text: '加载中，请稍后...',
        spinner: 'el-icon-loading',
        fullscreen: false,
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.pdf-container {
  padding: 20px;
  .tools {
    margin: 0 auto;
    text-align: center;
    .pageNum {
      margin: 0 10px;
    }
  }
  .content {
    margin: 20px auto 0;
    border: 1px solid #eee;
    min-height: 400px;
    overflow-y: scroll;
  }
}
</style>
