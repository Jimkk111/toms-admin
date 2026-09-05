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
      <div class="right-audio">
        <audio ref="audioNew"><source src="@/assets/preview.mp3" type="audio/mp3" /></audio>
        <audio ref="audioReminder"><source src="@/assets/reminder.mp3" type="audio/mp3" /></audio>
      </div>
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
import { h, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { getStatus, setStatus } from '@/api/users'
import { useOrderWebSocket } from '@/composables/useOrderWebSocket'
import { notification } from '@/utils/feedback'
import Hamburger from '@/components/Hamburger/index.vue'
import PasswordModal from '../components/PasswordModal.vue'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// 订单实时通知：type 1 待接单 / 2 催单
const audioNew = ref<HTMLAudioElement | null>(null)
const audioReminder = ref<HTMLAudioElement | null>(null)

const { connect: connectSocket, close: closeSocket } = useOrderWebSocket({
  onMessage: (msg) => {
    if (audioNew.value) audioNew.value.currentTime = 0
    if (audioReminder.value) audioReminder.value.currentTime = 0
    if (msg.type === 1) audioNew.value?.play()
    else if (msg.type === 2) audioReminder.value?.play()

    const goOrder = () => {
      router.push(`/order?orderId=${msg.orderId}`)
      setTimeout(() => location.reload(), 100)
    }
    notification.create({
      title: msg.type === 1 ? '待接单' : '催单',
      duration: 0,
      content: () =>
        h(
          'span',
          { style: 'cursor:pointer', onClick: goOrder },
          msg.type === 1
            ? [
                h('span', null, '您有1个'),
                h('span', { style: 'color:#419EFF' }, '订单待处理'),
                h('span', null, `，${msg.content}，请及时接单`),
              ]
            : [
                h('span', null, msg.content),
                h('span', { style: 'color:#419EFF' }, '去处理'),
              ],
        ),
    })
  },
  onError: () => {
    notification.error({
      title: '错误',
      content: '服务器错误，无法接收实时通知',
      duration: 0,
    })
  },
})

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

onMounted(() => {
  fetchStatus()
  connectSocket()
})

onBeforeUnmount(closeSocket)
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
