import assert from 'node:assert/strict'
import test from 'node:test'
import { useNavigationCases } from '../composables/useNavigationCases.ts'

test('navigation loader uses a Nuxt 3.12 string key and reloads in the selected language', async () => {
  let language: 'ru' | 'en' = 'ru'
  const requested: string[] = []
  const globals = globalThis as any
  const previousApi = globals.useApi
  const previousAsyncData = globals.useAsyncData
  globals.useApi = () => ({ getProjects: async (locale: string) => { requested.push(locale); return [{ slug: 'demo' }] } })
  globals.useAsyncData = (key: unknown, handler: () => Promise<unknown>, options: any) => {
    assert.equal(typeof key, 'string', 'Nuxt 3.12 requires a string cache key')
    return { handler, options }
  }
  try {
    const result = useNavigationCases(() => language) as any
    assert.deepEqual(result.options.default(), [])
    assert.deepEqual(await result.handler(), [{ slug: 'demo' }])
    language = 'en'
    assert.equal(result.options.watch[0](), 'en')
    await result.handler()
    assert.deepEqual(requested, ['ru', 'en'])
  } finally {
    globals.useApi = previousApi
    globals.useAsyncData = previousAsyncData
  }
})
