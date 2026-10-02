<template>
  <div class="add-setmeal">
    <HeadLable
      :title="title"
      :goback="true"
    />
    <div class="container">
      <CommonForm
        ref="formRef"
        :model="ruleForm"
        :items="items"
        label-width="180"
      >
        <template #dishes>
          <div class="addDish">
            <span
              v-if="dishTable.length === 0"
              class="addBut"
              @click="openAddDish"
            >
              + 添加菜品
            </span>
            <div
              v-if="dishTable.length !== 0"
              class="content"
            >
              <div
                class="addBut"
                style="margin-bottom: 20px"
                @click="openAddDish"
              >
                + 添加菜品
              </div>
              <DataTable
                :columns="dishColumns"
                :data="dishTable"
                :row-key="(row: SetmealDish) => row.dishId"
              />
            </div>
          </div>
        </template>
        <template #image>
          <ImgUpload
            :prop-image-url="ruleForm.image"
            @image-change="imageChange"
          >
            图片大小不超过2M<br />仅能上传 PNG JPEG JPG类型图片<br />建议上传200*200或300*300尺寸的图片
          </ImgUpload>
        </template>
      </CommonForm>

      <div class="sub-box">
        <n-button @click="router.back()">取消</n-button>
        <n-button
          type="primary"
          @click="submitForm(false)"
        >
          保存
        </n-button>
        <n-button
          v-if="actionType === 'add'"
          type="primary"
          @click="submitForm(true)"
        >
          保存并继续添加
        </n-button>
      </div>
    </div>

    <!-- 添加菜品弹层 -->
    <n-modal
      v-model:show="dialogVisible"
      preset="card"
      title="添加菜品"
      style="width: 60%"
    >
      <n-input
        v-model:value="searchInput"
        class="search-dish"
        placeholder="请输入菜品名称进行搜索"
        clearable
        @update:value="seachHandle"
      >
        <template #prefix>
          <i class="iconfont icon-order" />
        </template>
      </n-input>
      <AddDish
        v-if="dialogVisible"
        :check-list="checkList"
        :search-key="seachKey"
        @check-list="getCheckList"
      />
      <template #footer>
        <div class="modal-footer">
          <n-button @click="handleClose">取 消</n-button>
          <n-button
            type="primary"
            @click="addTableList"
          >
            添 加
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NInputNumber,
  type DataTableColumns,
  type SelectOption,
} from 'naive-ui'
import { querySetmealById, addSetmeal, editSetmeal } from '@/api/setMeal'
import type { SetmealDish, SetmealForm } from '@/api/setMeal'
import { getCategoryList } from '@/api/dish'
import { message } from '@/utils/feedback'
import HeadLable from '@/components/HeadLable/index.vue'
import ImgUpload from '@/components/ImgUpload/index.vue'
import DataTable from '@/components/Common/DataTable.vue'
import CommonForm from '@/components/Common/CommonForm.vue'
import type { FormItemOption } from '@/types/form'
import AddDish from './components/AddDish.vue'

defineOptions({ name: 'AddSetmeal' })

const router = useRouter()
const route = useRoute()

const formRef = ref<InstanceType<typeof CommonForm> | null>(null)
const actionType = ref<'add' | 'edit'>('add')
const title = ref('添加套餐')

const ruleForm = reactive({
  name: '',
  idType: null as number | null,
  price: '',
  image: '',
  description: '',
})

const dishTable = ref<SetmealDish[]>([])
const checkList = ref<SetmealDish[]>([])
const statusValue = ref(1)
const setmealCategoryOptions = ref<SelectOption[]>([])

const validateName = (_rule: unknown, value: string) => {
  if (!value) return new Error('请输入套餐名称')
  if (!/^([A-Za-z0-9\u4e00-\u9fa5]){2,20}$/.test(value)) {
    return new Error('套餐名称输入不符，请输入2-20个字符')
  }
  return true
}

const validatePrice = (_rule: unknown, value: string) => {
  const reg = /^([1-9]\d{0,5}|0)(\.\d{1,2})?$/
  if (!reg.test(value) || Number(value) <= 0) {
    return new Error('套餐价格格式有误，请输入大于零且最多保留两位小数的金额')
  }
  return true
}

const validateImage = () =>
  ruleForm.image ? true : new Error('套餐图片不能为空')

const items = computed<FormItemOption[]>(() => [
  {
    key: 'name',
    label: '套餐名称:',
    required: true,
    width: '350px',
    maxlength: 14,
    rule: { validator: validateName, trigger: 'blur' },
  },
  {
    key: 'idType',
    label: '套餐分类:',
    type: 'select',
    options: setmealCategoryOptions.value,
    required: true,
    width: '350px',
    // 数字下拉必须声明 type: 'number'，否则 async-validator 默认按 string 校验，
    // 选中数字 id 后仍会报必填错误
    rule: { required: true, type: 'number', message: '请选择套餐分类', trigger: 'change' },
  },
  {
    key: 'price',
    label: '套餐价格:',
    required: true,
    width: '350px',
    rule: { validator: validatePrice, trigger: 'blur' },
  },
  { key: 'dishes', label: '套餐菜品:' },
  { key: 'image', label: '套餐图片:', rule: { validator: validateImage } },
  {
    key: 'description',
    label: '套餐描述:',
    type: 'textarea',
    rows: 3,
    maxlength: 200,
    width: '777px',
    placeholder: '套餐描述，最长200字',
  },
])

