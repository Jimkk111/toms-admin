<template>
  <n-form
    ref="formRef"
    :model="model"
    :rules="rules"
    :label-placement="labelPlacement"
    :label-width="labelWidth"
    :inline="inline"
    v-bind="$attrs"
  >
    <n-form-item
      v-for="item in items"
      :key="item.key"
      :path="item.key"
      :label="item.label"
    >
      <!-- 具名插槽逃生口：配置覆盖不了的复杂内容（如动态口味配置）用它 -->
      <slot
        :name="item.key"
        :item="item"
      >
        <n-input
          v-if="!item.type || item.type === 'input'"
          :value="getText(item.key)"
          :placeholder="item.placeholder ?? '请输入'"
          clearable
          :maxlength="item.maxlength"
          :style="widthStyle(item)"
          @keyup.enter="emit('enter')"
          @update:value="(v: string | null) => setField(item.key, v)"
        />
        <n-input
          v-else-if="item.type === 'password'"
          :value="getText(item.key)"
          type="password"
          :placeholder="item.placeholder ?? '请输入'"
          :style="widthStyle(item)"
          @keyup.enter="emit('enter')"
          @update:value="(v: string | null) => setField(item.key, v)"
        />
        <n-input
          v-else-if="item.type === 'textarea'"
          :value="getText(item.key)"
          type="textarea"
          :rows="item.rows ?? 3"
          :placeholder="item.placeholder ?? '请输入'"
          :maxlength="item.maxlength"
          :style="widthStyle(item)"
          @update:value="(v: string | null) => setField(item.key, v)"
        />
        <n-input-number
          v-else-if="item.type === 'number'"
          :value="getNumber(item.key)"
          :placeholder="item.placeholder ?? '请输入'"
          :style="widthStyle(item)"
          @update:value="(v: number | null) => setField(item.key, v)"
        />
        <n-select
          v-else-if="item.type === 'select'"
          :value="getSelect(item.key)"
          :options="item.options ?? []"
          :placeholder="item.placeholder ?? '请选择'"
          clearable
          :style="widthStyle(item)"
          @update:value="(v: string | number | null) => setField(item.key, v)"
        />
        <n-radio-group
          v-else-if="item.type === 'radio'"
          :value="getSelect(item.key)"
          @update:value="(v: string | number) => setField(item.key, v)"
        >
          <n-radio
            v-for="opt in item.options ?? []"
            :key="String(opt.value)"
            :value="opt.value"
          >
            {{ opt.label }}
          </n-radio>
        </n-radio-group>
        <n-date-picker
          v-else-if="item.type === 'datetimerange'"
          :formatted-value="getRange(item.key)"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          clearable
          :style="widthStyle(item)"
          @update:formatted-value="(v: [string, string] | null) => setField(item.key, v)"
        />
      </slot>
    </n-form-item>

    <!-- 操作区：查询/保存/取消等按钮由调用方决定 -->
    <slot name="actions" />
  </n-form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormInst, FormItemRule } from 'naive-ui'
import type { FormItemOption } from '@/types/form'

defineOptions({ name: 'CommonForm', inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** 表单项配置 */
    items: FormItemOption[]
    labelPlacement?: 'left' | 'top'
    labelWidth?: number | string
    inline?: boolean
  }>(),
  {
    labelPlacement: 'left',
    labelWidth: 100,
    inline: false,
  },
)

const emit = defineEmits<{ enter: [] }>()

// 父组件直接传 reactive 对象（:model="ruleForm"），组件写入其字段，无需 update 事件
const model = defineModel<Record<string, unknown>>('model', { required: true })

const formRef = ref<FormInst | null>(null)

// ---- 字段读写（n-* 控件的 value 类型各不相同，集中在这里收口） ----
const getText = (key: string) => (model.value[key] ?? null) as string | null
const getNumber = (key: string) => (model.value[key] ?? null) as number | null
const getSelect = (key: string) => (model.value[key] ?? null) as string | number | null
const getRange = (key: string) => (model.value[key] ?? null) as [string, string] | null
const setField = (key: string, v: unknown) => {
  model.value[key] = v
}

const widthStyle = (item: FormItemOption) => (item.width ? { width: item.width } : undefined)

// ---- 校验规则：required 生成默认规则，item.rule 可追加/覆盖 ----
const rules = computed<Record<string, FormItemRule[]>>(() => {
  const result: Record<string, FormItemRule[]> = {}
  for (const item of props.items) {
    const list: FormItemRule[] = item.rule
      ? Array.isArray(item.rule)
        ? [...item.rule]
        : [item.rule]
      : []
    if (item.required && !list.some((r) => r.required)) {
      const trigger = ['select', 'radio', 'datetimerange'].includes(item.type ?? 'input')
        ? 'change'
        : 'blur'
      list.unshift({ required: true, message: `${item.label}不能为空`, trigger })
    }
    if (list.length) result[item.key] = list
  }
  return result
})

/** 校验，通过返回 true，失败返回 false（失败信息由表单自行展示） */
const validate = async () => {
  try {
    await formRef.value?.validate()
    return true
  } catch {
    return false
  }
}

/** 清空校验状态 */
const restoreValidation = () => formRef.value?.restoreValidation()

defineExpose({ validate, restoreValidation })
</script>
