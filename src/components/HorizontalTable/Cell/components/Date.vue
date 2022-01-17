<template functional>
  <span>{{ props.value | date(props.format) }}</span>
</template>

<script>
import moment from 'moment'
export default {
  filters: {
    date(value, format) {
      console.log(value, format)
      return moment(value).format(format)
    }
  }
}
</script>
