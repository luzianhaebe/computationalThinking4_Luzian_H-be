<script setup lang="ts">
const { placing } = useBoard()
</script>

<template>
  <button
    class="fixed bottom-8 left-1/2 z-10 size-20 -translate-x-1/2 cursor-pointer"
    :class="placing && 'scale-90'"
    @click="placing = !placing"
  >
    <div
      v-for="i in 3"
      :key="i"
      class="absolute inset-0 rounded-sm bg-yellow-200 shadow-md"
      :style="{ transform: `translate(${(3 - i) * 3}px, ${(3 - i) * 3}px)` }"
    />
  </button>
</template>
