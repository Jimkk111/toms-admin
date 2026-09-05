<template>
  <div class="add-employee">
    <HeadLable
      :title="title"
      :goback="true"
    />
    <div class="container">
      <n-form
        ref="formRef"
        :model="ruleForm"
        :rules="rules"
        label-placement="left"
        label-width="180"
      >
        <n-form-item
          label="账号:"
          path="username"
        >
          <n-input
            v-model:value="ruleForm.username"
            placeholder="请输入账号"
            :maxlength="20"
          />
        </n-form-item>
        <n-form-item
          label="员工姓名:"
          path="name"
        >
          <n-input
            v-model:value="ruleForm.name"
            placeholder="请输入员工姓名"
            :maxlength="12"
          />
        </n-form-item>
        <n-form-item
          label="手机号:"
          path="phone"
        >
          <n-input
            v-model:value="ruleForm.phone"
            placeholder="请输入手机号"
            :maxlength="11"
          />
        </n-form-item>
        <n-form-item
          label="性别:"
          path="sex"
        >
          <n-radio-group v-model:value="ruleForm.sex">
            <n-radio value="男">男</n-radio>
            <n-radio value="女">女</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item
          label="身份证号:"
          path="idNumber"
          class="id-number"
        >
          <n-input
            v-model:value="ruleForm.idNumber"
            placeholder="请输入身份证号"
            :maxlength="20"
          />
        </n-form-item>
        <div class="sub-box">
          <n-button @click="router.push('/employee')">取消</n-button>
          <n-button
            type="primary"
            @click="submitForm(false)"
          >
            保存
          </n-button>
          <n-button
            v-if="actionType === 'add'"
            type="primary"
            @click="submitForm(true)"
          >
            保存并继续添加
          </n-button>
        </div>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInst, FormItemRule } from 'naive-ui'
import { queryEmployeeById, addEmployee, editEmployee } from '@/api/employee'
import type { EmployeeForm } from '@/api/employee'
import { message } from '@/utils/feedback'
import HeadLable from '@/components/HeadLable/index.vue'

defineOptions({ name: 'AddEmployee' })

const route = useRoute()
const router = useRouter()

const formRef = ref<FormInst | null>(null)
const actionType = ref<'add' | 'edit'>('add')
const title = ref('添加员工')

const ruleForm = reactive<EmployeeForm>({
  username: '',
  name: '',
  phone: '',
  sex: '男',
  idNumber: '',
})

const validateUsername = (_rule: FormItemRule, value: string) => {
  if (!value) return new Error('请输入账号')
  if (!/^([a-z]|[0-9]){3,20}$/.test(value)) {
    return new Error('账号输入不符，请输入3-20个字符')
  }
  return true
}

const validatePhone = (_rule: FormItemRule, value: string) => {
  if (!value) return new Error('请输入手机号')
  if (!/^1(3|4|5|6|7|8)\d{9}$/.test(value)) return new Error('请输入正确的手机号!')
  return true
}

const validateIdNumber = (_rule: FormItemRule, value: string) => {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  if (!value) return new Error('请输入身份证号码')
  if (!reg.test(value)) return new Error('身份证号码不正确')
  return true
}

const rules: Record<string, FormItemRule[]> = {
  username: [{ required: true, validator: validateUsername, trigger: 'blur' }],
  name: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  idNumber: [{ required: true, validator: validateIdNumber, trigger: 'blur' }],
}

const init = async () => {
  const id = route.query.id
  const { data } = await queryEmployeeById(id as string)
  if (String(data.code) === '1') {
    Object.assign(ruleForm, data.data, {
      sex: data.data.sex === '0' ? '女' : '男',
    })
  } else {
    message.error(data.msg ?? '查询失败')
  }
}

onMounted(() => {
  if (route.query.id) {
    actionType.value = 'edit'
    title.value = '修改员工信息'
    init()
  }
})

const submitForm = async (keepAdding: boolean) => {
  const valid = await formRef.value?.validate().catch(() => null)
  if (valid === null) return

  const params: EmployeeForm = {
    ...ruleForm,
    sex: ruleForm.sex === '女' ? '0' : '1',
  }
  const { data } =
    actionType.value === 'add' ? await addEmployee(params) : await editEmployee(params)
  if (String(data.code) === '1') {
    message.success(actionType.value === 'add' ? '员工添加成功！' : '员工信息修改成功！')
    if (actionType.value === 'add' && keepAdding) {
      ruleForm.username = ''
      ruleForm.name = ''
      ruleForm.phone = ''
      ruleForm.idNumber = ''
      ruleForm.sex = '男'
      return
    }
    router.push('/employee')
  } else {
    message.error(data.msg ?? '操作失败')
  }
}
</script>

<style lang="scss" scoped>
.add-employee {
  .container {
    position: relative;
    z-index: 1;
    background: #fff;
    padding: 30px;
    border-radius: 4px;
  }

  :deep(.n-form-item) {
    margin-bottom: 29px;
  }

  :deep(.n-input) {
    width: 293px;
  }

  .id-number {
    margin-bottom: 39px;
  }

  .sub-box {
    padding-top: 30px;
    text-align: center;
    border-top: solid 1px $gray-5;
    display: flex;
    justify-content: center;
    gap: 14px;
  }
}
</style>
