<template>
  <div class="container">
    <div class="tableBar">
      <div class="search-area">
        <span class="label">分类名称：</span>
        <n-input
          v-model:value="name"
          placeholder="请填写分类名称"
          clearable
          style="width: 200px"
          @clear="doSearch"
          @keyup.enter="doSearch"
        />

        <span class="label">分类类型：</span>
        <n-select
          v-model:value="categoryType"
          placeholder="请选择"
          clearable
          :options="typeOptions"
          style="width: 160px"
          @clear="doSearch"
        />

        <n-button
          class="normal-btn"
          @click="doSearch"
        >
          查询
        </n-button>
      </div>

      <div>
        <n-button
          type="primary"
          @click="openAdd('1')"
        >
          + 新增菜品分类
        </n-button>
        <n-button
          type="primary"
          style="margin-left: 20px"
          @click="openAdd('2')"
        >
          + 新增套餐分类
        </n-button>
      </div>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :req-fn="fetcher"
      :params="queryParams"
      :row-key="(row: CategoryItem) => row.id"
    >
      <template #empty>
        <Empty :is-search="isSearch" />
      </template>
    </DataTable>

    <!-- 新增/修改分类 -->
    <n-modal
      v-model:show="classData.visible"
      preset="card"
      :title="classData.title"
      style="width: 30%"
    >
      <CommonForm
        ref="formRef"
        :model="classForm"
        :items="formItems"
      />
      <template #footer>
        <div class="modal-footer">
          <n-button @click="handleClose">取 消</n-button>
          <n-button
            type="primary"
            @click="submitForm()"
          >
            确 定
          </n-button>
          <n-button
            v-if="action === 'add'"
            type="primary"
            @click="submitForm('go')"
          >
            保存并继续添加
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { h, reactive, ref } from 'vue'
import { NButton, type DataTableColumns, type SelectOption } from 'naive-ui'
import {
  getCategoryPage,
  deleCategory,
  editCategory,
  addCategory,
  enableOrDisableCategory,
} from '@/api/category'
import type { CategoryItem } from '@/api/category'
import { message, dialog } from '@/utils/feedback'
import DataTable from '@/components/Common/DataTable.vue'
import type { DataTableExpose } from '@/types/components'
import CommonForm from '@/components/Common/CommonForm.vue'
import type { FormItemOption } from '@/types/form'
import Empty from '@/components/Empty/index.vue'

defineOptions({ name: 'Category' })

const typeOptions: SelectOption[] = [
  { label: '菜品分类', value: 1 },
  { label: '套餐分类', value: 2 },
]

const name = ref('')
const categoryType = ref<number | null>(null)
const isSearch = ref(false)
const queryParams = ref<Record<string, unknown>>({})
const tableRef = ref<DataTableExpose | null>(null)

// 输入框/下拉的值变化不直接查询，点查询/回车/清除时才写入 queryParams 触发重查
const doSearch = () => {
  isSearch.value = true
  queryParams.value = {
    name: name.value || undefined,
    type: categoryType.value ?? undefined,
  }
}

async function fetcher(params: { page: number; pageSize: number }) {
  const { data } = await getCategoryPage({
    ...params,
    name: name.value || undefined,
    type: categoryType.value ?? undefined,
  })
  return data.data
}

const renderActionBtn = (label: string, cls: string, onClick: () => void, disabled = false) =>
  h(
    NButton,
    { text: true, size: 'small', class: cls, disabled, style: { marginRight: '12px' }, onClick },
    { default: () => label },
  )

