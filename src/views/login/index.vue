<template>
  <div class="login">
    <div class="login-box">
      <img
        src="@/assets/login/login-l.png"
        alt=""
      />
      <div class="login-form">
        <n-form
          ref="formRef"
          :model="loginForm"
          :rules="loginRules"
          :show-label="false"
        >
          <div class="login-form-title">
            <img
              src="@/assets/login/icon_logo.png"
              style="width: 149px; height: 38px"
              alt="苍穹外卖"
            />
          </div>
          <n-form-item path="username">
            <n-input
              v-model:value="loginForm.username"
              placeholder="账号"
              class="underline-input"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <i class="iconfont icon-user" />
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="password">
            <n-input
              v-model:value="loginForm.password"
              type="password"
              placeholder="密码"
              class="underline-input"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <i class="iconfont icon-lock" />
              </template>
            </n-input>
          </n-form-item>
          <n-button
            type="primary"
            block
            class="login-btn"
            :loading="loading"
            attr-type="button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </n-button>
        </n-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInst, FormItemRule } from 'naive-ui'
import { useUserStore } from '@/stores/user'

defineOptions({ name: 'Login' })

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const loginForm = reactive({
  username: 'admin',
  password: '123456',
})

const loginRules: Record<string, FormItemRule[]> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    {
      validator: (_rule, value: string) =>
        value.length < 6 ? new Error('密码必须在6位以上') : true,
      trigger: 'blur',
    },
  ],
}

const handleLogin = (e?: MouseEvent | KeyboardEvent) => {
  e?.preventDefault()
  formRef.value
    ?.validate()
    .then(async () => {
      loading.value = true
      try {
        const res = await userStore.login(loginForm)
        if (String(res.code) === '1') {
          router.push('/')
        }
      } finally {
        loading.value = false
      }
    })
    .catch(() => {})
}
</script>

<style lang="scss">
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #333;
}

.login-box {
  width: 1000px;
  height: 474.38px;
  border-radius: 8px;
  display: flex;

  img {
    width: 60%;
    height: auto;
  }
}

.login-form {
  background: #ffffff;
  width: 40%;
  border-radius: 0 8px 8px 0;
  display: flex;
  justify-content: center;
  align-items: center;

  .n-form {
    width: 214px;
    height: 307px;
  }

  .n-form-item {
    margin-bottom: 30px;
  }

  .underline-input.n-input {
    --n-border-radius: 0;
    --n-border: none;
    --n-border-hover: none;
    --n-border-focus: none;
    --n-box-shadow-focus: none;
    --n-color: transparent;
    --n-color-focus: transparent;
    background: transparent;
    border-bottom: 1px solid #e9e9e8;
    font-size: 12px;

    ::placeholder {
      color: #aeb5c4;
    }
  }
}

.login-form-title {
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
}

.login-btn {
  border-radius: 17px;
  margin-top: 10px;
  font-weight: 500;
  font-size: 12px;
  color: #333333;
  background-color: #ffc200;

  &:hover,
  &:focus {
    background-color: #ffc200;
    color: #333333;
  }
}
</style>
