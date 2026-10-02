<template>
  <n-data-table
    :data="isRemote ? tableData : (data ?? [])"
    :columns="columns"
    :remote="isRemote"
    :loading="isRemote && loading"
    :pagination="isRemote ? pagination : undefined"
    v-bind="$attrs"
  >
    <!-- 透传所有插槽（empty、summary 等）给 n-data-table -->
    <template
      v-for="(_, name) in $slots"
      :key="name"
      #[name]="slotProps"
    >
    <!-- 这是页面传给DataTable的内容 -->
      <slot
        :name="name"
        v-bind="slotProps ?? {}"
      />
    </template>
  </n-data-table>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, onMounted, ref, watch } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import type { PageData } from '@/types/api'

defineOptions({ name: 'DataTable', inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** 列配置（同 n-data-table columns） */
    columns: DataTableColumns<T>
    /** 本地模式：直接传入的数据；传入 reqFn 时忽略 */
    data?: T[]
    /** 远程模式：分页请求函数，返回 { records, total }（与后端分页契约一致） */
    reqFn?: (params: {
      page: number
      pageSize: number
      /** 附加查询参数（筛选条件等），由调用方通过 params prop 传入 */
      [key: string]: unknown
    }) => Promise<PageData<T>>
    /** 附加查询参数，变化时自动重置到第 1 页重新查询 */
    params?: Record<string, unknown>
    /** 远程模式下挂载时是否自动查询 */
    immediate?: boolean
  }>(),
  {
    data: () => [],
    reqFn: undefined,
    params: () => ({}),
    immediate: true,
  },
)

// reqFn 存在即远程模式；未传 reqFn 时是纯展示的本地表格
const isRemote = computed(() => !!props.reqFn)

// 远程模式的数据由组件内部持有（不是 props.data 的拷贝）
const tableData = ref<T[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const pagination = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  itemCount: total.value,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 40],
  onChange: handlePageChange,
  onUpdatePageSize: handlePageSizeChange,
}))

const fetchData = async () => {
  if (!props.reqFn) return
  loading.value = true
  try {
    // 请求异常由 request.ts 拦截器统一提示，这里只需终止 loading
    const res = await props.reqFn({ page: page.value, pageSize: pageSize.value, ...props.params })
    tableData.value = res?.records ?? []
    total.value = Number(res?.total ?? 0)
  } catch {
    /* 已由拦截器提示 */
  } finally {
    loading.value = false
  }
}

/** 查询；resetPage 为 true 时回到第 1 页（筛选条件变化时用） */
const search = (resetPage = false) => {
  if (!isRemote.value) return Promise.resolve()
  if (resetPage) page.value = 1
  return fetchData()
}

const handlePageChange = (newPage: number) => {
  page.value = newPage
  fetchData()
}

const handlePageSizeChange = (newPageSize: number) => {
  pageSize.value = newPageSize
  // 每页条数变化后回到第 1 页，避免停在超出的页码上
  page.value = 1
  fetchData()
}

// 筛选参数变化：重置页码重新查询
watch(
  () => props.params,
  () => search(true),
  { deep: true },
)

onMounted(() => {
  if (isRemote.value && props.immediate) fetchData()
})

defineExpose({ search, tableData })
</script>
