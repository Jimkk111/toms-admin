<template>
  <div class="container">
    <div class="tableBar">
      <div class="search-area">
        <span class="label">套餐名称：</span>
        <n-input
          v-model:value="input"
          placeholder="请填写套餐名称"
          clearable
          style="width: 180px"
          @clear="search(true)"
          @keyup.enter="search(true)"
        />

        <span class="label">套餐分类：</span>
        <n-select
          v-model:value="categoryId"
          placeholder="请选择"
          clearable
          :options="categoryOptions"
          style="width: 160px"
          @clear="search(true)"
        />

        <span class="label">售卖状态：</span>
        <n-select
          v-model:value="dishStatus"
          placeholder="请选择"
          clearable
          :options="saleStatusOptions"
          style="width: 140px"
          @clear="search(true)"
        />

        <n-button
          class="normal-btn"
          @click="search(true)"
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
          @click="router.push('/setmeal/add')"
        >
          + 新建套餐
        </n-button>
      </div>
    </div>

    <n-data-table
      v-if="tableData.length"
      remote
      striped
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :row-key="(row: SetmealItem) => row.id"
      :checked-row-keys="checkedKeys"
      @update:checked-row-keys="handleCheck"
    />
    <Empty
      v-else
      :is-search="isSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NImage, type DataTableColumns } from 'naive-ui'
import {
  getSetmealPage,
  deleteSetmeal,
  setmealStatusByStatus,
} from '@/api/setMeal'
import type { SetmealItem } from '@/api/setMeal'
import { getCategoryList } from '@/api/dish'
import { useTable } from '@/composables/useTable'
import { message, dialog } from '@/utils/feedback'
import Empty from '@/components/Empty/index.vue'
import noImg from '@/assets/noImg.png'

defineOptions({ name: 'Setmeal' })

const router = useRouter()

const input = ref('')
const categoryId = ref<number | null>(null)
const dishStatus = ref<number | null>(null)
const isSearch = ref(false)
const checkedKeys = ref<Array<number | string>>([])
const categoryOptions = ref<{ label: string; value: number }[]>([])

const saleStatusOptions = [
  { value: 0, label: '停售' },
  { value: 1, label: '启售' },
]

async function fetcher(params: { page: number; pageSize: number }) {
  const { data } = await getSetmealPage({
    ...params,
    name: input.value || undefined,
    categoryId: categoryId.value ?? undefined,
    status: dishStatus.value ?? undefined,
  })
  return data.data
}

const { loading, tableData, pagination, search } = useTable<SetmealItem>(fetcher)
search()

onMounted(async () => {
  try {
    const { data } = await getCategoryList({ type: 2 })
    if (String(data.code) === '1') {
      categoryOptions.value = (data.data ?? []).map((it) => ({
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

const columns: DataTableColumns<SetmealItem> = [
  { type: 'selection' },
  { title: '套餐名称', key: 'name' },
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
  { title: '套餐分类', key: 'categoryName' },
  {
    title: '套餐价',
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
        router.push({ path: '/setmeal/add', query: { id: row.id } }),
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

const deleteHandle = (type: '批量' | '单删', row: SetmealItem | null) => {
  if (type === '批量' && row === null && checkedKeys.value.length === 0) {
    message.error('请选择删除对象')
    return
  }
  dialog.warning({
    title: '确定删除',
    content: '确定删除该套餐?',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const ids = type === '批量' ? checkedKeys.value.join(',') : String(row!.id)
      const { data } = await deleteSetmeal(ids)
      if (String(data.code) === '1') {
        message.success('删除成功！')
        checkedKeys.value = []
        search()
      } else {
        message.error(data.msg ?? '删除失败')
      }
    },
  })
}

const statusHandle = (row: SetmealItem) => {
  dialog.warning({
    title: '提示',
    content: '确认更改该套餐状态?',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { data } = await setmealStatusByStatus({
        ids: row.id,
        status: String(row.status) === '0' ? '1' : '0',
      })
      if (String(data.code) === '1') {
        message.success('套餐状态已经更改成功！')
        search()
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
