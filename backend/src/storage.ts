import { readFile, writeFile } from 'node:fs/promises'

// The only place that knows where the board is stored. Routes call the four functions below
// and never touch the file, so the storage can later be swapped for a database.

export type StoredObject = { id: string } & Record<string, unknown>

const FILE = new URL('../data/board.json', import.meta.url)

async function read(): Promise<StoredObject[]> {
  return JSON.parse(await readFile(FILE, 'utf8'))
}

async function write(objects: StoredObject[]) {
  await writeFile(FILE, `${JSON.stringify(objects, null, 2)}\n`)
}

export async function listObjects() {
  return read()
}

// Returns false if an object with this id already exists.
export async function insertObject(object: StoredObject) {
  const objects = await read()
  if (objects.some((o) => o.id === object.id)) return false
  await write([...objects, object])
  return true
}

// Returns the updated object, or undefined if there is none with this id. The id itself never changes.
export async function updateObject(id: string, changes: Record<string, unknown>) {
  const objects = await read()
  const existing = objects.find((o) => o.id === id)
  if (!existing) return undefined
  const updated = { ...existing, ...changes, id }
  await write(objects.map((o) => (o.id === id ? updated : o)))
  return updated
}

// Returns false if there is no object with this id.
export async function deleteObject(id: string) {
  const objects = await read()
  if (!objects.some((o) => o.id === id)) return false
  await write(objects.filter((o) => o.id !== id))
  return true
}