const columns: DataTableColumns<CategoryItem> = [
  { title: '分类名称', key: 'name' },
  {
    title: '分类类型',
    key: 'type',
    render: (row) => (String(row.type) === '1' ? '菜品分类' : '套餐分类'),
  },
  { title: '排序', key: 'sort' },
  {
    title: '状态',
    key: 'status',
    render: (row) =>
      h(
        'div',
        { class: ['tableColumn-status', { 'stop-use': String(row.status) === '0' }] },
        { default: () => (String(row.status) === '0' ? '禁用' : '启用') },
      ),
  },
  { title: '操作时间', key: 'updateTime' },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    align: 'center',
    render: (row) => [
      renderActionBtn('修改', 'blueBug', () => openEdit(row)),
      renderActionBtn('删除', 'delBut', () => deleteHandle(row)),
      renderActionBtn(
        String(row.status) === '1' ? '禁用' : '启用',
        String(row.status) === '1' ? 'delBut' : 'blueBug',
        () => statusHandle(row),
      ),
    ],
  },
]

// 新增/修改弹窗
const formRef = ref<InstanceType<typeof CommonForm> | null>(null)
const action = ref<'add' | 'edit'>('add')
const type = ref('1')
const classData = reactive({
  visible: false,
  title: '',
  id: 0 as number | string,
})
const classForm = reactive({
  name: '',
  sort: '',
})

const validateName = (_rule: unknown, value: string) => {
  const reg = /^[A-Za-z\u4e00-\u9fa5]+$/
  if (!value) return new Error(classData.title + '不能为空')
  if (value.length < 2) return new Error('分类名称输入不符，请输入2-20个字符')
  if (!reg.test(value)) return new Error('分类名称包含特殊字符')
  return true
}

const validateSort = (_rule: unknown, value: string) => {
  if (!value && String(value) !== '0') return new Error('排序不能为空')
  if (!/^\d+$/.test(value)) return new Error('排序只能输入数字类型')
  if (Number(value) > 99) return new Error('排序只能输入0-99数字')
  return true
}

const formItems: FormItemOption[] = [
  { key: 'name', label: '分类名称', required: true, width: '280px', rule: { validator: validateName, trigger: 'blur' } },
  { key: 'sort', label: '排序', required: true, width: '280px', rule: { validator: validateSort, trigger: 'blur' } },
]

const openAdd = (t: string) => {
  type.value = t
  action.value = 'add'
  classData.title = t === '1' ? '新增菜品分类' : '新增套餐分类'
  classForm.name = ''
  classForm.sort = ''
  classData.visible = true
}

const openEdit = (row: CategoryItem) => {
  action.value = 'edit'
  classData.title = '修改分类'
  classForm.name = row.name
  classForm.sort = String(row.sort)
  classData.id = row.id
  classData.visible = true
}

const handleClose = () => {
  classData.visible = false
  formRef.value?.restoreValidation()
}

const submitForm = async (st?: 'go') => {
  const ok = await formRef.value?.validate()
  if (!ok) return
  const { data } =
    action.value === 'add'
      ? await addCategory({ name: classForm.name, type: type.value, sort: classForm.sort })
      : await editCategory({
          id: Number(classData.id),
          name: classForm.name,
          sort: classForm.sort,
        })
  if (String(data.code) === '1') {
    message.success(action.value === 'add' ? '分类添加成功！' : '分类修改成功！')
    if (!st) classData.visible = false
    if (action.value === 'add') {
      classForm.name = ''
      classForm.sort = ''
    }
    formRef.value?.restoreValidation()
    tableRef.value?.search()
  } else {
    message.error(data.desc || data.msg || '操作失败')
  }
}

const deleteHandle = (row: CategoryItem) => {
  dialog.warning({
    title: '确定删除',
    content: '此操作将永久删除该分类，是否继续？',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { data } = await deleCategory(row.id)
      if (String(data.code) === '1') {
        message.success('删除成功！')
        tableRef.value?.search()
      } else {
        message.error(data.msg ?? '删除失败')
      }
    },
  })
}

const statusHandle = (row: CategoryItem) => {
  dialog.warning({
    title: '提示',
    content: '确认调整该分类的状态?',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { data } = await enableOrDisableCategory({
        id: row.id,
        status: String(row.status) === '0' ? 1 : 0,
      })
      if (String(data.code) === '1') {
        message.success('分类状态更改成功！')
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
