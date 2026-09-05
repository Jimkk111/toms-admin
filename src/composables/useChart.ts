import * as echarts from 'echarts'
import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

/**
 * ECharts 生命周期封装：init / setOption / resize / dispose。
 * option 变化时自动重绘。
 */
export function useChart(
  elRef: Ref<HTMLElement | null>,
  optionGetter: () => echarts.EChartsOption | null,
) {
  let chart: echarts.ECharts | null = null
  const ready = ref(false)

  const resize = () => chart?.resize()

  const render = () => {
    if (!elRef.value) return
    if (!chart) {
      chart = echarts.init(elRef.value)
      window.addEventListener('resize', resize)
      ready.value = true
    }
    const option = optionGetter()
    if (option) chart.setOption(option, true)
  }

  const watchSource = () => optionGetter()

  onMounted(() => {
    nextTick(render)
  })

  watch(watchSource, () => nextTick(render), { deep: true })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    chart?.dispose()
    chart = null
  })

  return { render, ready }
}
