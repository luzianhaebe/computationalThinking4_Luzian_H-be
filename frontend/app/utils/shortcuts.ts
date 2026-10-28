export type ShortcutAction =
  | 'copy'
  | 'cut'
  | 'paste'
  | 'duplicate'
  | 'delete'
  | 'escape'
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'

// All keyboard shortcuts of the board. `mod` means Cmd on macOS, Ctrl elsewhere.
export const SHORTCUTS: { key: string; mod?: boolean; action: ShortcutAction }[] = [
  { key: 'c', mod: true, action: 'copy' },
  { key: 'x', mod: true, action: 'cut' },
  { key: 'v', mod: true, action: 'paste' },
  { key: 'd', mod: true, action: 'duplicate' },
  { key: 'Backspace', action: 'delete' },
  { key: 'Delete', action: 'delete' },
  { key: 'Escape', action: 'escape' },
  { key: 'ArrowUp', action: 'moveUp' },
  { key: 'ArrowDown', action: 'moveDown' },
  { key: 'ArrowLeft', action: 'moveLeft' },
  { key: 'ArrowRight', action: 'moveRight' },
]

export function findShortcut(event: KeyboardEvent): ShortcutAction | undefined {
  const mod = event.metaKey || event.ctrlKey
  const key = event.key.toLowerCase()
  return SHORTCUTS.find((s) => s.key.toLowerCase() === key && !!s.mod === mod)?.action
}
