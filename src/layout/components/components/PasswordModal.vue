<template>
  <n-modal
    :show="show"
    preset="card"
    title="修改密码"
    style="width: 568px"
    @update:show="handleClose"
  >
    <CommonForm
      ref="formRef"
      :model="form"
      :items="items"
      label-width="85"
    />
    <template #footer>
      <div class="modal-footer">
        <n-button @click="handleClose(false)">取 消</n-button>
        <n-button
          type="primary"
          @click="handleSave"
        >
          保 存
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormItemRule } from 'naive-ui'
import { editPassword } from '@/api/users'
import { message } from '@/utils/feedback'
import CommonForm from '@/components/Common/CommonForm.vue'
import type { FormItemOption } from '@/types/form'

defineOptions({ name: 'PasswordModal' })

const show = defineModel<boolean>('show', { default: false })

const formRef = ref<InstanceType<typeof CommonForm> | null>(null)
const form = reactive({
  oldPassword: '',
  newPassword: '',
  affirmPassword: '',
})

const validatePwd = (_rule: FormItemRule, value: string) => {
  const reg = /^[0-9A-Za-z]{6,20}$/
  if (!value) return new Error('请输入')
  if (!reg.test(value)) return new Error('6 - 20位密码，数字或字母，区分大小写')
  return true
}

const validatePass2 = (_rule: FormItemRule, value: string) => {
  if (!value) return new Error('请再次输入密码')
  if (value !== form.newPassword) return new Error('密码不一致，请重新输入密码')
  return true
}

const items: FormItemOption[] = [
  { key: 'oldPassword', label: '原始密码：', type: 'password', required: true, rule: { validator: validatePwd, trigger: 'blur' } },
  { key: 'newPassword', label: '新密码：', type: 'password', required: true, rule: { validator: validatePwd, trigger: 'blur' } },
  { key: 'affirmPassword', label: '确认密码：', type: 'password', required: true, rule: { validator: validatePass2, trigger: 'blur' } },
]

watch(
  () => show.value,
  (val) => {
    if (val) {
      form.oldPassword = ''
      form.newPassword = ''
      form.affirmPassword = ''
      formRef.value?.restoreValidation()
    }
  },
)

const handleClose = (visible: boolean) => {
  show.value = visible
  formRef.value?.restoreValidation()
  form.oldPassword = ''
  form.newPassword = ''
  form.affirmPassword = ''
}

const handleSave = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value
    ?.validate()
    .then(async (valid) => {
      if (!valid) return
      await editPassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      message.success('修改成功')
      handleClose(false)
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
