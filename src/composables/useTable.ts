import { computed, ref, type Ref } from 'vue'

export interface PageResult<T> {
  records: T[]
  total: number | string
}

export interface TablePageParams {
  page: number
  pageSize: number
}

/**
 * 列表页通用状态：分页、loading、数据、刷新。
 * 后端分页契约固定为 { records, total }（见 /category/page、/employee/list 等）。
 */
export function useTable<T>(
  fetcher: (params: TablePageParams) => Promise<PageResult<T>>,
) {
  const loading = ref(false)
  const tableData = ref<T[]>([]) as Ref<T[]>
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  async function search(resetPage = false) {
    if (resetPage) page.value = 1
    loading.value = true
    try {
      const res = await fetcher({ page: page.value, pageSize: pageSize.value })
      tableData.value = res?.records ?? []
      total.value = Number(res?.total ?? 0)
    } finally {
      loading.value = false
    }
  }

  function handlePageChange(p: number) {
    page.value = p
    search()
  }

  function handlePageSizeChange(s: number) {
    pageSize.value = s
    search()
  }

  /** 传给 n-data-table :pagination 的远程分页配置 */
  const pagination = computed(() => ({
    page: page.value,
    pageSize: pageSize.value,
    itemCount: total.value,
    showSizePicker: true,
    pageSizes: [10, 20, 30, 40],
    onChange: handlePageChange,
    onUpdatePageSize: handlePageSizeChange,
  }))

  return {
    loading,
    tableData,
    page,
    pageSize,
    total,
    pagination,
    search,
    handlePageChange,
    handlePageSizeChange,
  }
}
