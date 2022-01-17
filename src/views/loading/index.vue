<template>
  <div class="app-container" />
</template>

<script>
export default {
  name: 'Loaidng',
  data() {
    return {

    }
  },
  created() {
    this.openLoading(this.$router.history.current.query)
  },
  methods: {
    openLoading(params) {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })
      this.$store.dispatch('user/SSOlogin', params).then(() => {
        setTimeout(() => {
          loading.close()
          this.$router.push({ path: '/' })
        }, 500)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
 .app-container{
   background-color: white;
 }
</style>

