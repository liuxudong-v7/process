<template>
  <div >
    <el-button @click="yulan">预览</el-button>

    <el-dialog title="文件预览" width="60%" :visible.sync="dialogTableVisible" :append-to-body="true">
      <embed :src="pdfUrl" style="width: 100%; height: 600px"/>
    </el-dialog>

  </div>
</template>

<script>
// https://github.com/FranckFreiburger/vue-pdf 文档地址
export default {
  name: 'PDFTo',
  components: {

  },
  data() {
    return {
      pdfUrl: 'http://localhost:8080/test.pdf',
      dialogTableVisible: false
    }
  },
  computed: {

  },
  mounted() {

  },
  methods: {
    yulan() {
      this.dialogTableVisible = true
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