const dishColumns: DataTableColumns<SetmealDish> = [
  { title: '名称', key: 'name', width: 180, align: 'center' },
  {
    title: '原价',
    key: 'price',
    width: 180,
    align: 'center',
    render: (row) => Number(row.price).toFixed(2),
  },
  {
    title: '份数',
    key: 'copies',
    align: 'center',
    render: (row, index) =>
      h(NInputNumber, {
        value: row.copies,
        size: 'small',
        min: 1,
        max: 99,
        'onUpdate:value': (val: number | null) => {
          dishTable.value[index].copies = val ?? 1
        },
      }),
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    align: 'center',
    render: (_row, index) =>
      h(
        NButton,
        { text: true, size: 'small', class: 'delBut', onClick: () => delDishHandle(index) },
        { default: () => '删除' },
      ),
  },
]

const imageChange = (url: string) => {
  ruleForm.image = url
}

const getDishTypeList = async () => {
  const { data } = await getCategoryList({ type: 2, page: 1, pageSize: 1000 })
  if (String(data.code) === '1') {
    setmealCategoryOptions.value = (data.data ?? []).map((it) => ({
      label: it.name,
      value: it.id,
    }))
  } else {
    message.error(data.msg ?? '获取分类失败')
  }
}

const init = async () => {
  const { data } = await querySetmealById(route.query.id as string)
  if (String(data.code) === '1') {
    ruleForm.name = data.data.name
    ruleForm.price = String(data.data.price)
    ruleForm.image = data.data.image
    ruleForm.description = data.data.description ?? ''
    ruleForm.idType = data.data.categoryId
    statusValue.value = String(data.data.status) === '1' ? 1 : 0
    checkList.value = [...(data.data.setmealDishes ?? [])].reverse()
    dishTable.value = [...(data.data.setmealDishes ?? [])].reverse()
  } else {
    message.error(data.msg ?? '查询失败')
  }
}

onMounted(() => {
  getDishTypeList()
  if (route.query.id) {
    actionType.value = 'edit'
    title.value = '修改套餐'
    init()
  }
})

// 选菜弹层
const dialogVisible = ref(false)
const searchInput = ref('')
const seachKey = ref('')

const openAddDish = () => {
  seachKey.value = ''
  searchInput.value = ''
  checkList.value = JSON.parse(JSON.stringify(dishTable.value))
  dialogVisible.value = true
}

const seachHandle = (val: string) => {
  seachKey.value = val
}

const getCheckList = (value: SetmealDish[]) => {
  checkList.value = value
}

const addTableList = () => {
  dishTable.value = JSON.parse(JSON.stringify(checkList.value)).map((it: SetmealDish) => ({
    ...it,
    copies: it.copies || 1,
  }))
  dialogVisible.value = false
}

const handleClose = () => {
  dialogVisible.value = false
}

const delDishHandle = (index: number) => {
  dishTable.value.splice(index, 1)
  checkList.value = JSON.parse(JSON.stringify(dishTable.value))
}

const submitForm = async (keepAdding: boolean) => {
  const ok = await formRef.value?.validate()
  if (!ok) return
  if (dishTable.value.length === 0) {
    message.error('套餐下菜品不能为空')
    return
  }

  const params: SetmealForm = {
    name: ruleForm.name,
    categoryId: ruleForm.idType as number,
    price: ruleForm.price,
    image: ruleForm.image,
    description: ruleForm.description,
    status: actionType.value === 'add' ? 0 : statusValue.value,
    setmealDishes: dishTable.value.map((obj) => ({
      dishId: obj.dishId,
      name: obj.name,
      price: obj.price,
      copies: obj.copies,
    })),
  }

  const { data } =
    actionType.value === 'add'
      ? await addSetmeal(params)
      : await editSetmeal({ ...params, id: Number(route.query.id) })

  if (String(data.code) === '1') {
    message.success(actionType.value === 'add' ? '套餐添加成功！' : '套餐修改成功！')
    if (actionType.value === 'add' && keepAdding) {
      ruleForm.name = ''
      ruleForm.idType = null
      ruleForm.price = ''
      ruleForm.image = ''
      ruleForm.description = ''
      dishTable.value = []
      formRef.value?.restoreValidation()
      return
    }
    router.push('/setmeal')
  } else {
    message.error(data.msg ?? '操作失败')
  }
}
</script>

<style lang="scss" scoped>
.add-setmeal {
  .container {
    position: relative;
    z-index: 1;
    background: #fff;
    padding: 30px;
    border-radius: 4px;
    min-height: 500px;
  }

  .addDish {
    width: 777px;

    .addBut {
      background: #289ADD;
      display: inline-block;
      padding: 0 20px;
      border-radius: 4px;
      line-height: 40px;
      cursor: pointer;
      color: #ffffff;
      font-weight: 500;
    }
  }

  .search-dish {
    width: 293px;
    margin-bottom: 10px;
  }

  .sub-box {
    padding-top: 30px;
    text-align: center;
    border-top: solid 1px $gray-5;
    display: flex;
    justify-content: center;
    gap: 14px;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
