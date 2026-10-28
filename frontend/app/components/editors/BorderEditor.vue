<script setup lang="ts">
const value = defineModel<number>({ required: true })

const WIDTHS = [1, 2, 4]
</script>

<template>
  <ToggleGroup
    :model-value="value"
    type="single"
    orientation="horizontal"
    @update:model-value="$event && (value = $event as number)"
  >
    <ToggleGroupItem v-for="w in WIDTHS" :key="w" :value="w" :aria-label="`Rand ${w} px`">
      <span class="w-5 rounded-full bg-foreground" :style="{ height: `${w}px` }" />
    </ToggleGroupItem>
  </ToggleGroup>
</template>
