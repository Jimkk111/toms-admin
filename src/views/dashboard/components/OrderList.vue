<template>
  <div class="container homecon">
    <h2 class="homeTitle homeTitleBtn">
      订单信息
      <ul class="conTab">
        <li
          v-for="item in tabList"
          :key="item.value"
          :class="{ active: status === item.value }"
          @click="handleTab(item.value)"
        >
          <n-badge
            :value="item.num && item.num > 99 ? '99+' : item.num"
            :show="[2, 3].includes(item.value) && !!item.num"
          >
            {{ item.label }}
          </n-badge>
        </li>
      </ul>
    </h2>

    <DataTable
      :columns="columns"
      :req-fn="fetcher"
      :row-key="(row: OrderItem) => row.id"
      :row-props="rowProps"
    >
      <template #empty>
        <Empty />
      </template>
    </DataTable>

    <!-- 查看订单信息（复用订单页弹窗） -->
    <OrderDetailModal
      v-model:show="detailVisible"
      :dia-form="diaForm"
      :dialog-order-status="dialogOrderStatus"
      :list-order-status="status"
      :status-label="statusText(dialogOrderStatus)"
    >
      <template #footer>
        <n-button
          v-if="dialogOrderStatus === 2"
          @click="openCancel(dialogRow, '拒绝')"
        >
          拒 单
        </n-button>
        <n-button
          v-if="dialogOrderStatus === 2"
          type="primary"
          @click="acceptOrder(dialogRow)"
        >
          接 单
        </n-button>
        <n-button
          v-if="[1, 3, 4, 5].includes(dialogOrderStatus)"
          @click="detailVisible = false"
        >
          返 回
        </n-button>
        <n-button
          v-if="dialogOrderStatus === 3"
          type="primary"
          @click="deliveryOrComplete(3)"
        >
          派 送
        </n-button>
      </template>
    </OrderDetailModal>

    <!-- 拒单 / 取消原因 -->
    <OrderCancelModal
      v-model:show="cancelDialogVisible"
      :title="cancelDialogTitle"
      @confirm="confirmCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { NButton, NPopover, type DataTableColumns } from 'naive-ui'
import {
  getOrderDetailPage,
  queryOrderDetailById,
  deliveryOrder,
  orderCancel,
  orderReject,
  orderAccept,
  type OrderStatics,
} from '@/api/order'
import type { OrderItem } from '@/api/order'
import DataTable from '@/components/Common/DataTable.vue'
import type { DataTableExpose } from '@/types/components'
import { message } from '@/utils/feedback'
import Empty from '@/components/Empty/index.vue'
import OrderDetailModal from '@/views/orderDetails/components/OrderDetailModal.vue'
import OrderCancelModal from '@/views/orderDetails/components/OrderCancelModal.vue'

const props = defineProps<{ orderStatics: OrderStatics }>()

const emit = defineEmits<{ refreshStatics: [] }>()

const statusText = (status: number) =>
  ([
    { v: 1, t: '待付款' },
    { v: 2, t: '待接单' },
    { v: 3, t: '待派送' },
    { v: 4, t: '派送中' },
    { v: 5, t: '已完成' },
    { v: 6, t: '已取消' },
  ].find((it) => it.v === status)?.t ?? '退款')

const status = ref(2)

const tabList = computed(() => [
  { label: '待接单', value: 2, num: props.orderStatics.toBeConfirmed },
  { label: '待派送', value: 3, num: props.orderStatics.confirmed },
])

async function fetcher(params: { page: number; pageSize: number }) {
  const { data } = await getOrderDetailPage({ ...params, status: status.value })
  return data.data
}

const tableRef = ref<DataTableExpose | null>(null)

const search = (resetPage = false) => {
  tableRef.value?.search(resetPage)
}

const fetchStatics = () => emit('refreshStatics')

onMounted(() => search())

const handleTab = (value: number) => {
  status.value = value
  search(true)
}

const renderTextBtn = (label: string, cls: string, onClick: () => void) =>
  h(
    NButton,
    { text: true, size: 'small', class: cls, style: { marginRight: '10px' }, onClick },
    { default: () => label },
  )

const ellipsisCell = (text?: string) =>
  h(
    NPopover,
    { trigger: 'hover' },
    {
      trigger: () => h('span', { class: 'ellipsisHidden' }, text ?? ''),
      default: () => text ?? '',
    },
  )

