export function useNavigationCases(locale: () => 'ru' | 'en') {
  const { getProjects } = useApi()
  return useAsyncData(`navigation-cases-${locale()}`, () => getProjects(locale()), { default: () => [], watch: [locale] })
}
