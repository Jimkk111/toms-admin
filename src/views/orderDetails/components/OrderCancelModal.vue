<template>
  <n-modal
    :show="show"
    preset="card"
    :title="title + '原因'"
    style="width: 42%"
    @update:show="handleClose"
  >
    <n-form label-placement="left" label-width="90">
      <n-form-item :label="title + '原因：'">
        <n-select
          v-model:value="cancelReason"
          :placeholder="'请选择' + title + '原因'"
          :options="options"
        />
      </n-form-item>
      <n-form-item
        v-if="cancelReason === '自定义原因'"
        label="原因："
      >
        <n-input
          v-model:value="remark"
          type="textarea"
          :placeholder="'请填写您' + title + '的原因（限20字内）'"
          :maxlength="20"
        />
      </n-form-item>
    </n-form>
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
import { computed, ref, watch } from 'vue'
import { message } from '@/utils/feedback'

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

const cancelReason = ref('')
const remark = ref('')

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

watch(
  () => props.show,
  (val) => {
    if (val) {
      cancelReason.value = ''
      remark.value = ''
    }
  },
)

const handleClose = (visible: boolean) => {
  emit('update:show', visible)
  if (!visible) cancelReason.value = ''
}

const confirm = () => {
  if (!cancelReason.value) {
    message.error(`请选择${props.title}原因`)
    return
  }
  if (cancelReason.value === '自定义原因' && !remark.value) {
    message.error(`请输入${props.title}原因`)
    return
  }
  emit('confirm', cancelReason.value === '自定义原因' ? remark.value : cancelReason.value)
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
