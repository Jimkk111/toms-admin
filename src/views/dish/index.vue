<template>
  <div class="container">
    <div class="tableBar">
      <div class="search-area">
        <span class="label">菜品名称：</span>
        <n-input
          v-model:value="input"
          placeholder="请填写菜品名称"
          clearable
          style="width: 180px"
          @clear="doSearch"
          @keyup.enter="doSearch"
        />

        <span class="label">菜品分类：</span>
        <n-select
          v-model:value="categoryId"
          placeholder="请选择"
          clearable
          :options="dishCategoryOptions"
          style="width: 160px"
          @clear="doSearch"
        />

        <span class="label">售卖状态：</span>
        <n-select
          v-model:value="dishStatus"
          placeholder="请选择"
          clearable
          :options="saleStatusOptions"
          style="width: 140px"
          @clear="doSearch"
        />

        <n-button
          class="normal-btn"
          @click="doSearch"
        >
          查询
        </n-button>
      </div>

      <div class="tableLab">
        <span
          class="delBut non batch-del"
          @click="deleteHandle('批量', null)"
        >
          批量删除
        </span>
        <n-button
          type="primary"
          @click="router.push('/dish/add')"
        >
          + 新建菜品
        </n-button>
      </div>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :req-fn="fetcher"
      :params="queryParams"
      :row-key="(row: DishItem) => row.id"
      :checked-row-keys="checkedKeys"
      @update:checked-row-keys="handleCheck"
    >
      <template #empty>
        <Empty :is-search="isSearch" />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NImage, type DataTableColumns } from 'naive-ui'
import { getDishPage, deleteDish, dishStatusByStatus, getCategoryList } from '@/api/dish'
import type { DishItem } from '@/api/dish'
import { message, dialog } from '@/utils/feedback'
import DataTable from '@/components/Common/DataTable.vue'
import type { DataTableExpose } from '@/types/components'
import Empty from '@/components/Empty/index.vue'
import noImg from '@/assets/noImg.png'

defineOptions({ name: 'Dish' })

const router = useRouter()

const input = ref('')
const categoryId = ref<number | null>(null)
const dishStatus = ref<number | null>(null)
const isSearch = ref(false)
const checkedKeys = ref<Array<number | string>>([])
const dishCategoryOptions = ref<{ label: string; value: number }[]>([])
const queryParams = ref<Record<string, unknown>>({})
const tableRef = ref<DataTableExpose | null>(null)

const saleStatusOptions = [
  { value: 0, label: '停售' },
  { value: 1, label: '启售' },
]

const doSearch = () => {
  isSearch.value = true
  queryParams.value = {
    name: input.value || undefined,
    categoryId: categoryId.value ?? undefined,
    status: dishStatus.value ?? undefined,
  }
}

async function fetcher(params: { page: number; pageSize: number }) {
  const { data } = await getDishPage({
    ...params,
    name: input.value || undefined,
    categoryId: categoryId.value ?? undefined,
    status: dishStatus.value ?? undefined,
  })
  return data.data
}

onMounted(async () => {
  try {
    const { data } = await getCategoryList({ type: 1 })
    if (String(data.code) === '1') {
      dishCategoryOptions.value = (data.data ?? []).map((it) => ({
        value: it.id,
        label: it.name,
      }))
    }
  } catch {
    /* 分类下拉加载失败不阻塞列表 */
  }
})

const handleCheck = (keys: Array<number | string>) => {
  checkedKeys.value = keys
}

const renderTextBtn = (label: string, cls: string, onClick: () => void) =>
  h(
    NButton,
    { text: true, size: 'small', class: cls, style: { marginRight: '12px' }, onClick },
    { default: () => label },
  )

const columns: DataTableColumns<DishItem> = [
  { type: 'selection' },
  { title: '菜品名称', key: 'name' },
  {
    title: '图片',
    key: 'image',
    render: (row) =>
      h(NImage, {
        src: row.image,
        fallbackSrc: noImg,
        objectFit: 'cover',
        style: 'width:80px;height:40px;border:none;cursor:pointer',
      }),
  },
  { title: '菜品分类', key: 'categoryName' },
  {
    title: '售价',
    key: 'price',
    render: (row) => `￥${Number(row.price).toFixed(2)}`,
  },
  {
    title: '售卖状态',
    key: 'status',
    render: (row) =>
      h(
        'div',
        { class: ['tableColumn-status', { 'stop-use': String(row.status) === '0' }] },
        { default: () => (String(row.status) === '0' ? '停售' : '启售') },
      ),
  },
  { title: '最后操作时间', key: 'updateTime' },
  {
    title: '操作',
    key: 'actions',
    width: 240,
    align: 'center',
    render: (row) => [
      renderTextBtn('修改', 'blueBug', () =>
        router.push({ path: '/dish/add', query: { id: row.id } }),
      ),
      renderTextBtn('删除', 'delBut', () => deleteHandle('单删', row)),
      renderTextBtn(
        String(row.status) === '0' ? '启售' : '停售',
        String(row.status) === '0' ? 'blueBug' : 'delBut',
        () => statusHandle(row),
      ),
    ],
  },
]

const deleteHandle = (type: '批量' | '单删', row: DishItem | null) => {
  if (type === '批量' && row === null && checkedKeys.value.length === 0) {
    message.error('请选择删除对象')
    return
  }
  dialog.warning({
    title: '确定删除',
    content: '确认删除该菜品, 是否继续?',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const ids = type === '批量' ? checkedKeys.value.join(',') : String(row!.id)
      const { data } = await deleteDish(ids)
      if (String(data.code) === '1') {
        message.success('删除成功！')
        checkedKeys.value = []
        tableRef.value?.search()
      } else {
        message.error(data.msg ?? '删除失败')
      }
    },
  })
}

const statusHandle = (row: DishItem) => {
  dialog.warning({
    title: '提示',
    content: '确认更改该菜品状态?',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { data } = await dishStatusByStatus({
        id: row.id,
        status: String(row.status) === '0' ? '1' : '0',
      })
      if (String(data.code) === '1') {
        message.success('菜品状态已经更改成功！')
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
  flex-wrap: wrap;
  gap: 8px;

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

.tableLab {
  display: flex;
  align-items: center;

  .batch-del {
    cursor: pointer;
    font-size: 14px;
    padding: 0 20px;
  }
}
</style>
