/** DataTable 组件的实例暴露（泛型组件无法用 InstanceType 取类型，用这个约定） */
export interface DataTableExpose {
  search: (resetPage?: boolean) => Promise<void>
  tableData: Record<string, unknown>[]
}
