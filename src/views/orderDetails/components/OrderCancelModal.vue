<template>
  <n-modal
    :show="show"
    preset="card"
    :title="title + '原因'"
    style="width: 42%"
    @update:show="handleClose"
  >
    <CommonForm
      :model="form"
      :items="items"
      label-width="90"
    />
    <template #footer>
      <div class="dialog-footer">
        <n-button @click="handleClose(false)">取 消</n-button>
        <n-button
          type="primary"
          @click="confirm"
        >
          确 定
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { message } from '@/utils/feedback'
import CommonForm from '@/components/Common/CommonForm.vue'
import type { FormItemOption } from '@/types/form'

defineOptions({ name: 'OrderCancelModal' })

const props = defineProps<{
  show: boolean
  /** 取消 / 拒绝 */
  title: string
}>()

const emit = defineEmits<{
  'update:show': [visible: boolean]
  confirm: [reason: string]
}>()

const form = reactive({
  cancelReason: '',
  remark: '',
})

const cancelOrderReasonList = [
  '订单量较多，暂时无法接单',
  '菜品已销售完，暂时无法接单',
  '餐厅已打烊，暂时无法接单',
  '自定义原因',
]

const cancelrReasonList = [
  '订单量较多，暂时无法接单',
  '菜品已销售完，暂时无法接单',
  '骑手不足无法配送',
  '客户电话取消',
  '自定义原因',
]

const options = computed(() =>
  (props.title === '取消' ? cancelrReasonList : cancelOrderReasonList).map((label) => ({
    label,
    value: label,
  })),
)

const items = computed<FormItemOption[]>(() => [
  {
    key: 'cancelReason',
    label: `${props.title}原因：`,
    type: 'select',
    options: options.value,
    placeholder: `请选择${props.title}原因`,
  },
  ...(form.cancelReason === '自定义原因'
    ? [
        {
          key: 'remark',
          label: '原因：',
          type: 'textarea' as const,
          placeholder: `请填写您${props.title}的原因（限20字内）`,
          maxlength: 20,
          width: '100%',
        },
      ]
    : []),
])

watch(
  () => props.show,
  (val) => {
    if (val) {
      form.cancelReason = ''
      form.remark = ''
    }
  },
)

const handleClose = (visible: boolean) => {
  emit('update:show', visible)
  if (!visible) form.cancelReason = ''
}

const confirm = () => {
  if (!form.cancelReason) {
    message.error(`请选择${props.title}原因`)
    return
  }
  if (form.cancelReason === '自定义原因' && !form.remark) {
    message.error(`请输入${props.title}原因`)
    return
  }
  emit('confirm', form.cancelReason === '自定义原因' ? form.remark : form.cancelReason)
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
