import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { deleteObject, insertObject, listObjects, updateObject } from './storage.ts'

const PORT = 3001

// REST API for the board objects. The routes only translate HTTP into storage calls and back.
const app = new Hono()

// The frontend runs on another port, so the browser needs permission to call this API.
app.use('*', cors({ origin: 'http://localhost:3000' }))

app.get('/objects', async (c) => c.json(await listObjects(), 200))

app.post('/objects', async (c) => {
  const body = await c.req.json()
  if (typeof body?.id !== 'string') return c.json({ error: 'id is required' }, 400)
  if (!(await insertObject(body))) return c.json({ error: 'id already exists' }, 409)
  return c.json(body, 201)
})

app.patch('/objects/:id', async (c) => {
  const updated = await updateObject(c.req.param('id'), await c.req.json())
  return updated ? c.json(updated, 200) : c.json({ error: 'not found' }, 404)
})

app.delete('/objects/:id', async (c) => {
  const deleted = await deleteObject(c.req.param('id'))
  return deleted ? c.body(null, 204) : c.json({ error: 'not found' }, 404)
})

serve({ fetch: app.fetch, port: PORT }, () => console.log(`Backend running on http://localhost:${PORT}`))
