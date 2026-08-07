import type { CaseDocument, CaseMeta, CaseRevision, CaseSummary, MediaAsset } from '~/utils/caseBuilder'

export const useCaseAdmin = () => {
  const { fetchWithAuth, token, clearToken } = useAuth()
  const config = useRuntimeConfig()

  const listCases = () => fetchWithAuth<CaseSummary[]>('/cases')
  const getCase = (id: string) => fetchWithAuth<CaseDocument>(`/cases/${id}`)
  const createCase = (meta?: Partial<CaseMeta>) => fetchWithAuth<CaseDocument>('/cases', {
    method: 'POST',
    body: JSON.stringify({ meta: meta || {} }),
  })
  const saveCase = (document: CaseDocument) => fetchWithAuth<CaseDocument>(`/cases/${document.id}`, {
    method: 'PUT',
    body: JSON.stringify({ meta: document.meta, blocks: document.blocks }),
  })
  const publishCase = (id: string) => fetchWithAuth<CaseDocument>(`/cases/${id}/publish`, { method: 'POST' })
  const hideCase = (id: string) => fetchWithAuth<CaseDocument>(`/cases/${id}/hide`, { method: 'POST' })
  const duplicateCase = (id: string) => fetchWithAuth<CaseDocument>(`/cases/${id}/duplicate`, { method: 'POST' })
  const deleteCase = (id: string) => fetchWithAuth<{ message: string }>(`/cases/${id}`, { method: 'DELETE' })
  const listRevisions = (id: string) => fetchWithAuth<CaseRevision[]>(`/cases/${id}/revisions`)
  const restoreRevision = (id: string, revisionId: string) => fetchWithAuth<CaseDocument>(`/cases/${id}/revisions/${revisionId}/restore`, { method: 'POST' })

  const listMedia = () => fetchWithAuth<MediaAsset[]>('/media')
  const uploadMedia = async (file: File): Promise<MediaAsset> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${config.public.apiUrl}/api/admin/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: formData,
    })
    if (response.status === 401) {
      clearToken()
      await navigateTo('/admin/login')
      throw new Error('Сессия завершена')
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      throw new Error(payload?.detail || `Ошибка загрузки: ${response.status}`)
    }
    return response.json()
  }
  const deleteMedia = (id: string) => fetchWithAuth<{ message: string }>(`/media/${id}`, { method: 'DELETE' })
  const updateMedia = (asset: MediaAsset) => fetchWithAuth<MediaAsset>(`/media/${asset.id}`, { method: 'PATCH', body: JSON.stringify({ alt_ru: asset.alt_ru || null, alt_en: asset.alt_en || null }) })

  return {
    listCases,
    getCase,
    createCase,
    saveCase,
    publishCase,
    hideCase,
    duplicateCase,
    deleteCase,
    listRevisions,
    restoreRevision,
    listMedia,
    uploadMedia,
    updateMedia,
    deleteMedia,
  }
}
