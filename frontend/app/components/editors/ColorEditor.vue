<script setup lang="ts">
import type { ItemColor } from '~/types/item'

const value = defineModel<ItemColor>({ required: true })
</script>

<template>
  <ToggleGroup
    :model-value="value"
    type="single"
    orientation="horizontal"
    @update:model-value="$event && (value = $event as ItemColor)"
  >
    <ToggleGroupItem v-for="(c, name) in ITEM_COLORS" :key="name" :value="name" :aria-label="c.label">
      <span class="size-5 rounded-full border" :style="{ backgroundColor: c.fill }" />
    </ToggleGroupItem>
  </ToggleGroup>
</template>
