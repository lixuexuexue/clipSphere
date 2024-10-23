<script setup lang="ts">
const containerRef = ref<HTMLElement | null>(null)
</script>

<template>
  <div>
    <div ref="containerRef" class="container" @scroll="handleScroll">
      <span>加载更多</span>
      <li v-if="loading">
        Loading...
      </li>
    </div>
  </div>
</template>

<style scoped>

</style>
