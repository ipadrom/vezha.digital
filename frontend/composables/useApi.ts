export const useApi = () => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl

  const fetchApi = async <T>(
    endpoint: string,
    options: RequestInit = {},
    lang?: string
  ): Promise<T> => {
    const url = new URL(`${apiUrl}/api${endpoint}`)

    // Get locale safely
    let currentLang = lang || 'ru'
    try {
      const { locale } = useI18n()
      currentLang = locale.value || 'ru'
    } catch {
      // useI18n not available, use default
    }

    url.searchParams.set('lang', currentLang)

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', response.status, errorText)
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  // Public API
  const getServices = () => fetchApi<any[]>('/services')
  const getProjects = () => fetchApi<any[]>('/projects')
  const getAdvantages = () => fetchApi<any[]>('/advantages')
  const getTechStack = () => fetchApi<any[]>('/tech-stack')
  const getWorkStages = () => fetchApi<any[]>('/work-stages')
  const getSettings = () => fetchApi<{ settings: Record<string, string> }>('/settings')

  const submitContact = (data: { name: string; contact: string; message: string }) => {
    // Convert reactive to plain object
    const plainData = {
      name: data.name,
      contact: data.contact,
      message: data.message,
    }

    return fetchApi<{ success: boolean; message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(plainData),
    })
  }

  return {
    fetchApi,
    getServices,
    getProjects,
    getAdvantages,
    getTechStack,
    getWorkStages,
    getSettings,
    submitContact,
  }
}
