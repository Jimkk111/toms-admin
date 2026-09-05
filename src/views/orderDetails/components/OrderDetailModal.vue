<template>
  <n-modal
    :show="show"
    preset="card"
    title="订单信息"
    style="width: 53%"
    @update:show="handleClose"
  >
    <div class="order-top">
      <div>
        <div class="order-num-wrap">
          <span class="label">订单号：</span>
          <span class="order-num">{{ diaForm.number }}</span>
        </div>
        <span
          class="order-status"
          :class="{ status3: [3, 4].includes(dialogOrderStatus) }"
        >
          {{ statusLabel }}
        </span>
      </div>
      <p><label>下单时间：</label>{{ diaForm.orderTime }}</p>
    </div>

    <div class="order-middle">
      <div class="user-info">
        <div class="user-info-box">
          <div>
            <label>用户名：</label>
            <span>{{ diaForm.consignee }}</span>
          </div>
          <div>
            <label>手机号：</label>
            <span>{{ diaForm.phone }}</span>
          </div>
          <div v-if="[2, 3, 4, 5].includes(dialogOrderStatus)">
            <label>{{ dialogOrderStatus === 5 ? '送达时间：' : '预计送达时间：' }}</label>
            <span>{{
              dialogOrderStatus === 5 ? diaForm.deliveryTime : diaForm.estimatedDeliveryTime
            }}</span>
          </div>
          <div>
            <label>地址：</label>
            <span>{{ diaForm.address }}</span>
          </div>
        </div>
        <div
          class="user-remark"
          :class="{ orderCancel: dialogOrderStatus === 6 }"
        >
          <div>{{ dialogOrderStatus === 6 ? '取消原因' : '备注' }}</div>
          <span>{{
            dialogOrderStatus === 6
              ? diaForm.cancelReason || diaForm.rejectionReason
              : diaForm.remark
          }}</span>
        </div>
      </div>

      <div class="dish-info">
        <div class="dish-label">菜品</div>
        <div class="dish-list">
          <div
            v-for="(item, index) in diaForm.orderDetailList"
            :key="index"
            class="dish-item"
          >
            <div class="dish-item-box">
              <span class="dish-name">{{ item.name }}</span>
              <span class="dish-num">x{{ item.number }}</span>
            </div>
            <span class="dish-price">￥{{ item.amount ? Number(item.amount).toFixed(2) : '' }}</span>
          </div>
        </div>
        <div class="dish-all-amount">
          <label>菜品小计</label>
          <span>￥{{ dishSubtotal }}</span>
        </div>
      </div>
    </div>

    <div class="order-bottom">
      <div class="amount-info">
        <div class="amount-label">费用</div>
        <div class="amount-list">
          <div>
            <span class="amount-name">菜品小计：</span>
            <span class="amount-price">￥{{ dishSubtotal }}</span>
          </div>
          <div>
            <span class="amount-name">派送费：</span>
            <span class="amount-price">￥6</span>
          </div>
          <div>
            <span class="amount-name">打包费：</span>
            <span class="amount-price">￥{{ packAmount }}</span>
          </div>
          <div>
            <span class="amount-name">合计：</span>
            <span class="amount-price">￥{{ totalAmount }}</span>
          </div>
          <div>
            <span class="pay-name">支付渠道：</span>
            <span class="pay-value">{{ diaForm.payMethod === 1 ? '微信支付' : '支付宝支付' }}</span>
          </div>
          <div>
            <span class="pay-name">支付时间：</span>
            <span class="pay-value">{{ diaForm.checkoutTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <template v-if="dialogOrderStatus !== 6" #footer>
      <div class="dialog-footer">
        <n-checkbox
          v-if="dialogOrderStatus === 2 && listOrderStatus === 2"
          v-model:checked="autoNext"
        >
          处理完自动跳转下一条
        </n-checkbox>
        <slot name="footer" :auto-next="autoNext" />
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { OrderItem } from '@/api/order'

defineOptions({ name: 'OrderDetailModal' })

const props = defineProps<{
  show: boolean
  diaForm: Partial<OrderItem>
  dialogOrderStatus: number
  listOrderStatus: number
  statusLabel: string
}>()

const emit = defineEmits<{ 'update:show': [visible: boolean] }>()

// 弹窗内“处理完自动跳转下一条”选择，通过 footer 插槽传给父组件
const autoNext = ref(true)

const handleClose = (visible: boolean) => {
  emit('update:show', visible)
}

const dishSubtotal = computed(() =>
  props.diaForm.amount ? (props.diaForm.amount - 6 - (props.diaForm.packAmount ?? 0)).toFixed(2) : '',
)
const packAmount = computed(() =>
  props.diaForm.packAmount ? Number(props.diaForm.packAmount).toFixed(2) : '',
)
const totalAmount = computed(() =>
  props.diaForm.amount ? Number(props.diaForm.amount).toFixed(2) : '',
)
</script>

<style lang="scss" scoped>
.order-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed #e5e4e4;
  padding-bottom: 12px;

  .order-num-wrap {
    display: inline-block;
    margin-right: 12px;

    .order-num {
      font-size: 16px;
      font-weight: 700;
      display: inline-block;
    }
  }

  .order-status {
    display: inline-block;
    padding: 0 10px;
    line-height: 24px;
    background: #fffbf0;
    border: 1px solid #fbe396;
    border-radius: 4px;
    color: #333;
    font-size: 12px;

    &.status3 {
      background: #f2f3f5;
      border-color: #d8dde3;
    }
  }
}

.order-middle {
  display: flex;
  gap: 20px;
  padding: 16px 0;

  .user-info {
    flex: 1.2;

    .user-info-box div {
      line-height: 28px;

      label {
        color: #818693;
      }
    }

    .user-remark {
      margin-top: 10px;
      background: #f7f8fa;
      border-radius: 4px;
      padding: 10px;

      > div {
        font-weight: 700;
        margin-bottom: 6px;
      }

      &.orderCancel {
        background: #fff4f4;
      }
    }
  }

  .dish-info {
    flex: 1;

    .dish-label,
    .amount-label {
      font-weight: 700;
      margin-bottom: 8px;
    }

    .dish-item {
      display: flex;
      justify-content: space-between;
      line-height: 28px;

      .dish-item-box {
        .dish-num {
          margin-left: 12px;
          color: #818693;
        }
      }
    }

    .dish-all-amount {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed #e5e4e4;
      font-weight: 700;
    }
  }
}

.order-bottom .amount-list div {
  display: flex;
  justify-content: space-between;
  line-height: 28px;

  .amount-name,
  .pay-name {
    color: #818693;
  }
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
</style>
