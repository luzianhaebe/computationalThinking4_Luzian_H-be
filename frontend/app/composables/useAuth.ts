export interface User {
  name: string
  avatarUrl: string | null
}

// Who is logged in. The backend does the login and keeps the session in cookies,
// so every request here sends those cookies along; the frontend never talks to Supabase.
export function useAuth() {
  const apiBase = useRuntimeConfig().public.apiBase
  const api = $fetch.create({ baseURL: apiBase, credentials: 'include' })
  const user = useState<User | null>('user', () => null)

  // Not being logged in (401) is a normal state, not an error.
  async function load() {
    try {
      user.value = await api<User>('/auth/me')
    }
    catch (error) {
      if ((error as { statusCode?: number }).statusCode !== 401) throw error
      user.value = null
    }
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' })
    user.value = null
  }

  // Login is a full page navigation: backend → Google → backend → back to the frontend.
  return { user: readonly(user), loginUrl: `${apiBase}/auth/login`, load, logout }
}
