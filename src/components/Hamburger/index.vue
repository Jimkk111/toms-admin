<template>
  <div
    :class="[{ 'is-active': isActive }]"
    @click="emit('toggleClick')"
  >
    <SvgIcon
      name="hamburger"
      width="20"
      height="20"
    />
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/SvgIcon/index.vue'

defineProps<{ isActive?: boolean }>()
const emit = defineEmits<{ toggleClick: [] }>()
</script>

<style lang="scss" scoped>
.svg-icon {
  vertical-align: middle;
}

.is-active {
  transform: rotate(180deg);
}
</style>
