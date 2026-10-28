<script setup lang="ts">
import type { Item, ItemStyle } from '~/types/item'

// Stateless: shows one editor per attribute the item has and reports changes.
const props = defineProps<{ item: Readonly<Item> }>()
const emit = defineEmits<{ style: [changes: Partial<ItemStyle>] }>()

const scale = inject<Ref<number>>('canvasScale', ref(1))
const editors = computed(() => ATTRIBUTE_EDITORS.filter((editor) => editor.attribute in props.item))
</script>

<template>
  <!-- Zero-size anchor at the item's top-left corner; undoing the zoom keeps the bar the same size. -->
  <div
    class="absolute size-0 origin-top-left"
    :style="{ left: `${item.x}px`, top: `${item.y}px`, transform: `scale(${1 / scale})` }"
  >
    <div
      class="absolute bottom-2 left-0 flex w-max flex-row items-center gap-1 rounded-xl border bg-background p-1 shadow-lg"
      @pointerdown.stop
      @dblclick.stop
    >
      <template v-for="(editor, i) in editors" :key="editor.attribute">
        <div v-if="i > 0" class="h-6 w-px bg-border" />
        <component
          :is="editor.component"
          :model-value="item[editor.attribute]"
          @update:model-value="emit('style', { [editor.attribute]: $event })"
        />
      </template>
    </div>
  </div>
</template>
