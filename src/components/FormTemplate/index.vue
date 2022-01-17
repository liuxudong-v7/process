<template>
  <el-form-item v-if="temp.showForm !== false" :prop="temp.param" :label="temp.label">
    <template v-if="temp.editor === 'text'">
      <el-input :disabled="temp.disabled || false" :type="temp.type || 'text'" :value="value" :size="temp.size || 'small'" :placeholder="temp.placeholder || temp.label" clearable @input="handleChange" />
    </template>
    <template v-if="temp.editor === 'select' ">
      <el-select
        :value="value"
        filterable
        :disabled="temp.disabled"
        :size="temp.size || 'small'"
        :placeholder="temp.placeholder || temp.label"
        style="width:100%;"
        @input="handleChange"
      >
        <el-option
          v-for="option in temp.options"
          :key="option.key"
          :label="option.value"
          :value="option.key"
        />
      </el-select>
    </template>
    <template v-if="temp.editor === 'cascader' ">
      <el-cascader
        :options="temp.options"
        :value="value"
        :props="{ expandTrigger: 'hover' }"
        :show-all-levels="false"
        clearable
        :size="temp.size || 'small'"
        style="width: 100%;"
        @input="handleChange"
      />
    </template>
    <template v-if="temp.editor === 'date'">
      <el-date-picker
        :value="value"
        :size="temp.size || 'small'"
        :placeholder="temp.placeholder || temp.label"
        :picker-options="temp.pickerOptions"
        v-bind="$attrs"
        type="date"
        style="width: 100%;"
        format="yyyy 年 MM 月 dd 日"
        value-format="yyyyMMdd"
        clearable
        @input="handleChange"
      />
    </template>
    <template v-if="temp.editor === 'textare'">
      <el-input :rows="4" :value="value" :size="temp.size || 'small'" :maxlength="temp.maxlength || '100'" show-word-limit :placeholder="temp.placeholder || temp.label" type="textarea" resize="none" @input="handleChange" />
    </template>
    <template v-if="temp.editor === 'treeSelect'">
      <Treeselect :multiple="false" :value="value" :size="temp.size || 'small'" :options="temp.options || []" @input="handleChange" />
    </template>
  </el-form-item>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'FormTemplate',
  components: { Treeselect },
  props: {
    temp: {
      type: Object,
      default: () => {}
    },
    value: {
      type: [String, Number, Date],
      default: ''
    }
  },
  computed: {
    // inputSize() {
    //   return this.$store.state.styles.inputSize
    // }
  },
  methods: {
    handleChange(val) {
      const data = {
        value: val,
        item: this.temp
      }
      this.$emit('input', data)
    }
  }
}
</script>
