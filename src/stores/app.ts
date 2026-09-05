import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getSidebarStatus, setSidebarStatus } from '@/utils/cookies'

export type DeviceType = 'desktop' | 'mobile'

export const useAppStore = defineStore('app', () => {
  const sidebarOpened = ref(getSidebarStatus() !== 'closed')
  const device = ref<DeviceType>('desktop')

  function toggleSidebar() {
    sidebarOpened.value = !sidebarOpened.value
    setSidebarStatus(sidebarOpened.value ? 'opened' : 'closed')
  }

  function closeSidebar() {
    sidebarOpened.value = false
    setSidebarStatus('closed')
  }

  return { sidebarOpened, device, toggleSidebar, closeSidebar }
})
