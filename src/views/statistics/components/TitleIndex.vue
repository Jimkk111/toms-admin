<template>
  <div class="title-index">
    <div class="month">
      <ul class="tabs">
        <li
          v-for="(item, index) in tabsParam"
          :key="index"
          class="li-tab"
          :class="{ active: index === nowIndex }"
          @click="toggleTabs(index)"
        >
          {{ item }}
          <span />
        </li>
      </ul>
    </div>
    <div class="get-time">
      <p>已选时间：{{ dateRange[0] }} 至 {{ dateRange[1] }}</p>
    </div>
    <n-button
      class="right-el-button"
      @click="handleExport"
    >
      <template #icon>
        <i class="iconfont icon-download" />
      </template>
      数据导出
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { exportInfo } from '@/api/workspace'
import { dialog } from '@/utils/feedback'

defineOptions({ name: 'TitleIndex' })

const props = defineProps<{ dateRange: [string, string] }>()

const emit = defineEmits<{ sendTitleInd: [index: number] }>()

const nowIndex = ref(1) // 默认近7日（对应 flag=2）
const tabsParam = ['昨日', '近7日', '近30日', '本周', '本月']

const toggleTabs = (index: number) => {
  nowIndex.value = index
  emit('sendTitleInd', index + 1)
}

const handleExport = () => {
  dialog.warning({
    title: '提示',
    content: '是否确认导出最近30天运营数据?',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { data } = await exportInfo()
      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      document.body.appendChild(a)
      a.href = url
      a.download = '运营数据统计报表.xlsx'
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    },
  })
}

// 保留 props 引用避免未使用告警
void props
</script>

<style lang="scss" scoped>
.title-index {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 4px;
  padding: 15px 20px;
  margin-bottom: 15px;

  .tabs {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;

    .li-tab {
      padding: 6px 20px;
      margin-right: 10px;
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
      color: #333;

      &.active {
        background: #289ADD;
        color: #ffffff;
        font-weight: 700;
      }
    }
  }

  .get-time {
    margin-left: 20px;
    font-size: 13px;
    color: #818693;
  }

  .right-el-button {
    margin-left: auto;
    background: #333333;
    color: #fff;
  }
}
</style>
