import { Hono } from 'hono'
import { currentUser } from './auth.js'
import {
  addMember,
  deleteBoard,
  findProfileByEmail,
  getBoard,
  insertBoard,
  insertObject,
  listBoards,
  listObjects,
  renameBoard,
} from './storage.js'

// REST routes for the boards and for the objects on one board.
// Only listing and creating boards look at who is logged in; all other routes check nobody yet.
export const boards = new Hono()

boards.get('/', async (c) => {
  const user = await currentUser(c)
  if (!user) return c.json({ error: 'Not logged in' }, 401)
  return c.json(await listBoards(user.id))
})

// Whoever creates a board becomes its first member.
boards.post('/', async (c) => {
  const user = await currentUser(c)
  if (!user) return c.json({ error: 'Not logged in' }, 401)
  const { id, name } = await c.req.json()
  if (typeof id !== 'string' || typeof name !== 'string') return c.json({ error: 'Board needs an id and a name' }, 400)
  const board = await insertBoard({ id, name })
  if (!board) return c.json({ error: 'A board with this id already exists' }, 409)
  await addMember(board.id, user.id)
  return c.json(board, 201)
})

// Only people who have logged in at least once have a profile and can be found by mail.
boards.post('/:id/members', async (c) => {
  const { email } = await c.req.json()
  const profile = typeof email === 'string' ? await findProfileByEmail(email) : undefined
  if (!profile) return c.json({ error: 'Nobody with this mail has logged in yet' }, 404)
  await addMember(c.req.param('id'), profile.id)
  return c.json({ name: profile.name, avatarUrl: profile.avatarUrl }, 201)
})

boards.get('/:id', async (c) => {
  const board = await getBoard(c.req.param('id'))
  if (!board) return c.json({ error: 'Board not found' }, 404)
  return c.json(board)
})

boards.patch('/:id', async (c) => {
  const { name } = await c.req.json()
  if (typeof name !== 'string') return c.json({ error: 'Board needs a name' }, 400)
  const board = await renameBoard(c.req.param('id'), name)
  if (!board) return c.json({ error: 'Board not found' }, 404)
  return c.json(board)
})

boards.delete('/:id', async (c) => {
  const deleted = await deleteBoard(c.req.param('id'))
  if (!deleted) return c.json({ error: 'Board not found' }, 404)
  return c.body(null, 204)
})

boards.get('/:id/objects', async (c) => {
  const boardId = c.req.param('id')
  if (!(await getBoard(boardId))) return c.json({ error: 'Board not found' }, 404)
  return c.json(await listObjects(boardId))
})

boards.post('/:id/objects', async (c) => {
  const boardId = c.req.param('id')
  const object = await c.req.json()
  if (typeof object.id !== 'string') return c.json({ error: 'Object needs an id' }, 400)
  if (!(await getBoard(boardId))) return c.json({ error: 'Board not found' }, 404)
  const created = await insertObject(boardId, object)
  if (!created) return c.json({ error: 'An object with this id already exists' }, 409)
  return c.json(created, 201)
})
