<template>
  <table class="portait-table" border="1" cellspacing="0" cellpadding="0">
    <tr v-for="(row, i) in columns" :key="i">
      <template v-for="(x, idx) in row">
        <TD :key="idx" :config="x" :current-data="currentData" :origin-data="originData" />
      </template>
    </tr>
  </table>
</template>

<script>
import * as Components from './Cell/components'
import { chunk, noop } from '@/utils'

export default {
  components: {
    TD: {
      functional: true,
      props: { config: Object, currentData: Object, originData: Object },
      render: (h, { props: { config, currentData, originData }}) => {
        const { type = 'Default', label, prop } = config
        const originValue = originData[prop]
        const currentValue = currentData[prop]
        const isEmpty = originValue === '' || originValue === undefined || originValue === null
        let children = noop

        if (label && isEmpty) {
          children = h(Components.Default, { props: { value: '-' }})
        } else {
          children = [
            h(Components[type], { props: { value: originValue, originData, ...config }}),
            h(currentValue !== originValue ? Components[type] : null, { props: { value: currentValue, currentData, ...config }})
          ]
        }
        return [h('td', label), h('td', [children])]
      }
    }
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const { headers, originData, currentData, rowSize = 2 } = this.config || {}
    return {
      headers,
      originData,
      currentData,
      rowSize
    }
  },
  computed: {
    columns: ({ headers, rowSize }) => chunk(headers, rowSize)
  },
  mounted() {
    const { columns } = this; const last = columns[columns.length - 1]; const lastTwo = columns[columns.length - 2]
    if (lastTwo) {
      for (let i = 0; i < (lastTwo.length - last.length); i++) {
        this.headers.push({ prop: '', label: '' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.portait-table{
  border-collapse: collapse;
  border: none;
  width:100%;
  font-size: 15px;
  td {
    border: 0.5px solid #F0F0F0;
    padding: 10px 18px;
    &:nth-child(odd){
      background-color: #FAFAFA;
    }
    span {
      &:nth-child(even){
        color: #409eff;
        margin-left: 20px;
      }
    }
  }
}
</style>
