import type { Context } from 'hono'
import type { CookieOptions } from 'hono/utils/cookie'
import { createServerClient } from '@supabase/ssr'
import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { saveProfile } from './storage.js'

// Where the browser goes after logging in.
const FRONTEND_URL = 'http://localhost:3000'

// Login with Google runs entirely in the backend. Supabase keeps the session in cookies that only
// this server sets and reads (httpOnly), so the frontend never talks to Supabase itself.
function supabaseFor(c: Context) {
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    cookieOptions: { httpOnly: true, sameSite: 'lax', secure: false, path: '/' },
    cookies: {
      getAll: () => Object.entries(getCookie(c)).map(([name, value]) => ({ name, value })),
      setAll: cookies => cookies.forEach(({ name, value, options }) => setCookie(c, name, value, options as CookieOptions)),
    },
  })
}

// The logged-in user from the request's cookies, or null. Routes that need a user call this themselves.
export async function currentUser(c: Context) {
  const { data } = await supabaseFor(c).auth.getUser()
  return data.user
}

export const auth = new Hono()

// Sends the browser to Google (via Supabase); Google sends it back to /auth/callback.
auth.get('/login', async (c) => {
  const { data, error } = await supabaseFor(c).auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: new URL('/auth/callback', c.req.url).href },
  })
  if (error) return c.json({ error: error.message }, 500)
  return c.redirect(data.url)
})

// Trades the one-time code from Google for a session, stores it in cookies, saves the profile
// (new or updated, so others can find this user by mail) and returns to the frontend.
auth.get('/callback', async (c) => {
  const code = c.req.query('code')
  if (code) {
    const { data, error } = await supabaseFor(c).auth.exchangeCodeForSession(code)
    if (error) console.error('Login failed:', error.message)
    else await saveProfile({ id: data.user.id, email: data.user.email!, ...profileOf(data.user) })
  }
  return c.redirect(FRONTEND_URL)
})

// Who is logged in, as far as the frontend needs to know.
auth.get('/me', async (c) => {
  const user = await currentUser(c)
  if (!user) return c.json({ error: 'Not logged in' }, 401)
  return c.json(profileOf(user))
})

// Google puts name and avatar into the user's metadata.
function profileOf(user: { email?: string; user_metadata: Record<string, string | undefined> }) {
  const { full_name, name, avatar_url } = user.user_metadata
  return { name: full_name ?? name ?? user.email ?? null, avatarUrl: avatar_url ?? null }
}

// Ends the session at Supabase and clears the cookies.
auth.post('/logout', async (c) => {
  await supabaseFor(c).auth.signOut()
  return c.body(null, 204)
})
