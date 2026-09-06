<template>
  <div class="add-dish">
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
        <template #flavors>
          <div class="flavorBox">
            <span
              v-if="dishFlavors.length === 0"
              class="addBut"
              @click="addFlavor"
            >
              + 添加口味
            </span>
            <div
              v-if="dishFlavors.length !== 0"
              class="flavor"
            >
              <div class="title">
                <span>口味名（3个字内）</span>
              </div>
              <div class="cont">
                <div
                  v-for="(item, index) in dishFlavors"
                  :key="index"
                  class="items"
                >
                  <div class="itTit">
                    <n-select
                      :value="item.name || null"
                      placeholder="请选择口味"
                      :options="leftFlavorOptions"
                      @update:value="(val: string | null) => selectHandle(val, index)"
                    />
                  </div>
                  <div class="labItems">
                    <span
                      v-for="(it, ind) in item.value"
                      :key="ind"
                    >
                      {{ it }}
                      <i @click="delFlavorLabel(index, ind)">X</i>
                    </span>
                  </div>
                  <span
                    class="delFlavor delBut"
                    @click="delFlavor(item.name)"
                  >
                    删除
                  </span>
                </div>
                <div
                  v-if="leftFlavorOptions.length && dishFlavors.length < flavorsData.length"
                  class="addBut"
                  @click="addFlavor"
                >
                  添加口味
                </div>
              </div>
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

      <div class="subBox">
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormItemRule, SelectOption } from 'naive-ui'
import { queryDishById, addDish, editDish, getCategoryList } from '@/api/dish'
import type { DishFlavor } from '@/api/dish'
import { message } from '@/utils/feedback'
import HeadLable from '@/components/HeadLable/index.vue'
import ImgUpload from '@/components/ImgUpload/index.vue'
import CommonForm from '@/components/Common/CommonForm.vue'
import type { FormItemOption } from '@/types/form'

defineOptions({ name: 'AddDishPage' })

const route = useRoute()
const router = useRouter()

const formRef = ref<InstanceType<typeof CommonForm> | null>(null)
const actionType = ref<'add' | 'edit'>('add')
const title = ref('添加菜品')

const ruleForm = reactive({
  name: '',
  categoryId: null as number | null,
  price: '',
  image: '',
  description: '',
})

// 口味固定字典（与旧版一致）
const flavorsData: DishFlavor[] = [
  { name: '甜味', value: ['无糖', '少糖', '半糖', '多糖', '全糖'] },
  { name: '温度', value: ['热饮', '常温', '去冰', '少冰', '多冰'] },
  { name: '忌口', value: ['不要葱', '不要蒜', '不要香菜', '不要辣'] },
  { name: '辣度', value: ['不辣', '微辣', '中辣', '重辣'] },
]

const dishFlavors = ref<DishFlavor[]>([])
const dishOptions = ref<{ label: string; value: number }[]>([])
// 编辑时保留原售卖状态
const statusValue = ref(1)

// 过滤已选口味，避免重复选择
const leftFlavorOptions = computed<SelectOption[]>(() =>
  flavorsData
    .filter((it) => dishFlavors.value.findIndex((f) => f.name === it.name) === -1)
    .map((it) => ({ label: it.name, value: it.name })),
)

const validateName = (_rule: FormItemRule, value: string) => {
  if (!value) return new Error('请输入菜品名称')
  if (!/^([A-Za-z0-9\u4e00-\u9fa5]){2,20}$/.test(value)) {
    return new Error('菜品名称输入不符，请输入2-20个字符')
  }
  return true
}

const validatePrice = (_rule: FormItemRule, value: string) => {
  const reg = /^([1-9]\d{0,5}|0)(\.\d{1,2})?$/
  if (!reg.test(value) || Number(value) <= 0) {
    return new Error('菜品价格格式有误，请输入大于零且最多保留两位小数的金额')
  }
  return true
}

const validateImage = () =>
  ruleForm.image ? true : new Error('菜品图片不能为空')

const items = computed<FormItemOption[]>(() => [
  {
    key: 'name',
    label: '菜品名称:',
    required: true,
    width: '350px',
    maxlength: 20,
    rule: { validator: validateName, trigger: 'blur' },
  },
  {
    key: 'categoryId',
    label: '菜品分类:',
    type: 'select',
    options: dishOptions.value,
    required: true,
    width: '350px',
    // 数字下拉必须声明 type: 'number'，否则 async-validator 默认按 string 校验，
    // 选中数字 id 后仍会报必填错误
    rule: { required: true, type: 'number', message: '请选择菜品分类', trigger: 'change' },
  },
  {
    key: 'price',
    label: '菜品价格:',
    required: true,
    width: '350px',
    rule: { validator: validatePrice, trigger: 'blur' },
  },
  { key: 'flavors', label: '口味做法配置:' },
  { key: 'image', label: '菜品图片:', rule: { validator: validateImage } },
  {
    key: 'description',
    label: '菜品描述:',
    type: 'textarea',
    rows: 3,
    maxlength: 200,
    width: '777px',
    placeholder: '菜品描述，最长200字',
  },
])

