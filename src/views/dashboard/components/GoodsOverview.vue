<template>
  <div class="container">
    <h2 class="homeTitle">
      {{ title }}
      <span>
        <router-link :to="link">{{ linkText }}</router-link>
      </span>
    </h2>
    <div class="orderviewBox">
      <ul>
        <li>
          <span class="status"><i class="iconfont icon-open" />已启售</span>
          <span class="num">{{ data.sold }}</span>
        </li>
        <li>
          <span class="status"><i class="iconfont icon-stop" />已停售</span>
          <span class="num">{{ data.discontinued }}</span>
        </li>
        <li class="add">
          <router-link :to="addLink">
            <i />
            <p>{{ addText }}</p>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DishOverview } from '@/api/workspace'

withDefaults(
  defineProps<{
    data: Partial<DishOverview>
    title: string
    link: string
    linkText: string
    addLink: string
    addText: string
  }>(),
  {
    data: () => ({}),
    title: '菜品总览',
    link: '/dish',
    linkText: '菜品管理',
    addLink: '/dish/add',
    addText: '新增菜品',
  },
)
</script>
