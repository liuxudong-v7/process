<script>
// 自定义内容的组件
export default {
  name: 'ExSolt',
  functional: true,
  props: {
    row: {
      type: Object,
      default: null
    },
    render: {
      type: Function,
      default: null
    },
    index: {
      type: Number,
      default: null
    },
    column: {
      type: Object,
      default: null
    }
  },
  render: (h, data) => {
    const params = {
      row: data.props.row,
      index: data.props.index,
      size: 'mini'
    }
    if (data.props.column) params.column = data.props.column
    return data.props.render(h, params)
  }
}
</script>
