<script setup lang="ts">
import type { Item, ItemKind } from '~/types/item'

// Board data comes from the store; selection, editing, tool and clipboard are local UI state.
const { items, addItem, insertCopy, removeItem, setRect, moveBy, setText, setStyle } = useBoard()

const selectedId = ref<string | null>(null)
const editingId = ref<string | null>(null)
const activeTool = ref<ItemKind | null>(null)
const clipboard = ref<Item | null>(null)

const selectedItem = computed(() => items.value.find((item) => item.id === selectedId.value))

const canvas = useTemplateRef('canvas')
const pointer = ref({ x: 0, y: 0 })
let downAt: { x: number; y: number } | null = null

function onPointerDown(event: PointerEvent) {
  selectedId.value = null
  editingId.value = null
  downAt = { x: event.clientX, y: event.clientY }
}

function onPointerMove(event: PointerEvent) {
  if (canvas.value) pointer.value = canvas.value.toWorld(event.clientX, event.clientY)
}

// Items stop their pointerdown, so downAt is only set for clicks on the empty canvas.
function onClick(event: MouseEvent) {
  const isClick = downAt && Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y) < 4
  downAt = null
  if (!isClick || !activeTool.value || !canvas.value) return
  const at = canvas.value.toWorld(event.clientX, event.clientY)
  addItem(activeTool.value, at.x, at.y)
}

function moveSelected(dx: number, dy: number) {
  if (selectedId.value) moveBy(selectedId.value, dx * GRID_SIZE, dy * GRID_SIZE)
}

const ACTIONS: Record<ShortcutAction, () => void> = {
  copy: () => {
    if (selectedItem.value) clipboard.value = { ...selectedItem.value }
  },
  cut: () => {
    ACTIONS.copy()
    ACTIONS.delete()
  },
  // Every paste lands one grid step further, so repeated pastes don't stack.
  paste: () => {
    if (!clipboard.value) return
    selectedId.value = insertCopy(clipboard.value, GRID_SIZE, GRID_SIZE)
    clipboard.value = { ...clipboard.value, x: clipboard.value.x + GRID_SIZE, y: clipboard.value.y + GRID_SIZE }
  },
  duplicate: () => {
    if (selectedItem.value) selectedId.value = insertCopy(selectedItem.value, GRID_SIZE, GRID_SIZE)
  },
  delete: () => {
    if (!selectedId.value) return
    removeItem(selectedId.value)
    selectedId.value = null
  },
  escape: () => {
    if (activeTool.value) activeTool.value = null
    else selectedId.value = null
  },
  moveUp: () => moveSelected(0, -1),
  moveDown: () => moveSelected(0, 1),
  moveLeft: () => moveSelected(-1, 0),
  moveRight: () => moveSelected(1, 0),
}

function onKeyDown(event: KeyboardEvent) {
  if (event.target instanceof HTMLTextAreaElement) return
  const action = findShortcut(event)
  if (!action) return
  event.preventDefault()
  ACTIONS[action]()
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <InfiniteCanvas ref="canvas" @pointerdown="onPointerDown" @pointermove="onPointerMove" @click="onClick">
    <CanvasItem
      v-for="item in items"
      :key="item.id"
      :item="item"
      :selected="selectedId === item.id"
      :editing="editingId === item.id"
      @select="selectedId = item.id"
      @rect="setRect(item.id, $event)"
      @text="setText(item.id, $event)"
      @start-edit="editingId = item.id"
      @stop-edit="editingId = null"
    />
    <CanvasItem
      v-if="activeTool"
      :item="createItem(activeTool, pointer.x, pointer.y)"
      :selected="false"
      :editing="false"
      class="pointer-events-none opacity-60"
    />
    <ItemContextBar v-if="selectedItem" :item="selectedItem" @style="setStyle(selectedItem.id, $event)" />
  </InfiniteCanvas>
  <ItemToolbar v-model="activeTool" />
</template>
