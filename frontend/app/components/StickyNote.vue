<script setup lang="ts">
import type { Note } from '~/composables/useBoard'

const MIN_SIZE = GRID * 3

const props = defineProps<{ note: Note }>()
const { notes, selectedIds } = useBoard()
const selected = computed(() => selectedIds.value.includes(props.note.id))

const editing = ref(false)
const textarea = ref<HTMLTextAreaElement>()

async function startEditing() {
  editing.value = true
  await nextTick()
  textarea.value?.focus()
}

let move: { mx: number; my: number; moved: boolean; starts: { note: Note; x: number; y: number }[] } | null = null

function startMove(e: PointerEvent) {
  if (!selected.value) selectedIds.value = [props.note.id]
  if (editing.value) return
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  const moving = notes.value.filter((n) => selectedIds.value.includes(n.id))
  move = { mx: e.clientX, my: e.clientY, moved: false, starts: moving.map((n) => ({ note: n, x: n.x, y: n.y })) }
}

function onMove(e: PointerEvent) {
  if (!move) return
  const dx = snap(e.clientX - move.mx)
  const dy = snap(e.clientY - move.my)
  if (dx || dy) move.moved = true
  for (const s of move.starts) {
    s.note.x = s.x + dx
    s.note.y = s.y + dy
  }
}

function endMove() {
  if (move && !move.moved) selectedIds.value = [props.note.id]
  move = null
}

const corners = [
  { dx: -1, dy: -1, class: '-left-1.5 -top-1.5 cursor-nwse-resize' },
  { dx: 1, dy: -1, class: '-right-1.5 -top-1.5 cursor-nesw-resize' },
  { dx: -1, dy: 1, class: '-left-1.5 -bottom-1.5 cursor-nesw-resize' },
  { dx: 1, dy: 1, class: '-right-1.5 -bottom-1.5 cursor-nwse-resize' },
]
type Corner = (typeof corners)[number]

let start: { corner: Corner; mx: number; my: number; x: number; y: number; w: number; h: number } | null = null

function startResize(e: PointerEvent, corner: Corner) {
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  const { x, y, width: w, height: h } = props.note
  start = { corner, mx: e.clientX, my: e.clientY, x, y, w, h }
}

function onResize(e: PointerEvent) {
  if (!start) return
  const note = props.note
  const dx = e.clientX - start.mx
  const dy = e.clientY - start.my
  note.width = Math.max(MIN_SIZE, snap(start.w + dx * start.corner.dx))
  note.height = Math.max(MIN_SIZE, snap(start.h + dy * start.corner.dy))
  if (start.corner.dx === -1) note.x = start.x + start.w - note.width
  if (start.corner.dy === -1) note.y = start.y + start.h - note.height
}
</script>

<template>
  <div
    class="absolute rounded-sm bg-yellow-200 shadow-md"
    :class="[selected && 'ring-2 ring-blue-500', !editing && 'cursor-move']"
    :style="{ left: `${note.x}px`, top: `${note.y}px`, width: `${note.width}px`, height: `${note.height}px` }"
    @pointerdown.stop="startMove"
    @pointermove="onMove"
    @pointerup="endMove"
    @dblclick="startEditing"
  >
    <textarea
      ref="textarea"
      v-model="note.text"
      :readonly="!editing"
      :class="!editing && 'pointer-events-none'"
      @keydown.esc="($event.target as HTMLTextAreaElement).blur()"
      @blur="editing = false"
      class="size-full resize-none bg-transparent p-3 text-neutral-800 outline-none select-text"
    />
    <template v-if="selected && selectedIds.length === 1">
      <div
        v-for="corner in corners"
        :key="corner.class"
        class="absolute size-3 rounded-full border-2 border-blue-500 bg-white"
        :class="corner.class"
        @pointerdown.stop="startResize($event, corner)"
        @pointermove="onResize"
        @pointerup="start = null"
      />
    </template>
  </div>
</template>
