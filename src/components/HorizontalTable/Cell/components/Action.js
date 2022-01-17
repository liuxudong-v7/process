const getAcitons = (h, value, data) => {
  const result = value.filter(n => {
    const { filter = () => true } = n
    return filter.call(n, data)
  })

  return result.map(a => h('span', { class: 'btn', on: { click: () => a.click(data) }, key: a.prop }, a.label))
}

export default {
  functional: true,
  render: (h, { props: { value, data }}) => {
    return h('div', { class: 'action' }, getAcitons(h, value, data))
  }
}
