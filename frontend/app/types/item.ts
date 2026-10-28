export type ItemKind = 'note' | 'text' | 'circle'
export type ItemColor = 'neutral' | 'yellow' | 'orange' | 'pink' | 'green' | 'blue' | 'purple'

// Optional attributes: an item only has the ones its kind supports.
export interface ItemStyle {
  color: ItemColor
  fontSize: number
  bold: boolean
  border: number
}

export type Item = {
  id: string
  kind: ItemKind
  x: number
  y: number
  width: number
  height: number
  text: string
} & Partial<ItemStyle>

export type Rect = Pick<Item, 'x' | 'y' | 'width' | 'height'>
