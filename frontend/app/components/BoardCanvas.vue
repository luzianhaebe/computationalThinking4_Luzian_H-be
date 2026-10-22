<script setup lang="ts">
const { notes, pan, placing, selectedIds, addNote } = useBoard()

const mouse = ref({ x: 0, y: 0 })
const spaceDown = ref(false)
const box = ref<{ left: number; top: number; width: number; height: number } | null>(null)
let drag: { x: number; y: number; moved: boolean; panning: boolean } | null = null

function onPointerDown(e: PointerEvent) {
  if (!spaceDown.value) selectedIds.value = []
  drag = { x: e.clientX, y: e.clientY, moved: false, panning: spaceDown.value }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!drag) return
  const dx = e.clientX - drag.x
  const dy = e.clientY - drag.y
  if (!drag.moved && Math.hypot(dx, dy) < 4) return
  drag.moved = true
  if (drag.panning) {
    pan.value = { x: pan.value.x + dx, y: pan.value.y + dy }
    drag.x = e.clientX
    drag.y = e.clientY
  } else if (!placing.value) {
    selectWithBox(e)
  }
}

function selectWithBox(e: PointerEvent) {
  const left = Math.min(drag!.x, e.clientX) - pan.value.x
  const top = Math.min(drag!.y, e.clientY) - pan.value.y
  const right = left + Math.abs(e.clientX - drag!.x)
  const bottom = top + Math.abs(e.clientY - drag!.y)
  box.value = { left, top, width: right - left, height: bottom - top }
  selectedIds.value = notes.value
    .filter((n) => n.x < right && n.x + n.width > left && n.y < bottom && n.y + n.height > top)
    .map((n) => n.id)
}

function onPointerUp(e: PointerEvent) {
  if (drag && !drag.moved && !drag.panning && placing.value) {
    addNote(e.clientX - pan.value.x - NOTE_SIZE / 2, e.clientY - pan.value.y - NOTE_SIZE / 2)
  }
  drag = null
  box.value = null
}

function onWheel(e: WheelEvent) {
  pan.value = { x: pan.value.x - e.deltaX, y: pan.value.y - e.deltaY }
}

function trackMouse(e: PointerEvent) {
  mouse.value = { x: e.clientX, y: e.clientY }
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') placing.value = false
  if (e.target instanceof HTMLTextAreaElement) return
  if (e.key === ' ') {
    e.preventDefault()
    spaceDown.value = true
  }
  const isDeleteKey = e.key === 'Delete' || e.key === 'Backspace'
  if (isDeleteKey && selectedIds.value.length) {
    notes.value = notes.value.filter((note) => !selectedIds.value.includes(note.id))
    selectedIds.value = []
  }
}

function onKeyUp(e: KeyboardEvent) {
  if (e.key !== ' ' || e.target instanceof HTMLTextAreaElement) return
  e.preventDefault()
  spaceDown.value = false
}

onMounted(() => {
  window.addEventListener('pointermove', trackMouse)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})
onUnmounted(() => {
  window.removeEventListener('pointermove', trackMouse)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})
</script>

<template>
  <div
    class="fixed inset-0 overflow-hidden bg-neutral-100 select-none"
    :class="spaceDown ? 'cursor-grab active:cursor-grabbing' : placing && 'cursor-crosshair'"
    :style="{
      backgroundImage: 'radial-gradient(#d4d4d4 1px, transparent 1px)',
      backgroundSize: `${GRID}px ${GRID}px`,
      backgroundPosition: `${pan.x - GRID / 2}px ${pan.y - GRID / 2}px`,
    }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @wheel.prevent="onWheel"
  >
    <div class="absolute left-0 top-0" :style="{ transform: `translate(${pan.x}px, ${pan.y}px)` }">
      <StickyNote v-for="note in notes" :key="note.id" :note="note" />
      <div
        v-if="box"
        class="absolute border border-blue-500 bg-blue-500/10"
        :style="{ left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` }"
      />
    </div>
  </div>

  <div
    v-if="placing"
    class="pointer-events-none fixed z-20 rounded-sm bg-yellow-200 opacity-70 shadow-lg"
    :style="{
      left: `${snap(mouse.x - pan.x - NOTE_SIZE / 2) + pan.x}px`,
      top: `${snap(mouse.y - pan.y - NOTE_SIZE / 2) + pan.y}px`,
      width: `${NOTE_SIZE}px`,
      height: `${NOTE_SIZE}px`,
    }"
  />
</template>
