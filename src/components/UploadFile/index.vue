<template>
  <el-upload
    ref="upload"
    class="upload-demo"
    :action="action"
    :before-upload="beforeUpload"
    :on-preview="handlePreview"
    :on-remove="handleRemove"
    :file-list="fileList"
    :auto-upload="false"
    :on-error="onError"
    :on-success="handleSuccess"
    :limit="limit"
    :on-exceed="onExceed"
  >  <!-- accept=".xls,.xlsx" -->
    <el-button slot="trigger" size="mini" type="primary">选取文件</el-button>
    <el-button style="margin-left: 10px;" size="mini" type="success" @click="submitUpload">上传</el-button>
  </el-upload>
</template>

<script>
export default {
  name: 'UploadFile',
  props: {
    action: {
      type: String,
      default: ''
    },
    fileType: {
      type: String,
      default: ''
    },
    limit: {
      type: Number,
      default: Number
    },
    fileList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {

    }
  },
  methods: {
    beforeUpload(file) {
      console.log(this.isFileType(file))
    },
    submitUpload() {
      this.$refs.upload.submit()
    },
    handleRemove(file, fileList) {
      this.$emit('handleRemove', { 'fileList': fileList, 'file': file, 'fileType': this.fileType })
    },
    handlePreview(file) {
      console.log(file)
    },
    isFileType(file) {
      return /\.(xlsx|xls|csv|pdf|PDF|word|jar)$/.test(file.name)
    },
    onError(err, file, fileList) {
      console.log(err)
      this.$message.error('文件上传失败！')
    },
    handleSuccess(res, file, fileList) {
      this.$emit('handleSuccess', { 'res': res, 'fileType': this.fileType })
    },
    onExceed(files, fileList) {
      this.$message.warning(`请最多上传 ${this.limit} 个文件。`)
    }
  }
}
</script>
