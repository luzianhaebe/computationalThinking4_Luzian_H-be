<script setup lang="ts">
const value = defineModel<number>({ required: true })

const SIZES = [
  { label: 'S', size: 14 },
  { label: 'M', size: 18 },
  { label: 'L', size: 24 },
  { label: 'XL', size: 32 },
]
</script>

<template>
  <ToggleGroup
    :model-value="value"
    type="single"
    orientation="horizontal"
    @update:model-value="$event && (value = $event as number)"
  >
    <ToggleGroupItem v-for="s in SIZES" :key="s.size" :value="s.size" :aria-label="`Schriftgröße ${s.label}`">
      {{ s.label }}
    </ToggleGroupItem>
  </ToggleGroup>
</template>