const addFlavor = () => {
  dishFlavors.value.push({ name: '', value: [] })
}

const selectHandle = (val: string | null, index: number) => {
  if (!val) return
  const target = flavorsData.find((it) => it.name === val)
  if (target) dishFlavors.value[index] = JSON.parse(JSON.stringify(target))
}

const delFlavor = (name: string) => {
  const ind = dishFlavors.value.findIndex((item) => item.name === name)
  if (ind > -1) dishFlavors.value.splice(ind, 1)
}

const delFlavorLabel = (index: number, ind: number) => {
  dishFlavors.value[index].value.splice(ind, 1)
}

const imageChange = (url: string) => {
  ruleForm.image = url
}

const getDishList = async () => {
  const { data } = await getCategoryList({ type: 1 })
  if (String(data.code) === '1') {
    dishOptions.value = (data.data ?? []).map((it) => ({ label: it.name, value: it.id }))
  } else {
    message.error(data.msg ?? '获取分类失败')
  }
}

const init = async () => {
  const { data } = await queryDishById(route.query.id as string)
  if (String(data.code) === '1') {
    ruleForm.name = data.data.name
    ruleForm.categoryId = data.data.categoryId
    ruleForm.price = String(data.data.price)
    ruleForm.image = data.data.image
    ruleForm.description = data.data.description ?? ''
    statusValue.value = String(data.data.status) === '1' ? 1 : 0
    dishFlavors.value = (data.data.flavors ?? []).map((obj) => ({
      name: obj.name,
      value: JSON.parse(obj.value as unknown as string),
    }))
  } else {
    message.error(data.msg ?? '查询失败')
  }
}

onMounted(() => {
  getDishList()
  if (route.query.id) {
    actionType.value = 'edit'
    title.value = '修改菜品'
    init()
  }
})

const submitForm = async (keepAdding: boolean) => {
  const ok = await formRef.value?.validate()
  if (!ok) return

  const params = {
    name: ruleForm.name,
    categoryId: ruleForm.categoryId as number,
    price: ruleForm.price,
    image: ruleForm.image,
    description: ruleForm.description,
    // 新增默认停售（0），修改沿用原状态
    status: actionType.value === 'add' ? 0 : statusValue.value,
    flavors: dishFlavors.value.map((obj) => ({
      name: obj.name,
      value: JSON.stringify(obj.value),
    })),
  }

  const { data } =
    actionType.value === 'add'
      ? await addDish(params)
      : await editDish({ ...params, id: Number(route.query.id) })

  if (String(data.code) === '1') {
    message.success(actionType.value === 'add' ? '菜品添加成功！' : '菜品修改成功！')
    if (actionType.value === 'add' && keepAdding) {
      dishFlavors.value = []
      ruleForm.name = ''
      ruleForm.categoryId = null
      ruleForm.price = ''
      ruleForm.image = ''
      ruleForm.description = ''
      formRef.value?.restoreValidation()
      return
    }
    router.push('/dish')
  } else {
    message.error(data.desc || data.msg || '操作失败')
  }
}
</script>

<style lang="scss" scoped>
.add-dish {
  .container {
    position: relative;
    z-index: 1;
    background: #fff;
    padding: 30px;
    border-radius: 4px;
    min-height: 500px;
  }

  .subBox {
    padding-top: 30px;
    text-align: center;
    border-top: solid 1px $gray-5;
    display: flex;
    justify-content: center;
    gap: 14px;
  }
}

.flavorBox {
  width: 777px;

  .addBut {
    background: #ffc200;
    display: inline-block;
    padding: 0 20px;
    border-radius: 4px;
    line-height: 40px;
    cursor: pointer;
    color: #333333;
    font-weight: 500;
  }

  .flavor {
    border: solid 1px #dfe2e8;
    border-radius: 3px;
    padding: 15px;
    background: #fafafb;

    .title {
      color: #606168;
    }

    .cont .items {
      display: flex;
      margin: 10px 0;
      align-items: center;

      .itTit {
        width: 150px;
        margin-right: 15px;
      }

      .labItems {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        border-radius: 3px;
        min-height: 39px;
        border: solid 1px #d8dde3;
        background: #fff;
        padding: 0 5px;
        align-items: center;

        span {
          display: inline-block;
          color: #ffc200;
          margin: 5px;
          line-height: 26px;
          padding: 0 10px;
          background: #fffbf0;
          border: 1px solid #fbe396;
          border-radius: 4px;
          font-size: 12px;

          i {
            cursor: pointer;
            font-style: normal;
          }
        }
      }

      .delFlavor {
        display: inline-block;
        padding: 0 10px;
        cursor: pointer;
      }
    }
  }
}
</style>
