const mapIdAndKey = list => list.reduce((c, i) => ({ ...c, [i.key]: i }), {})

const STATUS = {
  disabled: mapIdAndKey([
    {
      key: '0',
      val: '否'
    },
    {
      key: '1',
      val: '是'
    }
  ]),
  deployArea: mapIdAndKey([
    { key: '0', val: '标准区' },
    { key: '1', val: '集团域' },
    { key: '2', val: '建行域' },
    { key: '3', val: '子公司' }
  ])
}

export default {
  functional: true,
  render(h, { props: { value, Enum, empty }, parent }) {
    const enums = Object.assign({}, STATUS, parent.$store.getters.dictionary)
    const { name = '', getVal = (values, v) => values[v] } = Enum; const _value = getVal(enums[name], value)

    if (_value === undefined) return h('span', _value === undefined ? empty : _value)

    const { id, val } = _value
    return h('span', { staticClass: id }, [h('span', val)])
  }
}
