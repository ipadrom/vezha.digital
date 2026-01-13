export const useAuth = () => {
  const config = useRuntimeConfig()
  const token = useState<string | null>('auth_token', () => null)
  const admin = useState<any | null>('admin', () => null)

  const apiUrl = config.public.apiUrl

  const isAuthenticated = computed(() => !!token.value)

  const setToken = (newToken: string) => {
    token.value = newToken
    if (import.meta.client) {
      localStorage.setItem('admin_token', newToken)
    }
  }

  const clearToken = () => {
    token.value = null
    admin.value = null
    if (import.meta.client) {
      localStorage.removeItem('admin_token')
    }
  }

  const initAuth = () => {
    if (import.meta.client) {
      const savedToken = localStorage.getItem('admin_token')
      if (savedToken) {
        token.value = savedToken
        fetchAdmin()
      }
    }
  }

  const loginWithTelegram = async (telegramData: any) => {
    const response = await fetch(`${apiUrl}/api/admin/auth/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telegramData),
    })

    if (!response.ok) {
      throw new Error('Authentication failed')
    }

    const data = await response.json()
    setToken(data.access_token)
    await fetchAdmin()
  }

  const fetchAdmin = async () => {
    if (!token.value) return

    try {
      const response = await fetch(`${apiUrl}/api/admin/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      })

      if (response.ok) {
        admin.value = await response.json()
      } else {
        clearToken()
      }
    } catch {
      clearToken()
    }
  }

  const logout = () => {
    clearToken()
    navigateTo('/admin/login')
  }

  const fetchWithAuth = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const response = await fetch(`${apiUrl}/api/admin${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
        ...options.headers,
      },
    })

    if (response.status === 401) {
      clearToken()
      navigateTo('/admin/login')
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  return {
    token,
    admin,
    isAuthenticated,
    initAuth,
    loginWithTelegram,
    logout,
    fetchWithAuth,
  }
}
