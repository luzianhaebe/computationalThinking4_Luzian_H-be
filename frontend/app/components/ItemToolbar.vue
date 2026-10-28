<script setup lang="ts">
import { Circle, StickyNote, Type } from '@lucide/vue'
import type { ItemKind } from '~/types/item'

const tool = defineModel<ItemKind | null>({ required: true })

const TOOLS = [
  { kind: 'note', label: 'Post-it', icon: StickyNote },
  { kind: 'text', label: 'Text', icon: Type },
  { kind: 'circle', label: 'Kreis', icon: Circle },
] as const
</script>

<template>
  <div class="fixed bottom-6 left-1/2 flex -translate-x-1/2 flex-row items-center gap-2 rounded-xl border bg-background p-1 shadow-lg">
    <ToggleGroup
      :model-value="tool ?? undefined"
      type="single"
      orientation="horizontal"
      @update:model-value="tool = (($event as ItemKind | undefined) ?? null)"
    >
      <ToggleGroupItem v-for="t in TOOLS" :key="t.kind" :value="t.kind" :aria-label="t.label">
        <component :is="t.icon" />
        {{ t.label }}
      </ToggleGroupItem>
    </ToggleGroup>
  </div>
</template>
