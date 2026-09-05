<template>
  <svg
    :class="svgClass"
    :style="{ width, height }"
    aria-hidden="true"
  >
    <use :xlink:href="symbolId" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    prefix?: string
    width?: string
    height?: string
  }>(),
  { prefix: 'icon', width: '1em', height: '1em' },
)

const symbolId = computed(() => `#${props.prefix}-${props.name}`)
const svgClass = computed(() => ['svg-icon', `svg-icon-${props.name}`])
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
  overflow: hidden;
}
</style>
