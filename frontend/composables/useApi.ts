import type {IService} from "~/utils/interfaces/IService";
import type {IProjects} from "~/utils/interfaces/IProjects";
import type {IAdvantages} from "~/utils/interfaces/IAdvantages";
import type {ITechStack} from "~/utils/interfaces/ITechStack";
import type {IWorkStages} from "~/utils/interfaces/IWorkStages";
import type {ISettings} from "~/utils/interfaces/ISettings";

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
  const getServiceId = (service_id: string) => fetchApi<IService>(`/services/${service_id}`)
  const getServices = () => fetchApi<IService[]>('/services')
  const getProjects = () => fetchApi<IProjects[]>('/projects')
  const getAdvantages = () => fetchApi<IAdvantages[]>('/advantages')
  const getTechStack = () => fetchApi<ITechStack[]>('/tech-stack')
  const getWorkStages = () => fetchApi<IWorkStages[]>('/work-stages')
  const getSettings = () => fetchApi<ISettings>('/settings')

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
    getServiceId,
    getServices,
    getProjects,
    getAdvantages,
    getTechStack,
    getWorkStages,
    getSettings,
    submitContact,
  }
}
