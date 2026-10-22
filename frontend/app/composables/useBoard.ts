export interface Note {
  id: string
  x: number
  y: number
  width: number
  height: number
  text: string
}

export const GRID = 24
export const NOTE_SIZE = GRID * 7

export function snap(value: number) {
  return Math.round(value / GRID) * GRID
}

export function useBoard() {
  const notes = useState<Note[]>('notes', () => [])
  const pan = useState('pan', () => ({ x: 0, y: 0 }))
  const placing = useState('placing', () => false)
  const selectedIds = useState<string[]>('selectedIds', () => [])

  function addNote(x: number, y: number) {
    notes.value.push({ id: crypto.randomUUID(), x: snap(x), y: snap(y), width: NOTE_SIZE, height: NOTE_SIZE, text: '' })
  }

  return { notes, pan, placing, selectedIds, addNote }
}
