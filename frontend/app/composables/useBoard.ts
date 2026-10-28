import type { Item, ItemKind, ItemStyle, Rect } from '~/types/item'

// Single source of truth for everything on the board.
// Components read `items`, but only the functions below may change them.
export function useBoard() {
  const items = useState<Item[]>('board-items', () => [
    { ...createItem('note', 0, 0), x: 120, y: 120, text: 'Hello, board!' },
  ])

  function find(id: string) {
    return items.value.find((i) => i.id === id)
  }

  function update(id: string, changes: Partial<Item>) {
    const item = find(id)
    if (item) Object.assign(item, changes)
  }

  function addItem(kind: ItemKind, x: number, y: number) {
    items.value.push(createItem(kind, x, y))
  }

  // Adds a copy shifted by (dx, dy) and returns its id.
  function insertCopy(item: Readonly<Item>, dx: number, dy: number) {
    const copy = { ...item, id: crypto.randomUUID(), x: item.x + dx, y: item.y + dy }
    items.value.push(copy)
    return copy.id
  }

  function removeItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  function setRect(id: string, rect: Rect) {
    update(id, rect)
  }

  function moveBy(id: string, dx: number, dy: number) {
    const item = find(id)
    if (item) update(id, { x: item.x + dx, y: item.y + dy })
  }

  function setText(id: string, text: string) {
    update(id, { text })
  }

  function setStyle(id: string, changes: Partial<ItemStyle>) {
    update(id, changes)
  }

  return { items: readonly(items), addItem, insertCopy, removeItem, setRect, moveBy, setText, setStyle }
}
