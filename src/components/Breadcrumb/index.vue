<template>
  <n-breadcrumb class="breadcrumb">
    <n-breadcrumb-item
      v-for="item in items"
      :key="item.path"
      @click="router.push(item.path)"
    >
      {{ item.title }}
    </n-breadcrumb-item>
  </n-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const items = computed(() =>
  route.matched
    .filter((r) => r.meta?.title && !r.meta?.hidden)
    .map((r) => ({ path: r.path, title: r.meta.title as string })),
)
</script>
