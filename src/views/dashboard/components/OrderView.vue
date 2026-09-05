<template>
  <div class="container">
    <h2 class="homeTitle">
      订单管理<i>{{ days[1] }}</i>
      <span>
        <router-link to="/order">订单明细</router-link>
      </span>
    </h2>
    <div class="orderviewBox">
      <ul>
        <li>
          <span class="status"><i class="iconfont icon-waiting" />待接单</span>
          <span class="num tip">
            <router-link to="/order?status=2">{{ data.waitingOrders }}</router-link>
          </span>
        </li>
        <li>
          <span class="status"><i class="iconfont icon-stay" />待派送</span>
          <span class="num tip">
            <router-link to="/order?status=3">{{ data.deliveredOrders }}</router-link>
          </span>
        </li>
        <li>
          <span class="status"><i class="iconfont icon-complete" />已完成</span>
          <span class="num">
            <router-link to="/order?status=5">{{ data.completedOrders }}</router-link>
          </span>
        </li>
        <li>
          <span class="status"><i class="iconfont icon-cancel" />已取消</span>
          <span class="num">
            <router-link to="/order?status=6">{{ data.cancelledOrders }}</router-link>
          </span>
        </li>
        <li>
          <span class="status"><i class="iconfont icon-all" />全部订单</span>
          <span class="num">
            <router-link to="/order">{{ data.allOrders }}</router-link>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderOverview } from '@/api/workspace'
import { getday } from '@/utils/date'

defineProps<{ data: Partial<OrderOverview> }>()
const days = getday()
</script>
