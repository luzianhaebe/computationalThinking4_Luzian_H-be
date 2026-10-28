import type { Item, ItemColor, ItemKind, ItemStyle } from '~/types/item'

// fill colors surfaces (post-it, circle), ink colors text.
export const ITEM_COLORS: Record<ItemColor, { label: string; fill: string; ink: string }> = {
  neutral: { label: 'Weiß', fill: '#ffffff', ink: '#171717' },
  yellow: { label: 'Gelb', fill: '#fef08a', ink: '#ca8a04' },
  orange: { label: 'Orange', fill: '#fed7aa', ink: '#ea580c' },
  pink: { label: 'Rosa', fill: '#fbcfe8', ink: '#db2777' },
  green: { label: 'Grün', fill: '#bbf7d0', ink: '#16a34a' },
  blue: { label: 'Blau', fill: '#bfdbfe', ink: '#2563eb' },
  purple: { label: 'Lila', fill: '#e9d5ff', ink: '#9333ea' },
}

// `style` lists exactly the attributes an item of this kind has.
export const ITEM_DEFAULTS: Record<ItemKind, { width: number; height: number; text: string; style: Partial<ItemStyle> }> = {
  note: { width: GRID_SIZE * 8, height: GRID_SIZE * 8, text: '', style: { color: 'yellow', fontSize: 18, bold: false } },
  text: { width: GRID_SIZE * 8, height: GRID_SIZE * 3, text: 'Text', style: { color: 'neutral', fontSize: 18, bold: false } },
  circle: {
    width: GRID_SIZE * 8,
    height: GRID_SIZE * 8,
    text: '',
    style: { color: 'neutral', fontSize: 18, bold: false, border: 2 },
  },
}

// Creates an item centered on the given world point, snapped to the grid.
export function createItem(kind: ItemKind, x: number, y: number): Item {
  const { width, height, text, style } = ITEM_DEFAULTS[kind]
  return {
    id: crypto.randomUUID(),
    kind,
    x: snapToGrid(x - width / 2),
    y: snapToGrid(y - height / 2),
    width,
    height,
    text,
    ...style,
  }
}
