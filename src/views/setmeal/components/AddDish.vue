<template>
  <div class="addDish">
    <div class="leftCont">
      <div
        v-show="searchKey.trim() === ''"
        class="tabBut"
      >
        <span
          v-for="(item, index) in dishType"
          :key="item.id"
          :class="{ act: index === keyInd }"
          @click="checkTypeHandle(index, item.id)"
        >
          {{ item.name }}
        </span>
      </div>
      <div class="tabList">
        <div
          class="table"
          :class="{ borderNone: dishList.length === 0 }"
        >
          <Empty v-if="dishList.length === 0" />
          <n-checkbox-group
            v-if="dishList.length > 0"
            :value="checkedKeys"
            @update:value="checkedListHandle"
          >
            <div
              v-for="item in dishList"
              :key="item.dishId"
              class="items"
            >
              <n-checkbox :value="item.dishId">
                <div class="item">
                  <span class="dish-name">{{ item.name }}</span>
                  <span>{{ item.status === 0 ? '停售' : '在售' }}</span>
                  <span>￥{{ Number(item.price).toFixed(2) }}</span>
                </div>
              </n-checkbox>
            </div>
          </n-checkbox-group>
        </div>
      </div>
    </div>

    <div class="ritCont">
      <div class="tit">已选菜品({{ selectedList.length }})</div>
      <div class="items">
        <div
          v-for="item in selectedList"
          :key="item.dishId"
          class="item"
        >
          <span>{{ item.name }}</span>
          <span class="price">￥{{ Number(item.price).toFixed(2) }}</span>
          <span
            class="del"
            @click="delCheck(item.dishId)"
          >
            <img
              src="@/assets/icons/btn_clean@2x.png"
              alt=""
            />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { getCategoryList, queryDishList } from '@/api/dish'
import type { CategoryOption, DishItem } from '@/api/dish'
import type { SetmealDish } from '@/api/setMeal'
import { message } from '@/utils/feedback'
import Empty from '@/components/Empty/index.vue'

const props = defineProps<{
  checkList: SetmealDish[]
  searchKey: string
}>()

const emit = defineEmits<{ checkList: [list: SetmealDish[]] }>()

const dishType = ref<CategoryOption[]>([])
const dishList = ref<(DishItem & { dishId: number | string })[]>([])
const keyInd = ref(0)

// 以 dishId 为键维护选中项
const selectedMap = ref(new Map<number | string, SetmealDish>())
const selectedList = ref<SetmealDish[]>([])
const checkedKeys = ref<Array<number | string>>([])

const syncSelected = () => {
  selectedList.value = [...selectedMap.value.values()]
  checkedKeys.value = selectedList.value.map((it) => it.dishId)
  emit('checkList', selectedList.value)
}

const getDishType = async () => {
  const { data } = await getCategoryList({ type: 1 })
  if (String(data.code) === '1') {
    dishType.value = data.data ?? []
    if (dishType.value.length > 0) {
      getDishList(dishType.value[0].id)
    }
  } else {
    message.error(data.msg ?? '获取分类失败')
  }
}

const getDishList = async (categoryId: number | string) => {
  const { data } = await queryDishList({ categoryId })
  if (String(data.code) === '1') {
    dishList.value = (data.data ?? []).map((n) => ({
      ...n,
      dishId: n.id,
      copies: n.copies ?? 1,
    }))
  } else {
    message.error(data.msg ?? '获取菜品失败')
  }
}

const getDishForName = async (name: string) => {
  const { data } = await queryDishList({ name })
  if (String(data.code) === '1') {
    dishList.value = (data.data ?? []).map((n) => ({
      ...n,
      dishId: n.id,
      copies: n.copies ?? 1,
    }))
  } else {
    message.error(data.msg ?? '查询菜品失败')
  }
}

const checkTypeHandle = (ind: number, id: number) => {
  keyInd.value = ind
  getDishList(id)
}

// 勾选变化：合并进选中 Map（保留份数），取消勾选则移除
const checkedListHandle = (keys: Array<number | string>) => {
  const keySet = new Set(keys)
  for (const key of [...selectedMap.value.keys()]) {
    if (!keySet.has(key)) selectedMap.value.delete(key)
  }
  for (const item of dishList.value) {
    if (keySet.has(item.dishId) && !selectedMap.value.has(item.dishId)) {
      selectedMap.value.set(item.dishId, {
        dishId: item.dishId,
        name: item.name,
        price: item.price,
        copies: 1,
      })
    }
  }
  syncSelected()
}

const delCheck = (dishId: number | string) => {
  selectedMap.value.delete(dishId)
  syncSelected()
}

watch(
  () => props.searchKey,
  (val) => {
    if (val.trim()) {
      getDishForName(val)
    }
  },
)

onMounted(async () => {
  getDishType()
  // 初始化已选项
  for (const it of props.checkList ?? []) {
    selectedMap.value.set(it.dishId, { ...it })
  }
  syncSelected()
})
</script>

<style lang="scss" scoped>
.addDish {
  display: flex;

  .leftCont {
    flex: 1;

    .tabBut {
      margin-bottom: 10px;

      span {
        display: inline-block;
        padding: 0 16px;
        line-height: 32px;
        cursor: pointer;
        border: 1px solid #e5e4e4;
        border-radius: 4px;
        margin-right: 10px;
        font-size: 12px;

        &.act {
          background: #289ADD;
          color: #ffffff;
          border-color: #289ADD;
        }
      }
    }

    .table {
      height: 320px;
      overflow-y: auto;
      border: 1px solid #e5e4e4;
      border-radius: 4px;
      padding: 6px 0;

      &.borderNone {
        border: none;
      }

      .items {
        padding: 4px 10px;

        .item {
          display: flex;
          font-size: 13px;

          .dish-name {
            flex: 3;
            text-align: left;
          }

          span {
            flex: 1;
            text-align: center;
          }
        }
      }
    }
  }

  .ritCont {
    width: 260px;
    margin-left: 20px;
    border: 1px solid #e5e4e4;
    border-radius: 4px;
    height: 320px;
    display: flex;
    flex-direction: column;

    .tit {
      padding: 10px;
      font-weight: 700;
      border-bottom: 1px solid #f3f4f7;
    }

    .items {
      flex: 1;
      overflow-y: auto;
      padding: 6px 10px;

      .item {
        display: flex;
        align-items: center;
        line-height: 32px;
        font-size: 13px;

        span:first-child {
          flex: 2;
        }

        .price {
          flex: 1;
        }

        .del {
          cursor: pointer;

          img {
            width: 16px;
            height: 16px;
          }
        }
      }
    }
  }
}
</style>
