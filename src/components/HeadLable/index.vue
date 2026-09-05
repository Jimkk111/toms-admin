<template>
  <div class="head-lable">
    <span
      v-if="goback"
      class="go-back"
      @click="goBack"
    >
      <img
        src="@/assets/icons/btn_back@2x.png"
        alt=""
      />
      返回
    </span>
    <span v-if="!butList">{{ title }}</span>
    <div v-if="butList">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

withDefaults(
  defineProps<{
    goback?: boolean
    butList?: boolean
    title?: string
  }>(),
  { goback: false, butList: false, title: '集团管理' },
)

const router = useRouter()
const goBack = () => router.go(-1)
</script>

<style lang="scss" scoped>
.head-lable {
  background: #fff;
  color: #333333;
  height: 64px;
  font-size: 16px;
  padding-left: 22px;
  line-height: 64px;
  font-weight: 700;
  margin-bottom: 15px;

  .go-back {
    border-right: solid 1px #d8dde3;
    padding-right: 14px;
    margin-right: 14px;
    font-size: 16px;
    color: #333333;
    cursor: pointer;
    font-weight: 400;

    img {
      position: relative;
      top: 24px;
      margin-right: 5px;
      width: 18px;
      height: 18px;
      float: left;
    }
  }
}
</style>