const columns = computed<DataTableColumns<OrderItem>>(() => [
  { title: '订单号', key: 'number', width: 170 },
  { title: '订单菜品', key: 'orderDishes', render: (row) => ellipsisCell(row.orderDishes) },
  { title: '地址', key: 'address', render: (row) => ellipsisCell(row.address) },
  { title: '预计送达时间', key: 'estimatedDeliveryTime', width: 160 },
  { title: '实收金额', key: 'amount', render: (row) => `￥${Number(row.amount).toFixed(2)}` },
  { title: '备注', key: 'remark', render: (row) => ellipsisCell(row.remark) },
  ...(status.value === 3
    ? [{ title: '餐具数量', key: 'tablewareNumber', align: 'center' as const, width: 90 }]
    : []),
  {
    title: '操作',
    key: 'actions',
    align: 'center',
    width: 160,
    render: (row) => {
      const btns = []
      if (row.status === 2) btns.push(renderTextBtn('接单', 'blueBug', () => acceptOrder(row)))
      if (row.status === 3) btns.push(renderTextBtn('派送', 'blueBug', () => deliveryOrComplete(3, row.id)))
      if (row.status === 2) btns.push(renderTextBtn('拒单', 'delBut', () => openCancel(row, '拒绝')))
      if ([1, 3, 4, 5].includes(row.status))
        btns.push(renderTextBtn('取消', 'delBut', () => openCancel(row, '取消')))
      btns.push(renderTextBtn('查看', 'blueBug', () => goDetail(row.id, row.status)))
      return btns
    },
  },
])

// 点击行打开详情
const rowProps = (row: OrderItem) => ({
  style: 'cursor:pointer',
  onClick: () => goDetail(row.id, row.status),
})

// 详情弹窗
const detailVisible = ref(false)
const dialogOrderStatus = ref(0)
const dialogRow = ref<Partial<OrderItem>>({})
const diaForm = ref<Partial<OrderItem>>({})

const goDetail = async (id: number | string, status: number) => {
  diaForm.value = {}
  detailVisible.value = true
  dialogOrderStatus.value = status
  dialogRow.value = { id }
  const { data } = await queryOrderDetailById(id)
  diaForm.value = data.data ?? {}
}

// 接单 / 派送
const acceptOrder = async (row: Partial<OrderItem>) => {
  const { data } = await orderAccept({ id: row.id! })
  if (String(data.code) === '1') {
    message.success('操作成功')
    detailVisible.value = false
    search()
    fetchStatics()
  } else {
    message.error(data.msg ?? '操作失败')
  }
}

const deliveryOrComplete = async (st: number, id?: number | string) => {
  const { data } = await deliveryOrder(id ?? dialogRow.value.id!)
  if (String(data.code) === '1') {
    message.success('操作成功')
    detailVisible.value = false
    search()
    fetchStatics()
  } else {
    message.error(data.msg ?? '操作失败')
  }
}

// 拒单 / 取消
const cancelDialogVisible = ref(false)
const cancelDialogTitle = ref<'取消' | '拒绝'>('取消')

const openCancel = (row: Partial<OrderItem>, title: '取消' | '拒绝') => {
  dialogRow.value = row
  cancelDialogTitle.value = title
  detailVisible.value = false
  cancelDialogVisible.value = true
}

const confirmCancel = async (reason: string) => {
  const isCancel = cancelDialogTitle.value === '取消'
  const { data } = isCancel
    ? await orderCancel({ id: dialogRow.value.id!, cancelReason: reason })
    : await orderReject({ id: dialogRow.value.id!, rejectionReason: reason })
  if (String(data.code) === '1') {
    message.success('操作成功')
    cancelDialogVisible.value = false
    search()
    fetchStatics()
  } else {
    message.error(data.msg ?? '操作失败')
  }
}
</script>

<style lang="scss" scoped>
.homecon {
  margin-top: 15px;
}

.homeTitle {
  display: flex;
  align-items: center;

  .conTab {
    display: flex;
    list-style: none;
    margin: 0 0 0 auto;
    padding: 0;

    li {
      padding: 0 20px;
      cursor: pointer;
      line-height: 32px;
      font-size: 14px;
      font-weight: 400;

      &.active {
        background: #289ADD;
        color: #ffffff;
        border-radius: 4px;
        font-weight: 700;
      }
    }
  }
}

:deep(.ellipsisHidden) {
  display: inline-block;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
</style>
