<template>
  <div class="order-page">
    <TabChange
      :order-statics="orderStatics"
      :default-activity="defaultActivity"
      @tab-change="changeTab"
    />

    <div class="container">
      <!-- 搜索项 -->
      <div class="tableBar search-bar">
        <span class="label">订单号：</span>
        <n-input
          v-model:value="input"
          placeholder="请填写订单号"
          clearable
          style="width: 180px"
          @clear="searchWithReset(true)"
          @keyup.enter="searchWithReset(true)"
        />
        <span class="label">手机号：</span>
        <n-input
          v-model:value="phone"
          placeholder="请填写手机号"
          clearable
          style="width: 180px"
          @clear="searchWithReset(true)"
          @keyup.enter="searchWithReset(true)"
        />
        <span class="label">下单时间：</span>
        <n-date-picker
          v-model:formatted-value="valueTime"
          clearable
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          :default-time="['00:00:00', '23:59:59']"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 340px"
          @clear="searchWithReset(true)"
        />
        <n-button
          class="normal-btn"
          @click="searchWithReset(true)"
        >
          查询
        </n-button>
      </div>

      <n-data-table
        v-if="tableData.length"
        remote
        striped
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: OrderItem) => row.id"
        :scroll-x="1200"
      />
      <Empty
        v-else
        :is-search="isSearch"
      />
    </div>

    <!-- 查看订单信息 -->
    <OrderDetailModal
      v-model:show="detailVisible"
      :dia-form="diaForm"
      :dialog-order-status="dialogOrderStatus"
      :list-order-status="orderStatus"
      :status-label="statusLabel"
    >
      <template #footer="{ autoNext }">
        <n-button
          v-if="dialogOrderStatus === 2"
          @click="rejectOrder(dialogRow)"
        >
          拒 单
        </n-button>
        <n-button
          v-if="dialogOrderStatus === 2"
          type="primary"
          @click="acceptOrder(dialogRow, autoNext)"
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
        <n-button
          v-if="dialogOrderStatus === 4"
          type="primary"
          @click="deliveryOrComplete(4)"
        >
          完 成
        </n-button>
        <n-button
          v-if="[1].includes(dialogOrderStatus)"
          type="primary"
          @click="openCancelModal(dialogRow)"
        >
          取消订单
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
import { computed, h, onMounted, ref, unref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, type DataTableColumns } from 'naive-ui'
import {
  getOrderDetailPage,
  queryOrderDetailById,
  completeOrder,
  deliveryOrder,
  orderCancel,
  orderReject,
  orderAccept,
  getOrderListBy,
} from '@/api/order'
import type { OrderItem, OrderStatics } from '@/api/order'
import { useTable } from '@/composables/useTable'
import { message } from '@/utils/feedback'
import TabChange from './components/TabChange.vue'
import OrderDetailModal from './components/OrderDetailModal.vue'
import OrderCancelModal from './components/OrderCancelModal.vue'
import Empty from '@/components/Empty/index.vue'

defineOptions({ name: 'Order' })

const route = useRoute()
const router = useRouter()

const statusText = (status: number) =>
  ([
    { v: 1, t: '待付款' },
    { v: 2, t: '待接单' },
    { v: 3, t: '待派送' },
    { v: 4, t: '派送中' },
    { v: 5, t: '已完成' },
    { v: 6, t: '已取消' },
  ].find((it) => it.v === status)?.t ?? '退款')

// 列表状态
const orderStatus = ref(0)
const defaultActivity = ref(0)
const orderStatics = ref<OrderStatics>({})
const input = ref('')
const phone = ref('')
const valueTime = ref<[string, string] | null>(null)
const isSearch = ref(false)

async function fetcher(params: { page: number; pageSize: number }) {
  const { data } = await getOrderDetailPage({
    ...params,
    number: input.value || undefined,
    phone: phone.value || undefined,
    beginTime: valueTime.value?.[0],
    endTime: valueTime.value?.[1],
    status: orderStatus.value || undefined,
  })
  return data.data
}

const { loading, tableData, pagination, search: searchTable } = useTable<OrderItem>(fetcher)

const fetchStatics = async () => {
  const { data } = await getOrderListBy()
  if (String(data.code) === '1') {
    orderStatics.value = data.data
  } else {
    message.error(data.msg ?? '获取订单统计失败')
  }
}

// 处理完自动跳转下一条
const isAutoNext = ref(true)
const isTableOperateBtn = ref(true)

const search = (resetPage = false) => {
  searchTable(resetPage).then(() => {
    // 弹窗内处理完当前单后，自动打开下一条待接单
    if (
      dialogOrderStatus.value === 2 &&
      orderStatus.value === 2 &&
      isAutoNext.value &&
      !isTableOperateBtn.value &&
      tableData.value.length > 1
    ) {
      const row = tableData.value[0]
      goDetail(row.id, row.status, row)
    }
  })
}

onMounted(() => {
  const status = Number(route.query.status) || 0
  orderStatus.value = status
  defaultActivity.value = status
  searchTable()
  fetchStatics()
  // 消息通知跳转进来的直接打开详情
  if (route.query.orderId && route.query.orderId !== 'undefined') {
    goDetail(String(route.query.orderId), 2)
  }
})

const changeTab = (status: number) => {
  if (status === orderStatus.value) return
  input.value = ''
  phone.value = ''
  valueTime.value = null
  router.push('/order')
  orderStatus.value = status
  search(true)
}

const searchWithReset = (reset = false) => {
  isSearch.value = reset
  search(reset)
}

// 表格列按状态动态渲染
const renderTextBtn = (label: string, cls: string, onClick: () => void) =>
  h(
    NButton,
    { text: true, size: 'small', class: cls, style: { marginRight: '10px' }, onClick },
    { default: () => label },
  )

