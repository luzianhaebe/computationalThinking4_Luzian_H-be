import type { BoardObject, ObjectTemplate, Rect, StyleChanges, TextObject } from '~/types/canvas-object'

const TEXT_DEFAULTS = { text: '', fontSize: FONT_SIZES.M, bold: false }

// Starting attributes of a new object, per variant. Only variants with text get text attributes.
const DEFAULTS: Record<BoardObject['type'], Rect & Partial<TextObject>> = {
  'sticky-note': { x: 0, y: 0, width: GRID_SIZE * 8, height: GRID_SIZE * 8, ...TEXT_DEFAULTS },
  'text': { x: 0, y: 0, width: GRID_SIZE * 10, height: GRID_SIZE * 3, ...TEXT_DEFAULTS },
  'circle': { x: 0, y: 0, width: GRID_SIZE * 6, height: GRID_SIZE * 6 },
}

type Changes = Partial<Rect> & StyleChanges & { text?: string }

const API = 'http://localhost:3001/objects'
const DRAG_PAUSE_MS = 300

// Changes from dragging and resizing wait here per object until the pointer pauses.
// Module level, so every caller of useBoard shares them (the gesture calls useBoard on its own).
const pendingChanges = new Map<string, Changes>()
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>()

// Tells the backend about a change. The local state is already updated, so a failure is only logged.
function send(method: 'POST' | 'PATCH' | 'DELETE', path: string, body?: object) {
  $fetch(`${API}${path}`, { method, body }).catch(error => console.error(`${method} ${path} failed`, error))
}

// The board state is the single source of truth for which objects exist and what they look like.
// Components only read it; every change goes through one of the functions below.
// Each function changes the local state first and then tells the backend.
export function useBoard() {
  const objects = useState<BoardObject[]>('objects', () => [])
  const loaded = useState('objects-loaded', () => false)

  // On start, the board is filled once from the backend.
  if (import.meta.client && !loaded.value) {
    loaded.value = true
    $fetch<BoardObject[]>(API)
      .then(list => (objects.value = list))
      .catch(error => console.error('Loading the board failed', error))
  }

  function addObject(template: ObjectTemplate, centerX: number, centerY: number) {
    const defaults = DEFAULTS[template.type]
    const id = crypto.randomUUID()
    const x = snapToGrid(centerX - defaults.width / 2)
    const y = snapToGrid(centerY - defaults.height / 2)
    const object = { ...defaults, ...template, id, x, y } as BoardObject
    objects.value = [...objects.value, object]
    send('POST', '', object)
    return id
  }

  // Works for every variant: the copy keeps all attributes except the id.
  function addCopy(source: BoardObject) {
    const id = crypto.randomUUID()
    const copy = { ...source, id }
    objects.value = [...objects.value, copy]
    send('POST', '', copy)
    return id
  }

  function removeObject(id: string) {
    objects.value = objects.value.filter(object => object.id !== id)
    clearTimeout(pendingTimers.get(id))
    pendingTimers.delete(id)
    pendingChanges.delete(id)
    send('DELETE', `/${id}`)
  }

  function updateObject(id: string, changes: Changes) {
    objects.value = objects.value.map(object => (object.id === id ? ({ ...object, ...changes } as BoardObject) : object))
  }

  // Collects changes and sends a single PATCH once nothing has changed for DRAG_PAUSE_MS.
  function updateObjectLater(id: string, changes: Changes) {
    updateObject(id, changes)
    pendingChanges.set(id, { ...pendingChanges.get(id), ...changes })
    clearTimeout(pendingTimers.get(id))
    pendingTimers.set(id, setTimeout(() => {
      send('PATCH', `/${id}`, pendingChanges.get(id))
      pendingChanges.delete(id)
      pendingTimers.delete(id)
    }, DRAG_PAUSE_MS))
  }

  function moveObject(id: string, x: number, y: number) {
    updateObjectLater(id, { x, y })
  }

  function resizeObject(id: string, rect: Rect) {
    updateObjectLater(id, rect)
  }

  function updateText(id: string, text: string) {
    updateObject(id, { text })
    send('PATCH', `/${id}`, { text })
  }

  function updateStyle(id: string, changes: StyleChanges) {
    updateObject(id, changes)
    send('PATCH', `/${id}`, changes)
  }

  return { objects: readonly(objects), addObject, addCopy, removeObject, moveObject, resizeObject, updateText, updateStyle }
}
