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
          @clear="search(true)"
          @keyup.enter="search(true)"
        />

        <span class="label">分类类型：</span>
        <n-select
          v-model:value="categoryType"
          placeholder="请选择"
          clearable
          :options="typeOptions"
          style="width: 160px"
          @clear="search(true)"
        />

        <n-button class="normal-btn" @click="search(true)"> 查询 </n-button>
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

    <n-data-table
      v-if="tableData.length"
      remote
      striped
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :row-key="(row: CategoryItem) => row.id"
    />
    <Empty
      v-else
      :is-search="isSearch"
    />

    <!-- 新增/修改分类 -->
    <n-modal
      v-model:show="classData.visible"
      preset="card"
      :title="classData.title"
      style="width: 30%"
    >
      <n-form
        ref="formRef"
        :model="classData"
        :rules="rules"
        label-placement="left"
        label-width="100"
      >
        <n-form-item
          label="分类名称："
          path="name"
        >
          <n-input
            v-model:value="classData.name"
            placeholder="请输入分类名称"
            :maxlength="20"
          />
        </n-form-item>
        <n-form-item
          label="排序："
          path="sort"
        >
          <n-input
            v-model:value="classData.sort"
            placeholder="请输入排序"
          />
        </n-form-item>
      </n-form>
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
import { NButton, type DataTableColumns, type FormInst, type FormItemRule, type SelectOption } from 'naive-ui'
import {
  getCategoryPage,
  deleCategory,
  editCategory,
  addCategory,
  enableOrDisableCategory,
} from '@/api/category'
import type { CategoryItem } from '@/api/category'
import { useTable } from '@/composables/useTable'
import { message, dialog } from '@/utils/feedback'
import Empty from '@/components/Empty/index.vue'

defineOptions({ name: 'Category' })

const typeOptions: SelectOption[] = [
  { label: '菜品分类', value: 1 },
  { label: '套餐分类', value: 2 },
]

const name = ref('')
const categoryType = ref<number | null>(null)
const isSearch = ref(false)

async function fetcher(params: { page: number; pageSize: number }) {
  const { data } = await getCategoryPage({
    ...params,
    name: name.value || undefined,
    type: categoryType.value ?? undefined,
  })
  return data.data
}

const { loading, tableData, pagination, search } = useTable<CategoryItem>(fetcher)
search()

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
const formRef = ref<FormInst | null>(null)
const action = ref<'add' | 'edit'>('add')
const type = ref('1')
const classData = reactive({
  visible: false,
  title: '',
  name: '',
  sort: '',
  id: 0 as number | string,
})

const validateName = (_rule: FormItemRule, value: string) => {
  const reg = /^[A-Za-z\u4e00-\u9fa5]+$/
  if (!value) return new Error(classData.title + '不能为空')
  if (value.length < 2) return new Error('分类名称输入不符，请输入2-20个字符')
  if (!reg.test(value)) return new Error('分类名称包含特殊字符')
  return true
}

const validateSort = (_rule: FormItemRule, value: string) => {
  if (!value && String(value) !== '0') return new Error('排序不能为空')
  if (!/^\d+$/.test(value)) return new Error('排序只能输入数字类型')
  if (Number(value) > 99) return new Error('排序只能输入0-99数字')
  return true
}

const rules: Record<string, FormItemRule[]> = {
  name: [{ required: true, validator: validateName, trigger: 'blur' }],
  sort: [{ required: true, validator: validateSort, trigger: 'blur' }],
}

const openAdd = (t: string) => {
  type.value = t
  action.value = 'add'
  classData.title = t === '1' ? '新增菜品分类' : '新增套餐分类'
  classData.name = ''
  classData.sort = ''
  classData.visible = true
}

const openEdit = (row: CategoryItem) => {
  action.value = 'edit'
  classData.title = '修改分类'
  classData.name = row.name
  classData.sort = String(row.sort)
  classData.id = row.id
  classData.visible = true
}

const handleClose = () => {
  classData.visible = false
  formRef.value?.restoreValidation()
}

const submitForm = (st?: 'go') => {
  formRef.value
    ?.validate()
    .then(async () => {
      const { data } =
        action.value === 'add'
          ? await addCategory({ name: classData.name, type: type.value, sort: classData.sort })
          : await editCategory({
              id: Number(classData.id),
              name: classData.name,
              sort: classData.sort,
            })
      if (String(data.code) === '1') {
        message.success(action.value === 'add' ? '分类添加成功！' : '分类修改成功！')
        if (!st) classData.visible = false
        if (action.value === 'add') {
          classData.name = ''
          classData.sort = ''
        }
        formRef.value?.restoreValidation()
        search()
      } else {
        message.error(data.desc || data.msg || '操作失败')
      }
    })
    .catch(() => {})
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
        search()
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
