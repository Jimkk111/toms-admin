<template>
  <div class="container">
    <div class="tableBar">
      <div class="search-area">
        <span class="label">员工姓名：</span>
        <n-input
          v-model:value="input"
          placeholder="请输入员工姓名"
          clearable
          style="width: 200px"
          @clear="doSearch"
          @keyup.enter="doSearch"
        />
        <n-button
          class="normal-btn"
          @click="doSearch"
        >
          查询
        </n-button>
      </div>
      <n-button
        type="primary"
        @click="router.push('/employee/add')"
      >
        + 添加员工
      </n-button>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :req-fn="fetcher"
      :params="queryParams"
      :row-key="(row: EmployeeItem) => row.id"
    >
      <template #empty>
        <Empty :is-search="isSearch" />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, type DataTableColumns } from 'naive-ui'
import { getEmployeeList, enableOrDisableEmployee } from '@/api/employee'
import type { EmployeeItem } from '@/api/employee'
import { message, dialog } from '@/utils/feedback'
import DataTable from '@/components/Common/DataTable.vue'
import type { DataTableExpose } from '@/types/components'
import Empty from '@/components/Empty/index.vue'

defineOptions({ name: 'Employee' })

const router = useRouter()
const input = ref('')
const isSearch = ref(false)
const queryParams = ref<Record<string, unknown>>({})
const tableRef = ref<DataTableExpose | null>(null)

const doSearch = () => {
  isSearch.value = true
  queryParams.value = { name: input.value || undefined }
}

async function fetcher(params: { page: number; pageSize: number }) {
  const { data } = await getEmployeeList({
    ...params,
    name: input.value || undefined,
  })
  return data.data
}

const isAdmin = (row: EmployeeItem) => row.username === 'admin'

const renderTextBtn = (
  label: string,
  cls: string,
  row: EmployeeItem,
  onClick: () => void,
) =>
  h(
    NButton,
    {
      text: true,
      size: 'small',
      class: [cls, { 'disabled-text': isAdmin(row) }],
      disabled: isAdmin(row),
      style: { marginRight: '12px' },
      onClick,
    },
    { default: () => label },
  )

const columns: DataTableColumns<EmployeeItem> = [
  { title: '员工姓名', key: 'name' },
  { title: '账号', key: 'username' },
  { title: '手机号', key: 'phone' },
  {
    title: '账号状态',
    key: 'status',
    render: (row) =>
      h(
        'div',
        { class: ['tableColumn-status', { 'stop-use': String(row.status) === '0' }] },
        { default: () => (String(row.status) === '0' ? '禁用' : '启用') },
      ),
  },
  { title: '最后操作时间', key: 'updateTime' },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    align: 'center',
    render: (row) => [
      renderTextBtn('修改', 'blueBug', row, () => {
        if (isAdmin(row)) return
        router.push({ path: '/employee/add', query: { id: row.id } })
      }),
      renderTextBtn(
        String(row.status) === '1' ? '禁用' : '启用',
        String(row.status) === '1' ? 'delBut' : 'blueBug',
        row,
        () => statusHandle(row),
      ),
    ],
  },
]

const statusHandle = (row: EmployeeItem) => {
  if (isAdmin(row)) return
  dialog.warning({
    title: '提示',
    content: '确认调整该账号的状态?',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { data } = await enableOrDisableEmployee({
        id: row.id,
        status: String(row.status) === '0' ? 1 : 0,
      })
      if (String(data.code) === '1') {
        message.success('账号状态更改成功！')
        tableRef.value?.search()
      } else {
        message.error(data.msg ?? '操作失败')
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.search-area {
  display: flex;
  align-items: center;

  .label {
    margin-right: 10px;
    font-size: 14px;
    color: #333;
  }
}

.normal-btn {
  margin-left: 20px;
  background: #333333;
  color: #fff;
}
</style>
