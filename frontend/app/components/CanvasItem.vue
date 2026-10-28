<script setup lang="ts">
import type { Item, ItemKind, Rect } from '~/types/item'

// Stateless: shows an item and reports what the user did. The board decides what changes.

type Corner = 'nw' | 'ne' | 'sw' | 'se'
type Mode = 'move' | Corner

const MIN_SIZE = GRID_SIZE * 3
const KIND_CLASSES: Record<ItemKind, string> = {
  note: 'shadow-md',
  text: '',
  circle: 'rounded-full border-foreground text-center',
}
const HANDLE_CLASSES: Record<Corner, string> = {
  nw: 'left-0 top-0 cursor-nwse-resize',
  ne: 'left-full top-0 cursor-nesw-resize',
  sw: 'left-0 top-full cursor-nesw-resize',
  se: 'left-full top-full cursor-nwse-resize',
}

const props = defineProps<{ item: Readonly<Item>; selected: boolean; editing: boolean }>()
const emit = defineEmits<{ select: []; rect: [rect: Rect]; text: [text: string]; startEdit: []; stopEdit: [] }>()

// Turns the item's attributes into CSS. Text items take the color as ink, all other kinds as their fill.
const itemStyle = computed(() => {
  const { kind, color, fontSize, bold, border } = props.item
  const colors = color && ITEM_COLORS[color]
  return {
    color: kind === 'text' ? colors?.ink : undefined,
    backgroundColor: kind !== 'text' ? colors?.fill : undefined,
    fontSize: fontSize ? `${fontSize}px` : undefined,
    fontWeight: bold ? 600 : undefined,
    borderWidth: border ? `${border}px` : undefined,
  }
})

const scale = inject<Ref<number>>('canvasScale', ref(1))
const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
const content = useTemplateRef<HTMLElement>('content')

// Bookkeeping for the running pointer gesture, not board data.
let interaction: { mode: Mode; startX: number; startY: number; start: Rect } | null = null

function startInteraction(event: PointerEvent, mode: Mode) {
  event.stopPropagation()
  emit('select')
  if (props.editing) return
  const { x, y, width, height } = props.item
  interaction = { mode, startX: event.clientX, startY: event.clientY, start: { x, y, width, height } }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

// Resizing from a north or west corner moves the item so the opposite corner stays put.
function nextRect(mode: Mode, start: Rect, dx: number, dy: number): Rect {
  if (mode === 'move') return { ...start, x: snapToGrid(start.x + dx), y: snapToGrid(start.y + dy) }
  const width = Math.max(MIN_SIZE, snapToGrid(start.width + (mode.endsWith('e') ? dx : -dx)))
  const height = Math.max(MIN_SIZE, snapToGrid(start.height + (mode.startsWith('s') ? dy : -dy)))
  return {
    width,
    height,
    x: mode.endsWith('w') ? start.x + start.width - width : start.x,
    y: mode.startsWith('n') ? start.y + start.height - height : start.y,
  }
}

function onPointerMove(event: PointerEvent) {
  if (!interaction) return
  const dx = (event.clientX - interaction.startX) / scale.value
  const dy = (event.clientY - interaction.startY) / scale.value
  emit('rect', nextRect(interaction.mode, interaction.start, dx, dy))
}

function onPointerUp() {
  interaction = null
}

watch(
  () => props.editing,
  async (editing) => {
    if (!editing) return
    await nextTick()
    textarea.value?.focus()
    textarea.value?.select()
  },
)

// Asks for more height (to the next grid line) when the text no longer fits.
async function fitToContent() {
  await nextTick()
  const element = textarea.value ?? content.value
  if (!element) return
  const needed = Math.max(MIN_SIZE, Math.ceil(element.scrollHeight / GRID_SIZE) * GRID_SIZE)
  const { x, y, width, height } = props.item
  if (needed > height) emit('rect', { x, y, width, height: needed })
}

watch(() => [props.item.text, props.item.width, props.item.height, props.editing], fitToContent)
onMounted(fitToContent)
</script>

<template>
  <div
    class="absolute touch-none"
    :class="[KIND_CLASSES[item.kind], selected ? 'ring-2 ring-blue-300' : '', editing ? 'cursor-text' : 'cursor-move']"
    :style="[
      { left: `${item.x}px`, top: `${item.y}px`, width: `${item.width}px`, height: `${item.height}px` },
      itemStyle,
    ]"
    @pointerdown="startInteraction($event, 'move')"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @dblclick="emit('startEdit')"
  >
    <textarea
      v-if="editing"
      ref="textarea"
      class="size-full p-4 bg-transparent resize-none outline-none"
      :value="item.text"
      @input="emit('text', ($event.target as HTMLTextAreaElement).value)"
      @blur="emit('stopEdit')"
      @keydown.escape="emit('stopEdit')"
    />
    <div v-else ref="content" class="size-full p-4 overflow-hidden whitespace-pre-wrap break-words select-none">
      {{ item.text }}
    </div>

    <template v-if="selected && !editing">
      <div
        v-for="(classes, corner) in HANDLE_CLASSES"
        :key="corner"
        class="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-blue-500 bg-background"
        :class="classes"
        @pointerdown="startInteraction($event, corner)"
      />
    </template>
  </div>
</template>
