<template>
  <div class="empty">
    <img
      :src="isSearch ? searchImg : emptyImg"
      alt=""
    />
    <p>{{ isSearch ? '查询结果为空' : '暂无数据' }}</p>
  </div>
</template>

<script setup lang="ts">
import searchImg from '@/assets/search_table_empty.png'
import emptyImg from '@/assets/table_empty.png'

withDefaults(defineProps<{ isSearch?: boolean }>(), { isSearch: false })
</script>

<style lang="scss" scoped>
.empty {
  padding: 40px 0 60px;
  text-align: center;
  color: #818693;

  img {
    width: 160px;
  }

  p {
    margin-top: 10px;
    font-size: 12px;
  }
}
</style>
