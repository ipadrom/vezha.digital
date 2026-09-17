import assert from 'node:assert/strict'
import test from 'node:test'
import { mobileCaseCover } from '../utils/caseCoverMedia.ts'

test('mobile covers select only existing high-density companions and retain cache keys', () => {
  assert.equal(mobileCaseCover('/cases/ssag/2026-09/cover-editorial.svg?v=2'), '/cases/ssag/2026-09/cover-editorial-mobile.webp?v=2')
  assert.equal(mobileCaseCover('/cases/gbu-process-automation/2026-09/cover-work-center.svg'), '/cases/gbu-process-automation/2026-09/cover-work-center-mobile.webp')
  assert.equal(mobileCaseCover('/cases/other/cover.svg'), undefined)
  assert.equal(mobileCaseCover(undefined), undefined)
})
