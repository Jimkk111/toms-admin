<template>
  <n-modal
    :show="show"
    preset="card"
    title="修改密码"
    style="width: 568px"
    @update:show="handleClose"
  >
    <n-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-placement="left"
      label-width="85"
    >
      <n-form-item
        label="原始密码："
        path="oldPassword"
      >
        <n-input
          v-model:value="form.oldPassword"
          type="password"
          placeholder="请输入"
        />
      </n-form-item>
      <n-form-item
        label="新密码："
        path="newPassword"
      >
        <n-input
          v-model:value="form.newPassword"
          type="password"
          placeholder="6 - 20位密码，数字或字母，区分大小写"
        />
      </n-form-item>
      <n-form-item
        label="确认密码："
        path="affirmPassword"
      >
        <n-input
          v-model:value="form.affirmPassword"
          type="password"
          placeholder="请输入"
        />
      </n-form-item>
    </n-form>
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
import { reactive, ref } from 'vue'
import type { FormInst, FormItemRule } from 'naive-ui'
import { editPassword } from '@/api/users'
import { message } from '@/utils/feedback'

defineOptions({ name: 'PasswordModal' })

const show = defineModel<boolean>('show', { default: false })

const formRef = ref<FormInst | null>(null)
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

const rules: Record<string, FormItemRule[]> = {
  oldPassword: [{ validator: validatePwd, trigger: 'blur' }],
  newPassword: [{ validator: validatePwd, trigger: 'blur' }],
  affirmPassword: [{ validator: validatePass2, trigger: 'blur' }],
}

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
    .then(async () => {
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