const columns = computed<DataTableColumns<OrderItem>>(() => {
  const s = orderStatus.value
  const cols: DataTableColumns<OrderItem> = [{ title: '订单号', key: 'number', width: 170 }]
  if ([2, 3, 4].includes(s)) cols.push({ title: '订单菜品', key: 'orderDishes', ellipsis: { tooltip: true } })
  if ([0].includes(s))
    cols.push({ title: '订单状态', key: 'status', render: (row) => statusText(row.status) })
  if ([0, 5, 6].includes(s)) {
    cols.push({ title: '用户名', key: 'consignee', ellipsis: { tooltip: true } })
    cols.push({ title: '手机号', key: 'phone' })
  }
  cols.push({ title: '地址', key: 'address', ellipsis: { tooltip: true } })
  if ([0, 6].includes(s)) cols.push({ title: '下单时间', key: 'orderTime', width: 160 })
  if ([6].includes(s)) cols.push({ title: '取消时间', key: 'cancelTime', width: 160 })
  if ([6].includes(s)) cols.push({ title: '取消原因', key: 'cancelReason', ellipsis: { tooltip: true } })
  if ([5].includes(s)) cols.push({ title: '送达时间', key: 'deliveryTime', width: 160 })
  if ([2, 3, 4].includes(s)) cols.push({ title: '预计送达时间', key: 'estimatedDeliveryTime', width: 160 })
  if ([0, 2, 5].includes(s))
    cols.push({
      title: '实收金额',
      key: 'amount',
      align: 'center',
      render: (row) => `￥${Number(row.amount).toFixed(2)}`,
    })
  if ([2, 3, 4, 5].includes(s)) cols.push({ title: '备注', key: 'remark', align: 'center', ellipsis: { tooltip: true } })
  if ([2, 3, 4].includes(s)) cols.push({ title: '餐具数量', key: 'tablewareNumber', align: 'center', width: 80 })

  cols.push({
    title: '操作',
    key: 'actions',
    align: 'center',
    width: [2, 3, 4].includes(s) ? 150 : 140,
    render: (row) => {
      const btns = []
      if (row.status === 2) btns.push(renderTextBtn('接单', 'blueBug', () => acceptOrder(row)))
      if (row.status === 3) btns.push(renderTextBtn('派送', 'blueBug', () => deliveryOrComplete(3, row.id)))
      if (row.status === 4) btns.push(renderTextBtn('完成', 'blueBug', () => deliveryOrComplete(4, row.id)))
      if (row.status === 2) btns.push(renderTextBtn('拒单', 'delBut', () => rejectOrder(row)))
      if ([1, 3, 4, 5].includes(row.status))
        btns.push(renderTextBtn('取消', 'delBut', () => openCancelModal(row)))
      btns.push(renderTextBtn('查看', 'blueBug', () => goDetail(row.id, row.status, row)))
      return btns
    },
  })
  return cols
})

// 详情弹窗
const detailVisible = ref(false)
const dialogOrderStatus = ref(0)
const dialogRow = ref<Partial<OrderItem>>({})
const diaForm = ref<Partial<OrderItem>>({})

const statusLabel = computed(
  () =>
    ([
      { v: 0, t: '全部订单' },
      { v: 1, t: '待付款' },
      { v: 2, t: '待接单' },
      { v: 3, t: '待派送' },
      { v: 4, t: '派送中' },
      { v: 5, t: '已完成' },
      { v: 6, t: '已取消' },
    ].find((it) => it.v === dialogOrderStatus.value)?.t ?? ''),
)

const goDetail = async (id: number | string, status: number, row?: OrderItem) => {
  diaForm.value = {}
  detailVisible.value = true
  dialogOrderStatus.value = status
  const { data } = await queryOrderDetailById(id)
  diaForm.value = data.data ?? {}
  dialogRow.value = row ?? { id: String(route.query.orderId ?? ''), status }
  if (route.query.orderId) {
    router.push('/order')
  }
}

// 接单
const acceptOrder = async (row: Partial<OrderItem>, autoNext?: unknown) => {
  if (autoNext !== undefined) isAutoNext.value = unref(autoNext) as boolean
  isTableOperateBtn.value = autoNext === undefined
  const { data } = await orderAccept({ id: row.id! })
  if (String(data.code) === '1') {
    message.success('操作成功')
    detailVisible.value = false
    search(false)
  } else {
    message.error(data.msg ?? '操作失败')
  }
}

// 拒单 / 取消
const cancelDialogVisible = ref(false)
const cancelDialogTitle = ref<'取消' | '拒绝'>('取消')

const rejectOrder = (row: Partial<OrderItem>) => {
  cancelDialogTitle.value = '拒绝'
  dialogRow.value = row
  detailVisible.value = false
  cancelDialogVisible.value = true
}

const openCancelModal = (row: Partial<OrderItem>) => {
  cancelDialogTitle.value = '取消'
  dialogRow.value = row
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
    search(false)
  } else {
    message.error(data.msg ?? '操作失败')
  }
}

// 派送 / 完成（弹窗内不传 id，取当前查看的订单）
const deliveryOrComplete = async (status: number, id?: number | string) => {
  const orderId = id ?? dialogRow.value.id!
  const { data } = status === 3 ? await deliveryOrder(orderId) : await completeOrder(orderId)
  if (String(data.code) === '1') {
    message.success('操作成功')
    detailVisible.value = false
    search(false)
  } else {
    message.error(data.msg ?? '操作失败')
  }
}
</script>

<style lang="scss" scoped>
.order-page {
  min-height: 700px;

  .container {
    background: #fff;
    position: relative;
    z-index: 1;
    padding: 25px 25px 20px;
    border-radius: 4px;
  }
}

.search-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  .label {
    margin-right: 8px;
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
