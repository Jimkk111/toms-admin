<template>
  <div class="navbar">
    <div class="left">
      <Hamburger
        :is-active="appStore.sidebarOpened"
        class="hamburger-container"
        @toggle-click="appStore.toggleSidebar()"
      />
      <span :class="['business-btn', { closing: status !== 1 }]">
        {{ status === 1 ? '营业中' : '打烊中' }}
      </span>
    </div>

    <div class="right">
      <span
        class="navicon operating-state"
        @click="statusModalVisible = true"
      >
        <img
          src="@/assets/icons/time.png"
          alt=""
        />
        营业状态设置
      </span>

      <n-dropdown
        trigger="hover"
        :options="userOptions"
        @select="handleUserAction"
      >
        <n-button class="user-btn">
          {{ userStore.name }}
          <img
            class="arrow"
            src="@/assets/icons/up.png"
            alt=""
          />
        </n-button>
      </n-dropdown>
    </div>

    <!-- 营业状态弹层 -->
    <n-modal
      v-model:show="statusModalVisible"
      preset="card"
      title="营业状态设置"
      style="width: 420px"
    >
      <n-radio-group v-model:value="setStatusValue">
        <div class="status-option">
          <n-radio :value="1">
            营业中
            <p>当前餐厅处于营业状态，自动接收任何订单，可点击打烊进入店铺打烊状态。</p>
          </n-radio>
        </div>
        <div class="status-option">
          <n-radio :value="0">
            打烊中
            <p>当前餐厅处于打烊状态，仅接受营业时间内的预定订单，可点击营业中手动恢复营业状态。</p>
          </n-radio>
        </div>
      </n-radio-group>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="statusModalVisible = false">取 消</n-button>
          <n-button
            type="primary"
            @click="handleSaveStatus"
          >
            确 定
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 修改密码 -->
    <PasswordModal v-model:show="pwdModalVisible" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { getStatus, setStatus } from '@/api/users'
import Hamburger from '@/components/Hamburger/index.vue'
import PasswordModal from '../components/PasswordModal.vue'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// 营业状态
const status = ref(1)
const setStatusValue = ref(1)
const statusModalVisible = ref(false)

const fetchStatus = async () => {
  const { data } = await getStatus()
  status.value = data.data
  setStatusValue.value = data.data
}

const handleSaveStatus = async () => {
  const { data } = await setStatus(setStatusValue.value)
  if (String(data.code) === '1') {
    statusModalVisible.value = false
    fetchStatus()
  }
}

// 用户下拉
const userOptions = [
  { label: '修改密码', key: 'password' },
  { label: '退出登录', key: 'logout' },
]
const pwdModalVisible = ref(false)

const handleUserAction = async (key: string) => {
  if (key === 'password') {
    pwdModalVisible.value = true
  } else if (key === 'logout') {
    await userStore.logout()
    router.replace('/login')
  }
}

onMounted(fetchStatus)
</script>

<style lang="scss" scoped>
.navbar {
  flex-shrink: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffc100;
  padding-right: 20px;

  .left {
    display: flex;
    align-items: center;
    height: 100%;

    .hamburger-container {
      padding: 0 12px 0 20px;
      cursor: pointer;
      height: 100%;
      display: flex;
      align-items: center;

      &:hover {
        background: rgba(0, 0, 0, 0.025);
      }
    }
  }

  .business-btn {
    height: 22px;
    line-height: 20px;
    background: #fd3333;
    border: 1px solid #ffffff;
    border-radius: 4px;
    display: inline-block;
    padding: 0 6px;
    color: #fff;
    font-size: 12px;

    &.closing {
      background: #6a6a6a;
    }
  }

  .right {
    display: flex;
    align-items: center;
    color: #333333;
    font-size: 14px;

    .navicon {
      padding: 0 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      height: 32px;

      &:hover {
        background: rgba(255, 255, 255, 0.52);
      }

      img {
        width: 18px;
        height: 18px;
        margin-right: 4px;
      }
    }

    .user-btn {
      margin-left: 18px;
      width: 120px;
      justify-content: flex-start;
      text-align: left;
      background: rgba(255, 255, 255, 0.52);
      color: #333;

      .arrow {
        width: 8px;
        height: 8px;
        position: absolute;
        right: 16px;
      }
    }
  }
}

.status-option {
  background: #fbfbfa;
  border: 1px solid #e5e4e4;
  border-radius: 4px;
  padding: 14px 22px;
  margin-top: 20px;

  p {
    line-height: 20px;
    padding-top: 12px;
    color: #666;
    font-weight: normal;
    white-space: normal;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
